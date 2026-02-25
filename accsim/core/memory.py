"""SRAM scratchpad and DRAM interface with cycle-accurate latency modeling."""
from __future__ import annotations
import numpy as np
from .clock import Clock
from ..config import AcceleratorConfig


class SRAMBuffer:
    """On-chip SRAM scratchpad buffer."""

    def __init__(self, name: str, size_bytes: int, read_latency: int = 1,
                 write_latency: int = 1):
        self.name = name
        self.size_bytes = size_bytes
        self.read_latency = read_latency
        self.write_latency = write_latency
        self._data: dict[str, np.ndarray] = {}
        self._used_bytes: int = 0
        # Statistics
        self.read_count: int = 0
        self.write_count: int = 0
        self.read_cycles: int = 0
        self.write_cycles: int = 0

    def _array_bytes(self, arr: np.ndarray) -> int:
        return arr.nbytes

    def write(self, key: str, data: np.ndarray, clock: Clock) -> int:
        """Write data to SRAM. Returns cycles consumed."""
        nbytes = self._array_bytes(data)
        # Check if overwriting existing entry
        if key in self._data:
            self._used_bytes -= self._array_bytes(self._data[key])
        if self._used_bytes + nbytes > self.size_bytes:
            raise MemoryError(
                f"{self.name}: Cannot write {nbytes}B, "
                f"{self._used_bytes}/{self.size_bytes}B used"
            )
        self._data[key] = data.copy()
        self._used_bytes += nbytes
        cycles = self.write_latency
        clock.tick(cycles)
        self.write_count += 1
        self.write_cycles += cycles
        return cycles

    def read(self, key: str, clock: Clock) -> tuple[np.ndarray, int]:
        """Read data from SRAM. Returns (data, cycles consumed)."""
        if key not in self._data:
            raise KeyError(f"{self.name}: Key '{key}' not found")
        cycles = self.read_latency
        clock.tick(cycles)
        self.read_count += 1
        self.read_cycles += cycles
        return self._data[key].copy(), cycles

    def has(self, key: str) -> bool:
        return key in self._data

    def evict(self, key: str):
        if key in self._data:
            self._used_bytes -= self._array_bytes(self._data[key])
            del self._data[key]

    def clear(self):
        self._data.clear()
        self._used_bytes = 0

    @property
    def utilization(self) -> float:
        return self._used_bytes / self.size_bytes if self.size_bytes > 0 else 0.0

    def reset_stats(self):
        self.read_count = 0
        self.write_count = 0
        self.read_cycles = 0
        self.write_cycles = 0


class DRAMInterface:
    """Off-chip DRAM with latency and bandwidth modeling."""

    def __init__(self, latency_cycles: int = 100,
                 bandwidth_bytes_per_cycle: float = 25.6):
        self.latency_cycles = latency_cycles
        self.bandwidth_bytes_per_cycle = bandwidth_bytes_per_cycle
        self._storage: dict[str, np.ndarray] = {}
        # Statistics
        self.read_count: int = 0
        self.write_count: int = 0
        self.total_bytes_read: int = 0
        self.total_bytes_written: int = 0
        self.total_cycles: int = 0

    def store(self, key: str, data: np.ndarray):
        """Store data in DRAM (no cycle cost — pre-loaded)."""
        self._storage[key] = data.copy()

    def load(self, key: str, clock: Clock) -> tuple[np.ndarray, int]:
        """Load data from DRAM. Returns (data, cycles consumed)."""
        if key not in self._storage:
            raise KeyError(f"DRAM: Key '{key}' not found")
        data = self._storage[key]
        nbytes = data.nbytes
        transfer_cycles = max(1, int(np.ceil(nbytes / self.bandwidth_bytes_per_cycle)))
        total = self.latency_cycles + transfer_cycles
        clock.tick(total)
        self.read_count += 1
        self.total_bytes_read += nbytes
        self.total_cycles += total
        return data.copy(), total

    def has(self, key: str) -> bool:
        return key in self._storage

    def reset_stats(self):
        self.read_count = 0
        self.write_count = 0
        self.total_bytes_read = 0
        self.total_bytes_written = 0
        self.total_cycles = 0


class MemoryHierarchy:
    """Complete memory hierarchy: SRAM buffers + DRAM."""

    def __init__(self, config: AcceleratorConfig):
        self.config = config
        self.input_buf = SRAMBuffer(
            "InputSRAM", config.sram_input_size,
            config.sram_read_latency, config.sram_write_latency
        )
        self.weight_buf = SRAMBuffer(
            "WeightSRAM", config.sram_weight_size,
            config.sram_read_latency, config.sram_write_latency
        )
        self.output_buf = SRAMBuffer(
            "OutputSRAM", config.sram_output_size,
            config.sram_read_latency, config.sram_write_latency
        )
        self.dram = DRAMInterface(
            config.dram_latency,
            config.dram_bandwidth_bytes_per_cycle
        )

    def load_to_sram(self, dram_key: str, sram_buf: SRAMBuffer,
                     sram_key: str, clock: Clock) -> int:
        """Load data from DRAM into SRAM buffer. Returns total cycles."""
        data, dram_cycles = self.dram.load(dram_key, clock)
        sram_cycles = sram_buf.write(sram_key, data, clock)
        return dram_cycles + sram_cycles

    def reset_stats(self):
        self.input_buf.reset_stats()
        self.weight_buf.reset_stats()
        self.output_buf.reset_stats()
        self.dram.reset_stats()
