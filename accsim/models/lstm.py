"""NumPy reference LSTM implementation for verification."""
from __future__ import annotations
import numpy as np


def sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-np.clip(x, -500, 500)))


def lstm_cell(
    x_t: np.ndarray,
    h_prev: np.ndarray,
    c_prev: np.ndarray,
    W_ih: np.ndarray,
    W_hh: np.ndarray,
    b_ih: np.ndarray,
    b_hh: np.ndarray,
) -> tuple[np.ndarray, np.ndarray]:
    """Single LSTM cell forward pass (matches PyTorch semantics).

    Args:
        x_t: Input at time t, shape (input_size,) or (input_size, batch)
        h_prev: Previous hidden state, shape (hidden_size,) or (hidden_size, batch)
        c_prev: Previous cell state, shape (hidden_size,) or (hidden_size, batch)
        W_ih: Input-hidden weights (4*hidden_size, input_size)
        W_hh: Hidden-hidden weights (4*hidden_size, hidden_size)
        b_ih: Input-hidden bias (4*hidden_size,)
        b_hh: Hidden-hidden bias (4*hidden_size,)

    Returns:
        (h_t, c_t) new hidden and cell states
    """
    # Ensure column vectors for single samples
    if x_t.ndim == 1:
        x_t = x_t.reshape(-1, 1)
    if h_prev.ndim == 1:
        h_prev = h_prev.reshape(-1, 1)
    if c_prev.ndim == 1:
        c_prev = c_prev.reshape(-1, 1)

    hidden_size = W_ih.shape[0] // 4
    bias = (b_ih + b_hh).reshape(-1, 1)

    # Gates computation
    gates = W_ih @ x_t + W_hh @ h_prev + bias  # (4H, batch)

    # Split gates: PyTorch order (i, f, g, o)
    i = sigmoid(gates[0:hidden_size])
    f = sigmoid(gates[hidden_size:2*hidden_size])
    g = np.tanh(gates[2*hidden_size:3*hidden_size])
    o = sigmoid(gates[3*hidden_size:4*hidden_size])

    # Cell and hidden state update
    c_t = f * c_prev + i * g
    h_t = o * np.tanh(c_t)

    return h_t, c_t


def lstm_forward(
    input_seq: np.ndarray,
    W_ih: np.ndarray,
    W_hh: np.ndarray,
    b_ih: np.ndarray,
    b_hh: np.ndarray,
    h_0: np.ndarray | None = None,
    c_0: np.ndarray | None = None,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Full LSTM forward pass over a sequence.

    Args:
        input_seq: Shape (seq_len, input_size) or (seq_len, batch, input_size)
        Others: Same as lstm_cell

    Returns:
        (all_h, h_T, c_T) where all_h is (seq_len, hidden_size, batch)
    """
    hidden_size = W_ih.shape[0] // 4

    if input_seq.ndim == 2:
        seq_len, input_size = input_seq.shape
        batch = 1
    else:
        seq_len, batch, input_size = input_seq.shape

    if h_0 is None:
        h_0 = np.zeros((hidden_size, batch), dtype=np.float64)
    if c_0 is None:
        c_0 = np.zeros((hidden_size, batch), dtype=np.float64)

    h = h_0.copy()
    c = c_0.copy()
    all_h = []

    for t in range(seq_len):
        x_t = input_seq[t] if input_seq.ndim == 3 else input_seq[t]
        h, c = lstm_cell(x_t, h, c, W_ih, W_hh, b_ih, b_hh)
        all_h.append(h.copy())

    return np.array(all_h), h, c
