"""Simulation execution bridge — wraps existing AccSim modules into JSON-ready API functions."""
from __future__ import annotations
import numpy as np

from ..config import AcceleratorConfig, DEFAULT_CONFIG
from ..core.clock import Clock
from ..core.systolic_array import SystolicArray
from ..core.controller import Controller
from ..compiler.instruction import Instruction, Opcode, Program
from ..compiler.tiler import create_tiling_plan
from ..analysis.metrics import compute_metrics, compute_theoretical_utilization
from .korean import build_korean_summary, OPCODE_KR, CYCLE_CATEGORY_KR


def get_hardware_config(array_size: int = 8, clock_ghz: float = 1.0) -> dict:
    """Return hardware config summary."""
    config = AcceleratorConfig(array_size=array_size, clock_freq_hz=clock_ghz * 1e9)
    return config.to_dict()


def run_matmul_demo(array_size: int = 8, m: int = 8, k: int = 8, n: int = 8,
                    clock_ghz: float = 1.0) -> dict:
    """Run matrix multiplication demo, return all results as JSON-ready dict."""
    config = AcceleratorConfig(array_size=array_size, clock_freq_hz=clock_ghz * 1e9)
    rng = np.random.default_rng(42)

    # Clamp matrix dims to array size for single-tile execution
    tile_m = min(m, array_size)
    tile_k = min(k, array_size)
    tile_n = min(n, array_size)

    A = rng.standard_normal((tile_m, tile_k))
    W = rng.standard_normal((tile_k, tile_n))

    clock = Clock()
    sa = SystolicArray(array_size, clock)
    result, cycles = sa.execute_matmul(A, W)
    expected = A @ W
    error = float(np.max(np.abs(result - expected)))
    util = sa.get_utilization()
    pe_utils = sa.get_pe_utilizations().tolist()
    theo_util = compute_theoretical_utilization(tile_m, tile_k, tile_n, array_size)

    # Tiling plan for full matrix
    plan = create_tiling_plan(m, k, n, array_size)

    # Animation frames from cycle log
    animation_frames = _extract_animation_frames(sa)

    # Array size scaling
    scaling = []
    for sz in [4, 8, 16]:
        clk = Clock()
        sa_tmp = SystolicArray(sz, clk)
        sm, sk, sn = min(m, sz), min(k, sz), min(n, sz)
        At = rng.standard_normal((sm, sk))
        Wt = rng.standard_normal((sk, sn))
        _, cyc = sa_tmp.execute_matmul(At, Wt)
        t_util = compute_theoretical_utilization(sm, sk, sn, sz)
        scaling.append({'array_size': sz, 'cycles': cyc, 'theoretical_util': t_util})

    # Build metrics
    total_ops = tile_m * tile_k * tile_n
    config_dict = config.to_dict()
    metrics = {
        'total_cycles': cycles,
        'matmul_cycles': cycles,
        'memory_cycles': 0,
        'activation_cycles': 0,
        'elementwise_cycles': 0,
        'instruction_count': 1,
        'pe_utilization': util,
        'total_ops': total_ops,
        'arithmetic_intensity': total_ops / ((tile_m * tile_k + tile_k * tile_n + tile_m * tile_n) * config.bytes_per_element) if (tile_m * tile_k + tile_k * tile_n + tile_m * tile_n) > 0 else 0,
        'achieved_gops': total_ops * util / cycles * config.clock_freq_hz / 1e9 if cycles > 0 else 0,
        'cycle_breakdown': {'matmul': cycles, 'memory': 0, 'activation': 0, 'elementwise': 0},
    }

    korean = build_korean_summary(metrics, config_dict)

    return {
        'demo_type': 'matmul',
        'config': config_dict,
        'params': {'M': m, 'K': k, 'N': n, 'tile_M': tile_m, 'tile_K': tile_k, 'tile_N': tile_n},
        'metrics': metrics,
        'pe_heatmap': pe_utils,
        'theoretical_util': theo_util,
        'max_error': error,
        'match': error < 1e-10,
        'tiling_plan': {
            'num_tiles': plan.num_tiles,
            'num_weight_loads': plan.num_weight_loads,
        },
        'scaling': scaling,
        'animation_frames': animation_frames,
        'timeline': [{'opcode': 'MATMUL', 'opcode_kr': OPCODE_KR['MATMUL'],
                       'start_cycle': 0, 'end_cycle': cycles, 'cycles': cycles}],
        'korean': korean,
        'comparison': {
            'hw_sample': result.flatten()[:5].tolist(),
            'sw_sample': expected.flatten()[:5].tolist(),
            'max_abs_error': error,
            'match': error < 1e-10,
        },
    }


