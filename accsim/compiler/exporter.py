"""PyTorch weight extraction utilities."""
from __future__ import annotations
from pathlib import Path
import numpy as np

# PyTorch is optional
try:
    import torch
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


def load_state_dict(model_path: str | Path) -> dict[str, np.ndarray]:
    """Load PyTorch model weights as numpy arrays.

    Args:
        model_path: Path to .pth or .pt file

    Returns:
        Dictionary mapping parameter names to numpy arrays
    """
    if not HAS_TORCH:
        raise ImportError("PyTorch is required for weight export. Install with: pip install torch")

    state_dict = torch.load(str(model_path), map_location='cpu', weights_only=True)

    # Handle case where state_dict is wrapped in a model
    if hasattr(state_dict, 'state_dict'):
        state_dict = state_dict.state_dict()

    return {k: v.numpy().astype(np.float64) for k, v in state_dict.items()}


def extract_lstm_weights(state_dict: dict[str, np.ndarray],
                         layer_idx: int = 0) -> dict[str, np.ndarray]:
    """Extract LSTM weight matrices from a state dict.

    PyTorch LSTM gate order: (input, forget, cell_gate, output) = (i, f, g, o)
    Each gate gets hidden_size rows.

    Returns dict with keys: W_ih, W_hh, b_ih, b_hh
    """
    prefix = f"lstm.weight_ih_l{layer_idx}"
    weights = {}

    for suffix, key in [
        ("weight_ih", f"lstm.weight_ih_l{layer_idx}"),
        ("weight_hh", f"lstm.weight_hh_l{layer_idx}"),
        ("bias_ih", f"lstm.bias_ih_l{layer_idx}"),
        ("bias_hh", f"lstm.bias_hh_l{layer_idx}"),
    ]:
        if key in state_dict:
            weights[suffix] = state_dict[key]

    return weights


def extract_fc_weights(state_dict: dict[str, np.ndarray],
                       fc_name: str = "fc") -> dict[str, np.ndarray]:
    """Extract fully-connected layer weights."""
    weights = {}
    for suffix in ["weight", "bias"]:
        key = f"{fc_name}.{suffix}"
        if key in state_dict:
            weights[suffix] = state_dict[key]
    return weights
