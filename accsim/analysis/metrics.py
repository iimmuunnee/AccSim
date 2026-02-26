"""Performance metrics computation."""
from __future__ import annotations
from dataclasses import dataclass
import numpy as np
from ..config import AcceleratorConfig


@dataclass
class SimulationMetrics:
    """Collected metrics from a simulation run."""
    total_cycles: int
    matmul_cycles: int
    memory_cycles: int
    activation_cycles: int
    elementwise_cycles: int
    instruction_count: int
    pe_utilization: float
    # Derived
    config: AcceleratorConfig | None = None

    @property
    def total_ops(self) -> int:
        """Total MAC operations (approximate from matmul cycles and array size)."""
        if self.config:
            return self.matmul_cycles * self.config.peak_ops_per_cycle
        return 0

    @property
    def arithmetic_intensity(self) -> float:
        """Operations per byte transferred (approximate)."""
        if self.config and self.memory_cycles > 0:
            bytes_transferred = self.memory_cycles * self.config.dram_bandwidth_bytes_per_cycle
            if bytes_transferred > 0:
                return self.total_ops / bytes_transferred
        return 0.0

    @property
    def achieved_gops(self) -> float:
        """Achieved GOPS."""
        if self.config and self.total_cycles > 0:
            ops = self.total_ops * self.pe_utilization
            return ops / self.total_cycles * self.config.clock_freq_hz / 1e9
        return 0.0

    @property
    def cycle_breakdown(self) -> dict[str, int]:
        return {
            'matmul': self.matmul_cycles,
            'memory': self.memory_cycles,
            'activation': self.activation_cycles,
            'elementwise': self.elementwise_cycles,
        }

    def to_dict(self) -> dict:
        """JSON-serializable dictionary of all metrics."""
        return {
            'total_cycles': self.total_cycles,
            'matmul_cycles': self.matmul_cycles,
            'memory_cycles': self.memory_cycles,
            'activation_cycles': self.activation_cycles,
            'elementwise_cycles': self.elementwise_cycles,
            'instruction_count': self.instruction_count,
            'pe_utilization': self.pe_utilization,
            'total_ops': self.total_ops,
            'arithmetic_intensity': self.arithmetic_intensity,
            'achieved_gops': self.achieved_gops,
            'cycle_breakdown': self.cycle_breakdown,
        }


def compute_metrics(trace: list[dict], config: AcceleratorConfig,
                    pe_utilization: float) -> SimulationMetrics:
    """Compute metrics from an execution trace."""
    matmul_cycles = 0
    memory_cycles = 0
    activation_cycles = 0
    elementwise_cycles = 0

    for entry in trace:
        c = entry['cycles']
        op = entry['opcode']
        if op == 'MATMUL':
            matmul_cycles += c
        elif op in ('LOAD_WEIGHT', 'LOAD_INPUT', 'STORE'):
            memory_cycles += c
        elif op.startswith('ACT_'):
            activation_cycles += c
        elif op.startswith('ELEM_'):
            elementwise_cycles += c

    return SimulationMetrics(
        total_cycles=trace[-1]['end_cycle'] if trace else 0,
        matmul_cycles=matmul_cycles,
        memory_cycles=memory_cycles,
        activation_cycles=activation_cycles,
        elementwise_cycles=elementwise_cycles,
        instruction_count=len(trace),
        pe_utilization=pe_utilization,
        config=config,
    )


def compute_theoretical_utilization(M: int, K: int, N: int,
                                    array_size: int) -> float:
    """Theoretical PE utilization for a single tile matmul.

    Useful ops = M * K * N
    Total PE-cycles = array_size^2 * (M + K + N - 2)
    Utilization = useful / total
    """
    total_pe_cycles = array_size ** 2 * (M + K + N - 2)
    useful_ops = M * K * N
    return useful_ops / total_pe_cycles if total_pe_cycles > 0 else 0.0
