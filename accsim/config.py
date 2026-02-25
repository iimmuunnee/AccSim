"""Accelerator configuration."""
from dataclasses import dataclass, field


@dataclass
class AcceleratorConfig:
    """Hardware configuration for the AI accelerator."""
    # Systolic array
    array_size: int = 8          # NxN PE array (8x8 matches SolarX input_size=8)
    data_width: int = 32         # bits per element (FP32)

    # Memory hierarchy (bytes)
    sram_input_size: int = 64 * 1024    # 64KB input buffer
    sram_weight_size: int = 128 * 1024  # 128KB weight buffer
    sram_output_size: int = 64 * 1024   # 64KB output buffer
    sram_read_latency: int = 1          # cycles
    sram_write_latency: int = 1         # cycles

    # DRAM
    dram_latency: int = 100             # cycles for first access
    dram_bandwidth: float = 25.6e9      # bytes/sec (DDR4-3200 single channel)

    # Clock
    clock_freq_hz: float = 1.0e9        # 1 GHz

    # Activation function latency (cycles)
    activation_latency: int = 3
    elementwise_latency: int = 1

    @property
    def bytes_per_element(self) -> int:
        return self.data_width // 8

    @property
    def peak_ops_per_cycle(self) -> int:
        """Peak MAC operations per cycle (one per PE)."""
        return self.array_size ** 2

    @property
    def peak_gops(self) -> float:
        """Peak GOPS at given clock frequency."""
        return self.peak_ops_per_cycle * self.clock_freq_hz / 1e9

    @property
    def dram_bandwidth_bytes_per_cycle(self) -> float:
        return self.dram_bandwidth / self.clock_freq_hz


DEFAULT_CONFIG = AcceleratorConfig()
