"""Visualization tools: PE heatmap, execution timeline."""
from __future__ import annotations
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from ..config import AcceleratorConfig


def plot_pe_heatmap(utilizations: np.ndarray,
                    title: str = "PE Utilization Heatmap",
                    save_path: str | None = None,
                    ax: plt.Axes | None = None) -> plt.Figure | None:
    """Plot per-PE utilization as a heatmap.

    Args:
        utilizations: NxN array of utilization values (0-1)
        title: Plot title
        save_path: Path to save figure
    """
    fig = None
    if ax is None:
        fig, ax = plt.subplots(1, 1, figsize=(8, 7))

    im = ax.imshow(utilizations, cmap='YlOrRd', vmin=0, vmax=1, aspect='equal')
    plt.colorbar(im, ax=ax, label='Utilization', shrink=0.8)

    N = utilizations.shape[0]
    for i in range(N):
        for j in range(N):
            val = utilizations[i, j]
            color = 'white' if val > 0.5 else 'black'
            ax.text(j, i, f'{val:.0%}', ha='center', va='center',
                    color=color, fontsize=7)

    ax.set_xlabel('Column (N dimension)')
    ax.set_ylabel('Row (K dimension)')
    ax.set_title(title)
    ax.set_xticks(range(N))
    ax.set_yticks(range(N))

    if save_path and fig:
        fig.savefig(save_path, dpi=150, bbox_inches='tight')

    return fig


def plot_execution_timeline(trace: list[dict],
                            title: str = "Execution Timeline",
                            save_path: str | None = None) -> plt.Figure:
    """Plot instruction execution timeline (Gantt-style).

    Args:
        trace: Execution trace from controller
    """
    fig, ax = plt.subplots(1, 1, figsize=(14, max(4, len(trace) * 0.15)))

    colors = {
        'LOAD_WEIGHT': '#3498db',
        'LOAD_INPUT': '#2ecc71',
        'MATMUL': '#e74c3c',
        'STORE': '#9b59b6',
        'ACT_SIGMOID': '#f39c12',
        'ACT_TANH': '#e67e22',
        'ELEM_MUL': '#1abc9c',
        'ELEM_ADD': '#16a085',
        'NOP': '#bdc3c7',
    }

    for i, entry in enumerate(trace):
        start = entry['start_cycle']
        duration = entry['cycles']
        color = colors.get(entry['opcode'], '#95a5a6')
        ax.barh(i, duration, left=start, height=0.8, color=color, alpha=0.8)

    # Legend
    from matplotlib.patches import Patch
    legend_elements = [Patch(facecolor=c, label=name) for name, c in colors.items()
                       if any(e['opcode'] == name for e in trace)]
    ax.legend(handles=legend_elements, loc='upper right', fontsize=7)

    ax.set_xlabel('Cycle')
    ax.set_ylabel('Instruction #')
    ax.set_title(title)
    ax.invert_yaxis()

    if save_path:
        fig.savefig(save_path, dpi=150, bbox_inches='tight')

    return fig


def plot_cycle_breakdown(metrics_dict: dict[str, int],
                         title: str = "Cycle Breakdown",
                         save_path: str | None = None) -> plt.Figure:
    """Pie chart of cycle breakdown by category."""
    fig, ax = plt.subplots(1, 1, figsize=(8, 6))

    labels = []
    sizes = []
    for k, v in metrics_dict.items():
        if v > 0:
            labels.append(k)
            sizes.append(v)

    colors = ['#e74c3c', '#3498db', '#f39c12', '#1abc9c']
    ax.pie(sizes, labels=labels, autopct='%1.1f%%', colors=colors[:len(labels)])
    ax.set_title(title)

    if save_path:
        fig.savefig(save_path, dpi=150, bbox_inches='tight')

    return fig