def run_lstm_demo(array_size: int = 4, clock_ghz: float = 1.0, seq_len: int = 3) -> dict:
    """Run tiny LSTM demo through the controller."""
    from ..models.lstm import lstm_forward

    input_size = 2
    hidden_size = 4
    seq_len = max(1, min(seq_len, 64))  # clamp to safe range
    config = AcceleratorConfig(array_size=array_size, clock_freq_hz=clock_ghz * 1e9)

    rng = np.random.default_rng(42)
    W_ih = rng.standard_normal((4 * hidden_size, input_size))
    W_hh = rng.standard_normal((4 * hidden_size, hidden_size))
    b_ih = rng.standard_normal(4 * hidden_size)
    b_hh = rng.standard_normal(4 * hidden_size)
    input_seq = rng.standard_normal((seq_len, input_size))

    # NumPy reference
    all_h, h_ref, c_ref = lstm_forward(input_seq, W_ih, W_hh, b_ih, b_hh)

    # Simulate via controller
    ctrl = Controller(config)
    ctrl.preload_to_sram('input', 'W_ih', W_ih)
    ctrl.preload_to_sram('input', 'W_hh', W_hh)
    bias = (b_ih + b_hh).reshape(-1, 1)

    h = np.zeros((hidden_size, 1), dtype=np.float64)
    c = np.zeros((hidden_size, 1), dtype=np.float64)
    prog = Program()

    for t in range(seq_len):
        x_t = input_seq[t].reshape(-1, 1)
        ctrl.preload_to_sram('weight', f'x_{t}', x_t)
        prog.add(Instruction(opcode=Opcode.MATMUL, src1='W_ih', src2=f'x_{t}',
                              dst=f'gates_ih_{t}', M=4*hidden_size, K=input_size, N=1))
        ctrl.preload_to_sram('weight', f'h_{t}', h)
        prog.add(Instruction(opcode=Opcode.MATMUL, src1='W_hh', src2=f'h_{t}',
                              dst=f'gates_hh_{t}', M=4*hidden_size, K=hidden_size, N=1))
        prog.add(Instruction(opcode=Opcode.ELEM_ADD,
                              src1=f'gates_ih_{t}', src2=f'gates_hh_{t}', dst=f'gates_{t}'))
        ctrl.preload_to_sram('output', f'bias_{t}', bias)
        prog.add(Instruction(opcode=Opcode.ELEM_ADD,
                              src1=f'gates_{t}', src2=f'bias_{t}', dst=f'gates_{t}'))

    stats = ctrl.execute_program(prog)
    trace = stats['trace']

    # Verification
    gates_ih = ctrl.get_sram_data('output', 'gates_ih_0')
    expected_gates = W_ih @ input_seq[0].reshape(-1, 1)
    error = float(np.max(np.abs(gates_ih - expected_gates)))

    # Build metrics from trace
    metrics_obj = compute_metrics(trace, config, stats['array_utilization'])
    metrics = metrics_obj.to_dict()
    config_dict = config.to_dict()
    korean = build_korean_summary(metrics, config_dict)

    # PE heatmap from array
    pe_utils = ctrl.array.get_pe_utilizations().tolist()

    # Animation frames
    animation_frames = _extract_animation_frames(ctrl.array)

    # Timeline
    timeline = []
    for entry in trace:
        timeline.append({
            'opcode': entry['opcode'],
            'opcode_kr': OPCODE_KR.get(entry['opcode'], entry['opcode']),
            'start_cycle': entry['start_cycle'],
            'end_cycle': entry['end_cycle'],
            'cycles': entry['cycles'],
        })

    return {
        'demo_type': 'lstm',
        'config': config_dict,
        'params': {'input_size': input_size, 'hidden_size': hidden_size, 'seq_len': seq_len},
        'metrics': metrics,
        'pe_heatmap': pe_utils,
        'animation_frames': animation_frames,
        'timeline': timeline,
        'korean': korean,
        'comparison': {
            'hw_sample': gates_ih.flatten()[:5].tolist(),
            'sw_sample': expected_gates.flatten()[:5].tolist(),
            'max_abs_error': error,
            'match': error < 1e-10,
        },
    }


