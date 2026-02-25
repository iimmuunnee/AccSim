"""Fixed-point and quantization data types."""
import numpy as np


class FixedPoint:
    """Fixed-point number representation for quantized inference.

    Format: Q(integer_bits).(fractional_bits), total = 1 sign + integer + fractional
    """

    def __init__(self, total_bits: int = 16, fractional_bits: int = 8):
        self.total_bits = total_bits
        self.fractional_bits = fractional_bits
        self.integer_bits = total_bits - fractional_bits - 1  # 1 sign bit
        self._scale = 2 ** fractional_bits
        self._min_val = -(2 ** (total_bits - 1)) / self._scale
        self._max_val = (2 ** (total_bits - 1) - 1) / self._scale

    def quantize(self, x: np.ndarray) -> np.ndarray:
        """Quantize float array to fixed-point representation (still stored as float)."""
        scaled = np.round(x * self._scale) / self._scale
        return np.clip(scaled, self._min_val, self._max_val)

    @property
    def min_value(self) -> float:
        return self._min_val

    @property
    def max_value(self) -> float:
        return self._max_val

    def __repr__(self) -> str:
        return f"Q{self.integer_bits}.{self.fractional_bits} ({self.total_bits}-bit)"


# Common types
FP32 = None  # No quantization, native float32
INT8 = FixedPoint(8, 4)
INT16 = FixedPoint(16, 8)
