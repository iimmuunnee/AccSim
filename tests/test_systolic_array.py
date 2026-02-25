"""Tests for Systolic Array."""
import pytest
import numpy as np
from accsim.core.clock import Clock
from accsim.core.systolic_array import SystolicArray


class TestSystolicArray:
    def test_2x2_matmul(self):
        """Manual verification: 2x2 matrix multiply."""
        clock = Clock()
        sa = SystolicArray(2, clock)

        A = np.array([[1.0, 2.0],
                       [3.0, 4.0]])
        W = np.array([[5.0, 6.0],
                       [7.0, 8.0]])

        result, cycles = sa.execute_matmul(A, W)
        expected = A @ W
        np.testing.assert_allclose(result, expected, atol=1e-10)

    def test_identity_matmul(self):
        """Multiply by identity matrix."""
        clock = Clock()
        sa = SystolicArray(3, clock)

        A = np.array([[1.0, 2.0, 3.0],
                       [4.0, 5.0, 6.0]])
        W = np.eye(3)

        result, _ = sa.execute_matmul(A, W)
        np.testing.assert_allclose(result, A, atol=1e-10)

    def test_matrix_vector(self):
        """Matrix-vector multiply (M=4, K=4, N=1)."""
        clock = Clock()
        sa = SystolicArray(4, clock)

        A = np.arange(16, dtype=np.float64).reshape(4, 4)
        W = np.ones((4, 1), dtype=np.float64)

        result, _ = sa.execute_matmul(A, W)
        expected = A @ W
        np.testing.assert_allclose(result, expected, atol=1e-10)

    def test_8x8_random(self):
        """Random 8x8 matmul."""
        clock = Clock()
        sa = SystolicArray(8, clock)

        rng = np.random.default_rng(42)
        A = rng.standard_normal((8, 8))
        W = rng.standard_normal((8, 8))

        result, _ = sa.execute_matmul(A, W)
        expected = A @ W
        np.testing.assert_allclose(result, expected, atol=1e-10)

    def test_non_square(self):
        """Non-square matmul: (3,4) @ (4,2) on 4x4 array."""
        clock = Clock()
        sa = SystolicArray(4, clock)

        A = np.array([[1, 2, 3, 4],
                       [5, 6, 7, 8],
                       [9, 10, 11, 12]], dtype=np.float64)
        W = np.array([[1, 0],
                       [0, 1],
                       [1, 0],
                       [0, 1]], dtype=np.float64)

        result, _ = sa.execute_matmul(A, W)
        expected = A @ W
        np.testing.assert_allclose(result, expected, atol=1e-10)

    def test_cycle_count(self):
        """Verify cycle count formula: weight_load + M + K + N - 2."""
        clock = Clock()
        N = 4
        sa = SystolicArray(N, clock)

        M, K = 3, 4
        A = np.ones((M, K))
        W = np.ones((K, 2))

        _, cycles = sa.execute_matmul(A, W)
        # weight_load_cycles = array_size = 4
        # sim_cycles = M + K + N_out - 2 = 3 + 4 + 2 - 2 = 7
        expected_cycles = N + (M + K + 2 - 2)
        assert cycles == expected_cycles

    def test_utilization(self):
        """PE utilization should be tracked."""
        clock = Clock()
        sa = SystolicArray(4, clock)

        A = np.ones((1, 4))  # Single row - low utilization
        W = np.ones((4, 1))  # Single column

        sa.execute_matmul(A, W)
        util = sa.get_utilization()
        assert 0.0 < util < 1.0  # Should be low for 1x1 output on 4x4 array
