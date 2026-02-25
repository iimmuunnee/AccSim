"""NxN Weight-Stationary Systolic Array."""
from __future__ import annotations
import numpy as np
from .pe import PE
from .clock import Clock


class SystolicArray:
    """Weight-stationary systolic array for matrix multiplication.

    For C = A @ B where A is (M, K) and B is (K, N):
    - Weights (B) are pre-loaded into the PE array
    - Activations (A rows) stream left-to-right with skewed timing
    - Partial sums flow top-to-bottom
    - Total cycles per tile: N + K + M - 2  (skewed input + drain)
    """

    def __init__(self, size: int, clock: Clock):
        self.size = size
        self.clock = clock
        self.pes: list[list[PE]] = [
            [PE(r, c) for c in range(size)]
            for r in range(size)
        ]
        self.cycle_log: list[dict] = []

    def load_weights(self, W: np.ndarray):
        """Load weight matrix into PE array.

        W shape: (K, N) where K, N <= self.size
        W[k][n] goes to PE[k][n] — row k, col n
        """
        K, N = W.shape
        assert K <= self.size and N <= self.size, \
            f"Weight {W.shape} exceeds array size {self.size}"
        for k in range(self.size):
            for n in range(self.size):
                if k < K and n < N:
                    self.pes[k][n].load_weight(float(W[k, n]))
                else:
                    self.pes[k][n].load_weight(0.0)

    def execute_matmul(self, A: np.ndarray, W: np.ndarray) -> tuple[np.ndarray, int]:
        """Execute tiled matmul C = A @ W.

        A: (M, K) activation matrix
        W: (K, N) weight matrix

        Returns: (result matrix (M, N), total cycles)
        """
        M, K = A.shape
        K2, N = W.shape
        assert K == K2, f"Dimension mismatch: A({M},{K}) @ W({K2},{N})"

        # Load weights
        self.load_weights(W)
        weight_load_cycles = self.size  # 1 cycle per row
        self.clock.tick(weight_load_cycles)

        # Total simulation cycles for skewed data flow
        total_sim_cycles = M + K + N - 2

        # Build skewed activation input schedule
        # At sim cycle t, PE row k receives activation from A row m
        # Skewing: row k of the array gets its input delayed by k cycles
        # Column n of the output gets its drain delayed by n cycles

        result = np.zeros((M, N), dtype=np.float64)

        # Simulate cycle by cycle
        # psum_regs[k][n] holds partial sum flowing through PE[k][n]
        # We need to track what's in each PE at each cycle

        # For each output row m (row of A):
        #   activation A[m, k] enters PE row k at cycle (m + k)
        #   psum for output[m, n] exits PE[K-1, n] at cycle (m + K - 1 + n)

        # Simulate using the skewed schedule
        for t in range(total_sim_cycles):
            # Process PEs bottom-to-top so psum flows correctly within one tick
            for k in range(self.size - 1, -1, -1):
                for n in range(self.size):
                    # Determine which activation row m is at this PE at time t
                    # PE[k][n] receives activation at time t if t - k - n >= 0
                    # Actually in weight-stationary: activation skewed by column n
                    # psum skewed by row k
                    pass

        # More efficient: direct cycle-accurate simulation with explicit data movement
        result = self._simulate_dataflow(A, W, M, K, N, total_sim_cycles)

        self.clock.tick(total_sim_cycles)
        return result, weight_load_cycles + total_sim_cycles

    def _simulate_dataflow(self, A: np.ndarray, W: np.ndarray,
                           M: int, K: int, N: int, total_cycles: int) -> np.ndarray:
        """Cycle-accurate simulation of weight-stationary dataflow.

        Skewing scheme:
        - Activation A[m, k] enters the array at column 0, row k, at cycle (m + k)
        - Partial sums flow top (row 0) to bottom (row K-1)
        - Result[m, n] is available at row K-1, column n, at cycle (m + K - 1 + n)
        """
        result = np.zeros((M, N), dtype=np.float64)

        # psum_grid[k][n] = current partial sum in PE[k][n]
        # activation_grid[k][n] = current activation in PE[k][n]
        psum_grid = np.zeros((self.size, self.size), dtype=np.float64)
        act_grid = np.zeros((self.size, self.size), dtype=np.float64)

        # Track which m-index each PE is working on
        m_tracker = np.full((self.size, self.size), -1, dtype=int)

        for t in range(total_cycles):
            # New grids for this cycle (to avoid read-after-write issues)
            new_psum = np.zeros((self.size, self.size), dtype=np.float64)
            new_act = np.zeros((self.size, self.size), dtype=np.float64)
            new_m = np.full((self.size, self.size), -1, dtype=int)

            for k in range(K):
                for n in range(N):
                    pe = self.pes[k][n]

                    # Determine activation input
                    if n == 0:
                        # First column: activation comes from input with skew
                        # A[m, k] enters at cycle (m + k), so m = t - k
                        m = t - k
                        if 0 <= m < M:
                            act_in = float(A[m, k])
                            cur_m = m
                        else:
                            act_in = 0.0
                            cur_m = -1
                    else:
                        # Get activation from left neighbor (previous cycle's output)
                        act_in = act_grid[k, n - 1]
                        cur_m = m_tracker[k, n - 1]

                    # Determine psum input
                    if k == 0:
                        psum_in = 0.0  # Top row starts with 0
                    else:
                        psum_in = psum_grid[k - 1, n]  # From above (prev cycle)

                    # Execute MAC
                    _, psum_out = pe.compute(act_in, psum_in)

                    new_act[k, n] = act_in
                    new_psum[k, n] = psum_out
                    new_m[k, n] = cur_m

                    # If this is the bottom row, collect result
                    if k == K - 1 and cur_m >= 0:
                        result[cur_m, n] = psum_out

            psum_grid = new_psum
            act_grid = new_act
            m_tracker = new_m

            self.cycle_log.append({
                'cycle': t,
                'pe_activity': (new_m >= 0).astype(int).tolist()
            })

        return result

    def get_utilization(self) -> float:
        """Average PE utilization across the array."""
        total = sum(pe.utilization for row in self.pes for pe in row)
        return total / (self.size ** 2)

    def get_pe_utilizations(self) -> np.ndarray:
        """Per-PE utilization as NxN matrix."""
        return np.array([
            [pe.utilization for pe in row]
            for row in self.pes
        ])

    def reset(self):
        """Reset all PEs."""
        for row in self.pes:
            for pe in row:
                pe.reset()
        self.cycle_log.clear()

    def reset_stats(self):
        """Reset only statistics, keep weights."""
        for row in self.pes:
            for pe in row:
                pe.reset_stats()
        self.cycle_log.clear()
