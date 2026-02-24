"""LSTM-specific compilation pass.

Compiles an LSTM layer into accelerator instructions:
  Per timestep t:
    1. gates_ih = W_ih @ x_t          (4H, I) @ (I, B)
    2. gates_hh = W_hh @ h_{t-1}      (4H, H) @ (H, B)
    3. gates = gates_ih + gates_hh + bias
    4. Split into i, f, g, o (each H rows)
    5. i = sigmoid(i), f = sigmoid(f), g = tanh(g), o = sigmoid(o)
    6. c_t = f * c_{t-1} + i * g
    7. h_t = o * tanh(c_t)
  After all timesteps:
    8. output = fc_weight @ h_T + fc_bias (optional)
"""
from __future__ import annotations
import numpy as np
from .instruction import Instruction, Opcode, Program
from .tiler import create_tiling_plan
from .scheduler import schedule_matmul
from ..config import AcceleratorConfig


def compile_lstm_inference(
    weights: dict[str, np.ndarray],
    fc_weights: dict[str, np.ndarray] | None,
    input_data: np.ndarray,
    config: AcceleratorConfig,
) -> tuple[Program, dict]:
    """Compile a full LSTM inference into an instruction program.

    Args:
        weights: Dict with keys weight_ih (4H,I), weight_hh (4H,H), bias_ih (4H,), bias_hh (4H,)
        fc_weights: Dict with keys weight (O,H), bias (O,) or None
        input_data: Shape (seq_len, input_size) or (seq_len, batch, input_size)
        config: Accelerator configuration

    Returns:
        (program, preload_data) where preload_data maps DRAM keys to numpy arrays
    """
    W_ih = weights['weight_ih']  # (4H, I)
    W_hh = weights['weight_hh']  # (4H, H)
    b_ih = weights['bias_ih']    # (4H,)
    b_hh = weights['bias_hh']    # (4H,)
    hidden_size = W_ih.shape[0] // 4
    input_size = W_ih.shape[1]
    four_h = 4 * hidden_size

    if input_data.ndim == 2:
        seq_len, inp_sz = input_data.shape
        batch_size = 1
        input_data = input_data.reshape(seq_len, inp_sz, 1)  # (T, I, B)
    else:
        seq_len, batch_size, inp_sz = input_data.shape
        input_data = input_data.transpose(0, 2, 1)  # (T, I, B)

    N = config.array_size
    bias_combined = (b_ih + b_hh).reshape(four_h, 1)

    # Prepare DRAM preload data
    preload = {}

    # Tile weight matrices and preload
    ih_plan = create_tiling_plan(four_h, input_size, batch_size, N)
    hh_plan = create_tiling_plan(four_h, hidden_size, batch_size, N)

    # Preload weight tiles
    for tile in ih_plan.tiles:
        k = f"W_ih_k{tile.k_start}_n{tile.n_start}"
        preload[k] = W_ih[tile.m_start:tile.m_end, tile.k_start:tile.k_end]
    for tile in hh_plan.tiles:
        k = f"W_hh_k{tile.k_start}_n{tile.n_start}"
        preload[k] = W_hh[tile.m_start:tile.m_end, tile.k_start:tile.k_end]

    # Build program
    prog = Program()
    prog.metadata.update({
        'hidden_size': hidden_size,
        'input_size': input_size,
        'seq_len': seq_len,
        'batch_size': batch_size,
        'ih_tiling': ih_plan,
        'hh_tiling': hh_plan,
    })

    for t in range(seq_len):
        tp = f"t{t}: "

        # Preload x_t input tiles
        for tile in ih_plan.tiles:
            x_key = f"x_{t}_m{tile.m_start}_k{tile.k_start}"
            preload[x_key] = input_data[t, tile.k_start:tile.k_end, :]

        # 1. gates_ih = W_ih @ x_t
        ih_prog = schedule_matmul(ih_plan, f"x_{t}", "W_ih", f"gates_ih_{t}",
                                  comment_prefix=f"{tp}ih ")
        for inst in ih_prog:
            prog.add(inst)

        # 2. gates_hh = W_hh @ h_{t-1}
        # h_0 is zero (preloaded), subsequent h comes from previous step
        h_key = f"h_{t-1}" if t > 0 else "h_init"
        if t == 0:
            # Preload zero h_init tiles
            for tile in hh_plan.tiles:
                hk = f"h_init_m{tile.m_start}_k{tile.k_start}"
                preload[hk] = np.zeros((tile.K, batch_size), dtype=np.float64)

        hh_prog = schedule_matmul(hh_plan, h_key, "W_hh", f"gates_hh_{t}",
                                  comment_prefix=f"{tp}hh ")
        for inst in hh_prog:
            prog.add(inst)

        # 3. gates = gates_ih + gates_hh (combine all output tiles)
        # For simplicity, we assume the results are assembled in output SRAM
        prog.add(Instruction(
            opcode=Opcode.ELEM_ADD,
            src1=f"gates_ih_{t}_m0_n0",
            src2=f"gates_hh_{t}_m0_n0",
            dst=f"gates_{t}",
            comment=f"{tp}gates = gates_ih + gates_hh",
        ))

        # Add bias (preloaded as a "matrix")
        bias_key = f"bias_{t}"
        preload[bias_key] = np.broadcast_to(bias_combined, (four_h, batch_size)).copy()
        prog.add(Instruction(
            opcode=Opcode.LOAD_INPUT,
            src1=bias_key,
            dst=bias_key,
            comment=f"{tp}load bias",
        ))
        prog.add(Instruction(
            opcode=Opcode.ELEM_ADD,
            src1=f"gates_{t}",
            src2=bias_key,
            dst=f"gates_{t}",
            comment=f"{tp}gates += bias",
        ))

        # 4-5. Split gates and apply activations
        # i = sigmoid(gates[0:H])
        # f = sigmoid(gates[H:2H])
        # g = tanh(gates[2H:3H])
        # o = sigmoid(gates[3H:4H])
        # We model gate splitting as part of the activation instructions
        for gate_name, start, act in [
            ("i", 0, Opcode.ACT_SIGMOID),
            ("f", hidden_size, Opcode.ACT_SIGMOID),
            ("g", 2 * hidden_size, Opcode.ACT_TANH),
            ("o", 3 * hidden_size, Opcode.ACT_SIGMOID),
        ]:
            prog.add(Instruction(
                opcode=act,
                src1=f"gates_{t}",  # Controller slices internally or we pre-slice
                dst=f"{gate_name}_{t}",
                comment=f"{tp}{gate_name} = {'sigmoid' if act == Opcode.ACT_SIGMOID else 'tanh'}(gates[{start}:{start+hidden_size}])",
            ))

        # 6. c_t = f * c_{t-1} + i * g
        c_prev = f"c_{t-1}" if t > 0 else "c_init"
        if t == 0:
            preload["c_init"] = np.zeros((hidden_size, batch_size), dtype=np.float64)

        prog.add(Instruction(
            opcode=Opcode.ELEM_MUL,
            src1=f"f_{t}", src2=c_prev, dst=f"fc_{t}",
            comment=f"{tp}f * c_{{t-1}}",
        ))
        prog.add(Instruction(
            opcode=Opcode.ELEM_MUL,
            src1=f"i_{t}", src2=f"g_{t}", dst=f"ig_{t}",
            comment=f"{tp}i * g",
        ))
        prog.add(Instruction(
            opcode=Opcode.ELEM_ADD,
            src1=f"fc_{t}", src2=f"ig_{t}", dst=f"c_{t}",
            comment=f"{tp}c_t = f*c + i*g",
        ))

        # 7. h_t = o * tanh(c_t)
        prog.add(Instruction(
            opcode=Opcode.ACT_TANH,
            src1=f"c_{t}", dst=f"tanh_c_{t}",
            comment=f"{tp}tanh(c_t)",
        ))
        prog.add(Instruction(
            opcode=Opcode.ELEM_MUL,
            src1=f"o_{t}", src2=f"tanh_c_{t}", dst=f"h_{t}",
            comment=f"{tp}h_t = o * tanh(c_t)",
        ))

        # Prepare h_t tiles for next timestep's hh matmul
        if t < seq_len - 1:
            for tile in hh_plan.tiles:
                h_tile_key = f"h_{t}_m{tile.m_start}_k{tile.k_start}"
                # This will be filled at runtime; preload placeholder
                # The controller will use h_{t} from output SRAM

    # 8. Optional FC layer
    if fc_weights is not None:
        fc_w = fc_weights['weight']   # (O, H)
        fc_b = fc_weights.get('bias')  # (O,)
        O, H = fc_w.shape
        fc_plan = create_tiling_plan(O, H, batch_size, N)

        for tile in fc_plan.tiles:
            k = f"fc_w_k{tile.k_start}_n{tile.n_start}"
            preload[k] = fc_w[tile.m_start:tile.m_end, tile.k_start:tile.k_end]

        # h_T is the last hidden state
        fc_prog = schedule_matmul(fc_plan, f"h_{seq_len-1}", "fc_w", "fc_out",
                                  comment_prefix="fc ")
        for inst in fc_prog:
            prog.add(inst)

        if fc_b is not None:
            fc_bias_key = "fc_bias"
            preload[fc_bias_key] = np.broadcast_to(
                fc_b.reshape(-1, 1), (O, batch_size)
            ).copy()
            prog.add(Instruction(
                opcode=Opcode.LOAD_INPUT,
                src1=fc_bias_key, dst=fc_bias_key,
                comment="fc bias load",
            ))
            prog.add(Instruction(
                opcode=Opcode.ELEM_ADD,
                src1="fc_out_m0_n0", src2=fc_bias_key, dst="output",
                comment="output = fc_out + bias",
            ))

    return prog, preload
