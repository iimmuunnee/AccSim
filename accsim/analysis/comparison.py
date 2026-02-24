"""Hardware simulation vs software reference comparison."""
from __future__ import annotations
import numpy as np
from dataclasses import dataclass


@dataclass
class ComparisonResult:
    """Result of comparing HW simulation with SW reference."""
    hw_output: np.ndarray
    sw_output: np.ndarray
    max_abs_error: float
    mean_abs_error: float
    relative_error: float
    match: bool  # Whether error is within tolerance

    def summary(self) -> str:
        status = "PASS" if self.match else "FAIL"
        return (
            f"[{status}] Comparison Result:\n"
            f"  Max absolute error:  {self.max_abs_error:.2e}\n"
            f"  Mean absolute error: {self.mean_abs_error:.2e}\n"
            f"  Relative error:      {self.relative_error:.2e}\n"
            f"  HW output shape:     {self.hw_output.shape}\n"
            f"  SW output shape:     {self.sw_output.shape}"
        )


def compare_outputs(hw_output: np.ndarray, sw_output: np.ndarray,
                    tolerance: float = 1e-4) -> ComparisonResult:
    """Compare hardware simulation output with software reference.

    Args:
        hw_output: Output from accelerator simulation
        sw_output: Output from NumPy/PyTorch reference
        tolerance: Maximum acceptable absolute error

    Returns:
        ComparisonResult with detailed error metrics
    """
    # Flatten for comparison
    hw_flat = hw_output.flatten()
    sw_flat = sw_output.flatten()

    assert hw_flat.shape == sw_flat.shape, \
        f"Shape mismatch: HW {hw_output.shape} vs SW {sw_output.shape}"

    diff = np.abs(hw_flat - sw_flat)
    max_err = float(np.max(diff))
    mean_err = float(np.mean(diff))

    sw_norm = float(np.linalg.norm(sw_flat))
    rel_err = float(np.linalg.norm(hw_flat - sw_flat)) / sw_norm if sw_norm > 0 else 0.0

    return ComparisonResult(
        hw_output=hw_output,
        sw_output=sw_output,
        max_abs_error=max_err,
        mean_abs_error=mean_err,
        relative_error=rel_err,
        match=max_err < tolerance,
    )


@dataclass
class ScalingResult:
    """Result from array size scaling analysis."""
    array_sizes: list[int]
    total_cycles: list[int]
    utilizations: list[float]
    speedups: list[float]  # Relative to smallest array

    def summary(self) -> str:
        lines = ["Array Size Scaling Analysis:"]
        lines.append(f"  {'Size':>6} {'Cycles':>10} {'Util':>8} {'Speedup':>8}")
        for i, sz in enumerate(self.array_sizes):
            lines.append(
                f"  {sz:>4}x{sz:<2} {self.total_cycles[i]:>10,} "
                f"{self.utilizations[i]:>7.1%} {self.speedups[i]:>7.2f}x"
            )
        return "\n".join(lines)
