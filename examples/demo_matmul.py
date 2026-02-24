"""Demo: Matrix multiplication on the systolic array simulator."""
import sys
sys.path.insert(0, "C:/dev/Tesla")

import numpy as np
from accsim.core.clock import Clock
from accsim.core.systolic_array import SystolicArray
from accsim.config import AcceleratorConfig, DEFAULT_CONFIG
from accsim.analysis.visualizer import plot_pe_heatmap
from accsim.analysis.metrics import compute_theoretical_utilization


def demo_basic_matmul():
    """Basic matrix multiply demonstration."""
    print("=" * 60)
    print("AccSim: Systolic Array Matrix Multiplication Demo")
    print("=" * 60)

    config = DEFAULT_CONFIG
    clock = Clock()
    sa = SystolicArray(config.array_size, clock)

    # Test 1: Full 8x8 matmul
    print(f"\n--- Test 1: Full {config.array_size}x{config.array_size} MatMul ---")
    rng = np.random.default_rng(42)
    A = rng.standard_normal((8, 8))
    W = rng.standard_normal((8, 8))

    result, cycles = sa.execute_matmul(A, W)
    expected = A @ W
    error = np.max(np.abs(result - expected))
    util = sa.get_utilization()

    print(f"Cycles: {cycles}")
    print(f"Max error: {error:.2e}")
    print(f"PE utilization: {util:.1%}")
    print(f"Theoretical util: {compute_theoretical_utilization(8, 8, 8, 8):.1%}")

    # Test 2: Matrix-vector (low utilization)
    print(f"\n--- Test 2: Matrix-Vector (256x8 @ 8x1) ---")
    clock2 = Clock()
    sa2 = SystolicArray(8, clock2)
    A2 = rng.standard_normal((8, 8))  # One tile of 256x8
    W2 = rng.standard_normal((8, 1))

    result2, cycles2 = sa2.execute_matmul(A2, W2)
    expected2 = A2 @ W2
    error2 = np.max(np.abs(result2 - expected2))
    util2 = sa2.get_utilization()

    print(f"Cycles: {cycles2}")
    print(f"Max error: {error2:.2e}")
    print(f"PE utilization: {util2:.1%}")
    print(f"Theoretical util: {compute_theoretical_utilization(8, 8, 1, 8):.1%}")

    # Test 3: Batched (high utilization)
    print(f"\n--- Test 3: Batched MatVec (8x8 @ 8x8) - batch=8 ---")
    clock3 = Clock()
    sa3 = SystolicArray(8, clock3)
    A3 = rng.standard_normal((8, 8))
    W3 = rng.standard_normal((8, 8))

    result3, cycles3 = sa3.execute_matmul(A3, W3)
    util3 = sa3.get_utilization()

    print(f"Cycles: {cycles3}")
    print(f"PE utilization: {util3:.1%}")
    print(f"Theoretical util: {compute_theoretical_utilization(8, 8, 8, 8):.1%}")

    # PE heatmap for last run
    pe_utils = sa3.get_pe_utilizations()
    fig = plot_pe_heatmap(pe_utils, title="PE Utilization: 8x8 @ 8x8",
                          save_path="pe_heatmap_8x8.png")
    if fig:
        print("\nPE heatmap saved to pe_heatmap_8x8.png")

    # Array size comparison
    print(f"\n--- Array Size Scaling ---")
    for size in [4, 8, 16]:
        clk = Clock()
        sa_tmp = SystolicArray(size, clk)
        M, K, N = 8, 8, 1
        At = rng.standard_normal((min(M, size), min(K, size)))
        Wt = rng.standard_normal((min(K, size), min(N, size)))
        _, cyc = sa_tmp.execute_matmul(At, Wt)
        t_util = compute_theoretical_utilization(At.shape[0], At.shape[1], Wt.shape[1], size)
        print(f"  {size}x{size} array: {cyc} cycles, theoretical util={t_util:.1%}")


if __name__ == "__main__":
    demo_basic_matmul()
