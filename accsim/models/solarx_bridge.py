"""SolarX model bridge - loads weights and prepares inputs from the SolarX project."""
from __future__ import annotations
from pathlib import Path
import numpy as np
from ..compiler.exporter import load_state_dict, extract_lstm_weights, extract_fc_weights


SOLARX_MODEL_PATH = Path("C:/dev/SolarX/src/lstm_solar_model.pth")

# SolarX LSTM architecture
SOLARX_INPUT_SIZE = 8
SOLARX_HIDDEN_SIZE = 64
SOLARX_SEQ_LEN = 24
SOLARX_NUM_FEATURES = 8  # solar irradiance features


class SolarXBridge:
    """Bridge between SolarX LSTM model and AccSim accelerator."""

    def __init__(self, model_path: str | Path | None = None):
        self.model_path = Path(model_path) if model_path else SOLARX_MODEL_PATH
        self.state_dict: dict[str, np.ndarray] | None = None
        self.lstm_weights: dict[str, np.ndarray] | None = None
        self.fc_weights: dict[str, np.ndarray] | None = None
        self.layer_norm_weights: dict[str, np.ndarray] | None = None

    def load(self) -> SolarXBridge:
        """Load model weights from disk."""
        self.state_dict = load_state_dict(self.model_path)
        self.lstm_weights = extract_lstm_weights(self.state_dict)
        self.fc_weights = extract_fc_weights(self.state_dict)
        self.layer_norm_weights = {
            'weight': self.state_dict['layer_norm.weight'],
            'bias': self.state_dict['layer_norm.bias'],
        }
        return self

    def get_lstm_weights(self) -> dict[str, np.ndarray]:
        """Get LSTM weights in AccSim format."""
        if self.lstm_weights is None:
            self.load()
        return self.lstm_weights

    def get_fc_weights(self) -> dict[str, np.ndarray]:
        """Get FC layer weights."""
        if self.fc_weights is None:
            self.load()
        return self.fc_weights

    def get_layer_norm_weights(self) -> dict[str, np.ndarray]:
        """Get LayerNorm weights."""
        if self.layer_norm_weights is None:
            self.load()
        return self.layer_norm_weights

    def generate_sample_input(self, batch_size: int = 1,
                              seed: int = 42) -> np.ndarray:
        """Generate a sample input sequence matching SolarX format.

        Returns: shape (seq_len, input_size) or (seq_len, batch_size, input_size)
        """
        rng = np.random.default_rng(seed)
        # Simulate normalized solar irradiance data
        data = rng.standard_normal((SOLARX_SEQ_LEN, batch_size, SOLARX_INPUT_SIZE))
        if batch_size == 1:
            return data.squeeze(1)  # (24, 8)
        return data

    def numpy_reference_inference(self, input_data: np.ndarray) -> dict[str, np.ndarray]:
        """Run full inference using NumPy reference, including LayerNorm and FC.

        Args:
            input_data: Shape (seq_len, input_size) or (seq_len, batch, input_size)

        Returns:
            Dict with keys: all_h, h_final, c_final, ln_out, output
        """
        from .lstm import lstm_forward

        w = self.get_lstm_weights()
        all_h, h_final, c_final = lstm_forward(
            input_data,
            w['weight_ih'], w['weight_hh'],
            w['bias_ih'], w['bias_hh'],
        )

        # LayerNorm on final hidden state
        ln_w = self.get_layer_norm_weights()
        h_for_ln = h_final.squeeze()  # (hidden_size,)
        mean = np.mean(h_for_ln)
        var = np.var(h_for_ln)
        ln_out = ln_w['weight'] * (h_for_ln - mean) / np.sqrt(var + 1e-5) + ln_w['bias']

        # FC layer
        fc = self.get_fc_weights()
        output = fc['weight'] @ ln_out.reshape(-1, 1) + fc['bias'].reshape(-1, 1)

        return {
            'all_h': all_h,
            'h_final': h_final,
            'c_final': c_final,
            'ln_out': ln_out,
            'output': output.squeeze(),
        }

    def pytorch_reference_inference(self, input_data: np.ndarray) -> np.ndarray:
        """Run inference using PyTorch for ground truth comparison."""
        try:
            import torch
            import torch.nn as nn
        except ImportError:
            raise ImportError("PyTorch required for reference inference")

        # Recreate model architecture
        class SolarLSTM(nn.Module):
            def __init__(self):
                super().__init__()
                self.lstm = nn.LSTM(SOLARX_INPUT_SIZE, SOLARX_HIDDEN_SIZE, batch_first=True)
                self.layer_norm = nn.LayerNorm(SOLARX_HIDDEN_SIZE)
                self.fc = nn.Linear(SOLARX_HIDDEN_SIZE, 1)

            def forward(self, x):
                out, _ = self.lstm(x)
                out = self.layer_norm(out[:, -1, :])
                return self.fc(out)

        model = SolarLSTM()
        state_dict_torch = {k: torch.tensor(v, dtype=torch.float32)
                            for k, v in self.state_dict.items()}
        model.load_state_dict(state_dict_torch)
        model.eval()

        with torch.no_grad():
            x = torch.tensor(input_data, dtype=torch.float32)
            if x.ndim == 2:
                x = x.unsqueeze(0)  # Add batch dim
            output = model(x)

        return output.numpy().astype(np.float64)