def run_solarx_demo(clock_ghz: float = 1.0) -> dict:
    """Run SolarX LSTM demo. Graceful fallback if model file not found."""
    from ..models.solarx_bridge import SolarXBridge, SOLARX_INPUT_SIZE, SOLARX_HIDDEN_SIZE, SOLARX_SEQ_LEN

    config = AcceleratorConfig(array_size=8, clock_freq_hz=clock_ghz * 1e9)
    config_dict = config.to_dict()

    bridge = SolarXBridge()
    try:
        bridge.load()
    except FileNotFoundError:
        return {
            'demo_type': 'solarx',
            'error': 'SolarX 모델 파일을 찾을 수 없습니다 (C:/dev/SolarX/src/lstm_solar_model.pth). SolarX 프로젝트가 설치되어 있는지 확인해주세요.',
            'config': config_dict,
        }

    w = bridge.get_lstm_weights()
    input_data = bridge.generate_sample_input(batch_size=1, seed=42)

    # NumPy reference
    ref_result = bridge.numpy_reference_inference(input_data)

    # PyTorch reference
    pt_output = None
    np_vs_pt_error = None
    try:
        pt_output = float(bridge.pytorch_reference_inference(input_data).squeeze())
        np_vs_pt_error = abs(float(ref_result['output']) - pt_output)
    except ImportError:
        pass

    # Cycle-accurate simulation for single tile
    clock = Clock()
    sa = SystolicArray(config.array_size, clock)
    x_0 = input_data[0].reshape(-1, 1)
    W_ih_tile = w['weight_ih'][:8, :]
    result_tile, tile_cycles = sa.execute_matmul(x_0[:8, :].T, W_ih_tile.T)
    tile_util = sa.get_utilization()
    pe_utils = sa.get_pe_utilizations().tolist()
    animation_frames = _extract_animation_frames(sa)

    # Tiling plans
    ih_plan = create_tiling_plan(256, 8, 1, config.array_size)
    hh_plan = create_tiling_plan(256, 64, 1, config.array_size)

    # Full inference cycle estimation
    seq_len = SOLARX_SEQ_LEN
    weight_load_per_tile = config.array_size
    ih_cycles_per_step = ih_plan.num_tiles * (weight_load_per_tile + 8 + 8 + 1 - 2)
    hh_cycles_per_step = hh_plan.num_tiles * (weight_load_per_tile + 8 + 64 + 1 - 2)
    activation_cycles = 4 * config.activation_latency
    elementwise_cycles = 5 * config.elementwise_latency
    per_step = ih_cycles_per_step + hh_cycles_per_step + activation_cycles + elementwise_cycles
    total_est = seq_len * per_step

    # Roofline data
    ops_per_step = (256 * 8 + 256 * 64) * 2
    total_ops = seq_len * ops_per_step
    bytes_per_step = (256 * 8 + 256 * 64 + 8 + 64) * 8
    ai = total_ops / (bytes_per_step * seq_len)
    peak_gops = config.peak_gops
    bw_gbps = config.dram_bandwidth / 1e9
    ridge_point = peak_gops / bw_gbps

    roofline = {
        'peak_gops': peak_gops,
        'bw_gbps': bw_gbps,
        'ridge_point': ridge_point,
        'workloads': [
            {'name': 'SolarX batch=1', 'arithmetic_intensity': ai,
             'achieved_gops': total_ops / total_est, 'region': '메모리 병목' if ai < ridge_point else '연산 병목'},
            {'name': 'SolarX batch=8 (추정)', 'arithmetic_intensity': ai * 8,
             'achieved_gops': total_ops * 8 / (total_est * 1.2),
             'region': '메모리 병목' if ai * 8 < ridge_point else '연산 병목'},
        ],
    }

    # Cycle breakdown
    breakdown = {
        'MatMul (ih)': ih_cycles_per_step * seq_len,
        'MatMul (hh)': hh_cycles_per_step * seq_len,
        'Activation': activation_cycles * seq_len,
        'Elementwise': elementwise_cycles * seq_len,
    }

    metrics = {
        'total_cycles': total_est,
        'matmul_cycles': (ih_cycles_per_step + hh_cycles_per_step) * seq_len,
        'memory_cycles': 0,
        'activation_cycles': activation_cycles * seq_len,
        'elementwise_cycles': elementwise_cycles * seq_len,
        'instruction_count': seq_len * (ih_plan.num_tiles + hh_plan.num_tiles + 4 + 5),
        'pe_utilization': tile_util,
        'total_ops': total_ops,
        'arithmetic_intensity': ai,
        'achieved_gops': total_ops / total_est * config.clock_freq_hz / 1e9 if total_est > 0 else 0,
        'cycle_breakdown': breakdown,
    }

    korean = build_korean_summary(metrics, config_dict)

    # Build comparison
    comparison = {
        'numpy_output': float(ref_result['output']),
        'h_final_norm': float(np.linalg.norm(ref_result['h_final'])),
    }
    if pt_output is not None:
        comparison['pytorch_output'] = pt_output
        comparison['np_vs_pt_error'] = np_vs_pt_error
        comparison['match'] = np_vs_pt_error < 1e-5

    return {
        'demo_type': 'solarx',
        'config': config_dict,
        'params': {
            'input_size': SOLARX_INPUT_SIZE,
            'hidden_size': SOLARX_HIDDEN_SIZE,
            'seq_len': SOLARX_SEQ_LEN,
            'W_ih_shape': list(w['weight_ih'].shape),
            'W_hh_shape': list(w['weight_hh'].shape),
        },
        'tiling': {
            'ih': {'num_tiles': ih_plan.num_tiles, 'num_weight_loads': ih_plan.num_weight_loads},
            'hh': {'num_tiles': hh_plan.num_tiles, 'num_weight_loads': hh_plan.num_weight_loads},
        },
        'per_step_cycles': {
            'ih_matmul': ih_cycles_per_step,
            'hh_matmul': hh_cycles_per_step,
            'activation': activation_cycles,
            'elementwise': elementwise_cycles,
            'total': per_step,
        },
        'metrics': metrics,
        'pe_heatmap': pe_utils,
        'animation_frames': animation_frames,
        'roofline': roofline,
        'korean': korean,
        'comparison': comparison,
    }


def _extract_animation_frames(sa: SystolicArray) -> list[list[list[int]]]:
    """Extract per-cycle PE activity from systolic array cycle log."""
    frames = []
    for entry in sa.cycle_log:
        frames.append(entry['pe_activity'])
    return frames
