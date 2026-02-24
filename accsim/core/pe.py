"""Processing Element - the fundamental compute unit in the systolic array."""
import numpy as np


class PE:
    """Weight-stationary Processing Element.

    Data flow (weight-stationary):
    - Weight is pre-loaded and stays fixed during computation
    - Activation flows left-to-right
    - Partial sum flows top-to-bottom
    - Output: psum_out = psum_in + weight * activation_in
    """

    def __init__(self, row: int, col: int):
        self.row = row
        self.col = col
        self.weight: float = 0.0
        self.activation_in: float = 0.0
        self.psum_in: float = 0.0
        self.psum_out: float = 0.0
        self.activation_out: float = 0.0
        # Statistics
        self.total_cycles: int = 0
        self.active_cycles: int = 0

    def load_weight(self, w: float):
        """Load a weight value (stays stationary during matmul)."""
        self.weight = w

    def compute(self, activation: float, psum_in: float) -> tuple[float, float]:
        """Execute one MAC cycle.

        Returns:
            (activation_out, psum_out) - activation passes through, psum accumulates
        """
        self.activation_in = activation
        self.psum_in = psum_in
        self.psum_out = psum_in + self.weight * activation
        self.activation_out = activation  # pass through to right neighbor
        self.total_cycles += 1
        if activation != 0.0:
            self.active_cycles += 1
        return self.activation_out, self.psum_out

    @property
    def utilization(self) -> float:
        if self.total_cycles == 0:
            return 0.0
        return self.active_cycles / self.total_cycles

    def reset_stats(self):
        self.active_cycles = 0
        self.total_cycles = 0

    def reset(self):
        """Full reset including weight."""
        self.weight = 0.0
        self.activation_in = 0.0
        self.psum_in = 0.0
        self.psum_out = 0.0
        self.activation_out = 0.0
        self.reset_stats()
