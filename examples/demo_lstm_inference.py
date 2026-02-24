"""Demo: LSTM inference on the accelerator simulator."""
import sys
sys.path.insert(0, "C:/dev/Tesla")

import numpy as np
from accsim.models.lstm import lstm_forward
from accsim.core.controller import Controller
from accsim.compiler.instruction import Instruction, Opcode, Program
from accsim.config import AcceleratorConfig
from accsim.analysis.metrics import compute_metrics


def demo_tiny_lstm():
    """Run a tiny LSTM (input=2, hidden=4) through the simulator and compare."""
    print("=" * 60)
    print("AccSim: Tiny LSTM Inference Demo")
    print("=" * 60)

    input_size = 2
    hidden_size = 4
    seq_len = 3

    rng = np.random.default_rng(42)
    W_ih = rng.standard_normal((4 * hidden_size, input_size))
    W_hh = rng.standard_normal((4 * hidden_size, hidden_size))
    b_ih = rng.standard_normal(4 * hidden_size)
    b_hh = rng.standard_normal(4 * hidden_size)
    input_seq = rng.standard_normal((seq_len, input_size))

    # NumPy reference
    all_h, h_ref, c_ref = lstm_forward(input_seq, W_ih, W_hh, b_ih, b_hh)
    print(f"\nReference h_final: {h_ref.squeeze()}")

    # Simulate step by step using controller
    # Systolic array computes C = A @ W, so for gates = W_ih @ x_t:
    #   A = W_ih (src1, in input_buf), W = x_t (src2, in weight_buf)
    config = AcceleratorConfig(array_size=4)
    ctrl = Controller(config)

    # Pre-load weight matrices to input_buf (they are the "A" in C = A @ W)
    ctrl.preload_to_sram('input', 'W_ih', W_ih)
    ctrl.preload_to_sram('input', 'W_hh', W_hh)
    bias = (b_ih + b_hh).reshape(-1, 1)

    h = np.zeros((hidden_size, 1), dtype=np.float64)
    c = np.zeros((hidden_size, 1), dtype=np.float64)

    prog = Program()

    for t in range(seq_len):
        x_t = input_seq[t].reshape(-1, 1)

        # gates_ih = W_ih @ x_t  -> MATMUL(A=W_ih, W=x_t)
        ctrl.preload_to_sram('weight', f'x_{t}', x_t)
        prog.add(Instruction(opcode=Opcode.MATMUL, src1='W_ih', src2=f'x_{t}',
                             dst=f'gates_ih_{t}', M=4*hidden_size, K=input_size, N=1))

        # gates_hh = W_hh @ h -> MATMUL(A=W_hh, W=h)
        ctrl.preload_to_sram('weight', f'h_{t}', h)
        prog.add(Instruction(opcode=Opcode.MATMUL, src1='W_hh', src2=f'h_{t}',
                             dst=f'gates_hh_{t}', M=4*hidden_size, K=hidden_size, N=1))

        # gates = ih + hh + bias
        prog.add(Instruction(opcode=Opcode.ELEM_ADD,
                             src1=f'gates_ih_{t}', src2=f'gates_hh_{t}', dst=f'gates_{t}'))
        ctrl.preload_to_sram('output', f'bias_{t}', bias)
        prog.add(Instruction(opcode=Opcode.ELEM_ADD,
                             src1=f'gates_{t}', src2=f'bias_{t}', dst=f'gates_{t}'))

    stats = ctrl.execute_program(prog)

    print(f"\nSimulation stats:")
    print(f"  Total cycles: {stats['total_cycles']}")
    print(f"  Instructions: {stats['instruction_count']}")
    print(f"  Array utilization: {stats['array_utilization']:.1%}")

    # Verify matmul portion by checking gates computation
    gates_ih = ctrl.get_sram_data('output', f'gates_ih_0')
    expected_gates_ih = W_ih @ input_seq[0].reshape(-1, 1)
    error = np.max(np.abs(gates_ih - expected_gates_ih))
    print(f"\n  Gates_ih verification (t=0): max error = {error:.2e}")
    print(f"  Match: {'PASS' if error < 1e-10 else 'FAIL'}")


if __name__ == "__main__":
    demo_tiny_lstm()
