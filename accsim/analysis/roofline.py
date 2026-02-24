"""Roofline model visualization."""
from __future__ import annotations
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from ..config import AcceleratorConfig


def plot_roofline(config: AcceleratorConfig,
                  workloads: list[dict] | None = None,
                  save_path: str | None = None,
                  ax: plt.Axes | None = None) -> plt.Figure | None:
    """Plot roofline model for the accelerator.

    Args:
        config: Accelerator configuration
        workloads: List of dicts with keys:
            - name: str
            - arithmetic_intensity: float (ops/byte)
            - achieved_gops: float
        save_path: Path to save figure
        ax: Optional axes to plot on

    Returns:
        Figure if no ax provided, else None
    """
    peak_gops = config.peak_gops
    # Bandwidth in GB/s
    bw_gbps = config.dram_bandwidth / 1e9

    # Ridge point: where compute and memory roofs meet
    ridge_point = peak_gops / bw_gbps  # ops/byte

    fig = None
    if ax is None:
        fig, ax = plt.subplots(1, 1, figsize=(10, 6))

    # X-axis: arithmetic intensity (ops/byte)
    x = np.logspace(-2, 4, 1000)

    # Memory roof: performance = bandwidth * AI
    mem_roof = bw_gbps * x
    # Compute roof: performance = peak
    compute_roof = np.full_like(x, peak_gops)
    # Roofline: min of both
    roofline = np.minimum(mem_roof, compute_roof)

    ax.loglog(x, roofline, 'b-', linewidth=2, label='Roofline')
    ax.loglog(x, mem_roof, 'b--', alpha=0.3, label=f'BW={bw_gbps:.1f} GB/s')
    ax.axhline(peak_gops, color='r', linestyle='--', alpha=0.3,
               label=f'Peak={peak_gops:.1f} GOPS')
    ax.axvline(ridge_point, color='gray', linestyle=':', alpha=0.3,
               label=f'Ridge={ridge_point:.2f} ops/B')

    # Plot workloads
    if workloads:
        colors = plt.cm.tab10(np.linspace(0, 1, len(workloads)))
        for wl, color in zip(workloads, colors):
            ax.plot(wl['arithmetic_intensity'], wl['achieved_gops'],
                    'o', markersize=10, color=color, label=wl['name'],
                    zorder=5)

    ax.set_xlabel('Arithmetic Intensity (Ops/Byte)')
    ax.set_ylabel('Performance (GOPS)')
    ax.set_title(f'Roofline Model — {config.array_size}x{config.array_size} Systolic Array')
    ax.legend(loc='lower right', fontsize=8)
    ax.grid(True, which='both', alpha=0.3)
    ax.set_xlim(0.01, 1000)
    ax.set_ylim(0.1, peak_gops * 10)

    if save_path and fig:
        fig.savefig(save_path, dpi=150, bbox_inches='tight')

    return fig
