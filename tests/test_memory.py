"""Tests for memory hierarchy."""
import pytest
import numpy as np
from accsim.core.clock import Clock
from accsim.core.memory import SRAMBuffer, DRAMInterface, MemoryHierarchy
from accsim.config import AcceleratorConfig


class TestSRAMBuffer:
    def test_write_read(self):
        clock = Clock()
        buf = SRAMBuffer("test", 1024)
        data = np.array([1.0, 2.0, 3.0])
        buf.write("key1", data, clock)
        result, _ = buf.read("key1", clock)
        np.testing.assert_array_equal(result, data)

    def test_capacity_overflow(self):
        clock = Clock()
        buf = SRAMBuffer("test", 100)
        big_data = np.zeros(1000, dtype=np.float64)  # 8000 bytes > 100
        with pytest.raises(MemoryError):
            buf.write("big", big_data, clock)

    def test_read_missing_key(self):
        clock = Clock()
        buf = SRAMBuffer("test", 1024)
        with pytest.raises(KeyError):
            buf.read("nonexistent", clock)

    def test_overwrite(self):
        clock = Clock()
        buf = SRAMBuffer("test", 1024)
        buf.write("k", np.array([1.0]), clock)
        buf.write("k", np.array([2.0]), clock)
        result, _ = buf.read("k", clock)
        assert result[0] == 2.0

    def test_cycle_tracking(self):
        clock = Clock()
        buf = SRAMBuffer("test", 1024, read_latency=2, write_latency=3)
        buf.write("k", np.array([1.0]), clock)
        assert clock.cycle == 3
        buf.read("k", clock)
        assert clock.cycle == 5  # 3 + 2


class TestDRAMInterface:
    def test_store_load(self):
        clock = Clock()
        dram = DRAMInterface(latency_cycles=10, bandwidth_bytes_per_cycle=8.0)
        data = np.array([1.0, 2.0])  # 16 bytes
        dram.store("k", data)
        result, cycles = dram.load("k", clock)
        np.testing.assert_array_equal(result, data)
        # latency(10) + transfer(ceil(16/8)=2) = 12
        assert cycles == 12

    def test_load_missing(self):
        clock = Clock()
        dram = DRAMInterface()
        with pytest.raises(KeyError):
            dram.load("missing", clock)


class TestMemoryHierarchy:
    def test_dram_to_sram(self):
        config = AcceleratorConfig()
        mem = MemoryHierarchy(config)
        clock = Clock()
        data = np.ones((8, 8), dtype=np.float64)
        mem.dram.store("weights", data)
        mem.load_to_sram("weights", mem.weight_buf, "w0", clock)
        result, _ = mem.weight_buf.read("w0", clock)
        np.testing.assert_array_equal(result, data)
