"""Demo: SolarX LSTM model inference on AccSim accelerator."""
import sys
sys.path.insert(0, "C:/dev/Tesla")

import numpy as np
from accsim.models.solarx_bridge import SolarXBridge
from accsim.models.lstm import lstm_forward
from accsim.core.controller import Controller
from accsim.core.systolic_array import SystolicArray
from accsim.core.clock import Clock
from accsim.compiler.tiler import create_tiling_plan
from accsim.config import AcceleratorConfig, DEFAULT_CONFIG
from accsim.analysis.comparison import compare_outputs
from accsim.analysis.metrics import compute_theoretical_utilization
from accsim.analysis.visualizer import plot_pe_heatmap, plot_cycle_breakdown
from accsim.analysis.roofline import plot_roofline


def demo_solarx():
    print("=" * 60)
    print("AccSim: SolarX LSTM Accelerator Simulation")
    print("=" * 60)

    # Load SolarX model
    bridge = SolarXBridge()
    bridge.load()
    print("\nSolarX model loaded successfully.")

    w = bridge.get_lstm_weights()
    print(f"  W_ih shape: {w['weight_ih'].shape}")  # (256, 8)
    print(f"  W_hh shape: {w['weight_hh'].shape}")  # (256, 64)

    # Generate sample input
    input_data = bridge.generate_sample_input(batch_size=1, seed=42)
    print(f"  Input shape: {input_data.shape}")  # (24, 8)

    # 1. NumPy reference inference
    print("\n--- NumPy Reference Inference ---")
    ref_result = bridge.numpy_reference_inference(input_data)
    print(f"  Output: {ref_result['output']:.6f}")
    print(f"  h_final norm: {np.linalg.norm(ref_result['h_final']):.6f}")

    # 2. PyTorch reference (ground truth)
    print("\n--- PyTorch Reference ---")
    try:
        pt_output = bridge.pytorch_reference_inference(input_data)
        print(f"  Output: {pt_output.squeeze():.6f}")
        np_vs_pt_error = abs(ref_result['output'] - pt_output.squeeze())
        print(f"  NumPy vs PyTorch error: {np_vs_pt_error:.2e}")
    except ImportError:
        print("  PyTorch not available, skipping.")

    # 3. Cycle-accurate simulation for key matmuls
    print("\n--- Cycle-Accurate Simulation ---")
    config = DEFAULT_CONFIG  # 8x8 array

    # Simulate W_ih @ x_t (256,8) @ (8,1) - one timestep
    clock = Clock()
    sa = SystolicArray(config.array_size, clock)
    x_0 = input_data[0].reshape(-1, 1)  # (8, 1)

    # This is a tile-at-a-time computation
    # W_ih is (256, 8), fits K=8 in one array pass
    # But M=256 needs 32 tiles of 8 rows each
    ih_plan = create_tiling_plan(256, 8, 1, config.array_size)
    print(f"  W_ih tiling: {ih_plan.num_tiles} tiles, {ih_plan.num_weight_loads} weight loads")

    hh_plan = create_tiling_plan(256, 64, 1, config.array_size)
    print(f"  W_hh tiling: {hh_plan.num_tiles} tiles, {hh_plan.num_weight_loads} weight loads")

    # Simulate a single W_ih tile
    W_ih_tile = w['weight_ih'][:8, :]  # First 8x8 tile
    result, cycles = sa.execute_matmul(x_0[:8, :].T, W_ih_tile.T)  # Transpose for correct dims
    util = sa.get_utilization()
    print(f"\n  Single tile (8x8)@(8x1):")
    print(f"    Cycles: {cycles}")
    print(f"    PE utilization: {util:.1%}")
    print(f"    Theoretical: {compute_theoretical_utilization(1, 8, 8, 8):.1%}")

    # Utilization analysis
    print("\n--- Utilization Analysis ---")
    print("  batch=1 (matrix-vector):")
    mv_util = compute_theoretical_utilization(8, 8, 1, 8)
    print(f"    Per-tile utilization: {mv_util:.1%}")

    print("  batch=8 (matrix-matrix):")
    mm_util = compute_theoretical_utilization(8, 8, 8, 8)
    print(f"    Per-tile utilization: {mm_util:.1%}")

    # Total cycle estimation for full LSTM inference
    print("\n--- Full Inference Cycle Estimation ---")
    seq_len = 24
    weight_load_per_tile = config.array_size  # cycles

    # Per timestep: ih matmul + hh matmul + activation/elementwise
    ih_cycles_per_step = ih_plan.num_tiles * (weight_load_per_tile + 8 + 8 + 1 - 2)
    hh_cycles_per_step = hh_plan.num_tiles * (weight_load_per_tile + 8 + 64 + 1 - 2)
    activation_cycles = 4 * config.activation_latency  # i,f,g,o
    elementwise_cycles = 5 * config.elementwise_latency  # f*c, i*g, add, tanh, o*tanh
    per_step = ih_cycles_per_step + hh_cycles_per_step + activation_cycles + elementwise_cycles

    total_est = seq_len * per_step
    print(f"  Per timestep: {per_step} cycles")
    print(f"    ih matmul:     {ih_cycles_per_step}")
    print(f"    hh matmul:     {hh_cycles_per_step}")
    print(f"    activations:   {activation_cycles}")
    print(f"    elementwise:   {elementwise_cycles}")
    print(f"  Total (24 steps): {total_est:,} cycles")
    print(f"  At {config.clock_freq_hz/1e9:.0f} GHz: {total_est/config.clock_freq_hz*1e6:.2f} us")

    # Generate visualizations
    print("\n--- Generating Visualizations ---")

    # PE heatmap
    pe_utils = sa.get_pe_utilizations()
    fig = plot_pe_heatmap(pe_utils, "PE Utilization: W_ih tile",
                          save_path="solarx_pe_heatmap.png")
    if fig:
        print("  Saved: solarx_pe_heatmap.png")

    # Cycle breakdown
    breakdown = {
        'MatMul (ih)': ih_cycles_per_step * seq_len,
        'MatMul (hh)': hh_cycles_per_step * seq_len,
        'Activation': activation_cycles * seq_len,
        'Elementwise': elementwise_cycles * seq_len,
    }
    fig2 = plot_cycle_breakdown(breakdown, "SolarX LSTM Cycle Breakdown",
                                save_path="solarx_cycle_breakdown.png")
    print("  Saved: solarx_cycle_breakdown.png")

    # Roofline
    ops_per_step = (256 * 8 + 256 * 64) * 2  # MACs * 2 for FLOPs
    total_ops = seq_len * ops_per_step
    bytes_per_step = (256 * 8 + 256 * 64 + 8 + 64) * 8  # weights + activations in bytes
    ai = total_ops / (bytes_per_step * seq_len)

    workloads = [
        {'name': 'SolarX batch=1', 'arithmetic_intensity': ai,
         'achieved_gops': total_ops / total_est},
        {'name': 'SolarX batch=8 (est)', 'arithmetic_intensity': ai * 8,
         'achieved_gops': total_ops * 8 / (total_est * 1.2)},
    ]
    fig3 = plot_roofline(config, workloads, save_path="solarx_roofline.png")
    if fig3:
        print("  Saved: solarx_roofline.png")

    print("\nDone!")


if __name__ == "__main__":
    demo_solarx()
