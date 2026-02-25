"""Tests for LSTM reference implementation and compilation."""
import pytest
import numpy as np
from accsim.models.lstm import lstm_cell, lstm_forward


class TestLSTMReference:
    def setup_method(self):
        """Create tiny LSTM weights for testing."""
        self.input_size = 2
        self.hidden_size = 4
        rng = np.random.default_rng(42)
        self.W_ih = rng.standard_normal((4 * self.hidden_size, self.input_size))
        self.W_hh = rng.standard_normal((4 * self.hidden_size, self.hidden_size))
        self.b_ih = rng.standard_normal(4 * self.hidden_size)
        self.b_hh = rng.standard_normal(4 * self.hidden_size)

    def test_cell_output_shapes(self):
        x = np.array([1.0, 2.0])
        h = np.zeros(self.hidden_size)
        c = np.zeros(self.hidden_size)
        h_new, c_new = lstm_cell(x, h, c, self.W_ih, self.W_hh, self.b_ih, self.b_hh)
        assert h_new.shape == (self.hidden_size, 1)
        assert c_new.shape == (self.hidden_size, 1)

    def test_cell_h_bounded(self):
        """Hidden state should be bounded by tanh (-1 to 1)."""
        x = np.array([100.0, -100.0])
        h = np.zeros(self.hidden_size)
        c = np.zeros(self.hidden_size)
        h_new, _ = lstm_cell(x, h, c, self.W_ih, self.W_hh, self.b_ih, self.b_hh)
        assert np.all(np.abs(h_new) <= 1.0 + 1e-10)

    def test_forward_sequence(self):
        seq_len = 5
        rng = np.random.default_rng(123)
        input_seq = rng.standard_normal((seq_len, self.input_size))
        all_h, h_final, c_final = lstm_forward(
            input_seq, self.W_ih, self.W_hh, self.b_ih, self.b_hh
        )
        assert all_h.shape[0] == seq_len
        np.testing.assert_array_equal(all_h[-1], h_final)

    def test_matches_pytorch(self):
        """Compare with PyTorch LSTM output."""
        try:
            import torch
            import torch.nn as nn
        except ImportError:
            pytest.skip("PyTorch not available")

        rng = np.random.default_rng(0)
        lstm_pt = nn.LSTM(self.input_size, self.hidden_size, batch_first=True)

        # Extract PyTorch weights
        with torch.no_grad():
            W_ih = lstm_pt.weight_ih_l0.numpy().astype(np.float64)
            W_hh = lstm_pt.weight_hh_l0.numpy().astype(np.float64)
            b_ih = lstm_pt.bias_ih_l0.numpy().astype(np.float64)
            b_hh = lstm_pt.bias_hh_l0.numpy().astype(np.float64)

        input_seq = rng.standard_normal((3, self.input_size))

        # NumPy reference
        all_h_np, h_np, c_np = lstm_forward(input_seq, W_ih, W_hh, b_ih, b_hh)

        # PyTorch
        with torch.no_grad():
            x_pt = torch.tensor(input_seq, dtype=torch.float32).unsqueeze(0)
            out_pt, (h_pt, c_pt) = lstm_pt(x_pt)
            h_pt = h_pt.squeeze().numpy().astype(np.float64)
            c_pt = c_pt.squeeze().numpy().astype(np.float64)

        np.testing.assert_allclose(h_np.squeeze(), h_pt, atol=1e-5)
        np.testing.assert_allclose(c_np.squeeze(), c_pt, atol=1e-5)
