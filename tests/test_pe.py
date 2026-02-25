"""Tests for Processing Element."""
import pytest
from accsim.core.pe import PE


class TestPE:
    def test_mac_basic(self):
        pe = PE(0, 0)
        pe.load_weight(2.0)
        act_out, psum_out = pe.compute(3.0, 0.0)
        assert psum_out == 6.0  # 0 + 2*3
        assert act_out == 3.0   # pass through

    def test_mac_with_psum(self):
        pe = PE(0, 0)
        pe.load_weight(0.5)
        _, psum = pe.compute(4.0, 10.0)
        assert psum == 12.0  # 10 + 0.5*4

    def test_zero_activation(self):
        pe = PE(0, 0)
        pe.load_weight(5.0)
        _, psum = pe.compute(0.0, 7.0)
        assert psum == 7.0  # 7 + 5*0

    def test_utilization_tracking(self):
        pe = PE(0, 0)
        pe.load_weight(1.0)
        pe.compute(1.0, 0.0)  # active
        pe.compute(0.0, 0.0)  # inactive (zero activation)
        pe.compute(2.0, 0.0)  # active
        assert pe.active_cycles == 2
        assert pe.total_cycles == 3
        assert pe.utilization == pytest.approx(2/3)

    def test_reset(self):
        pe = PE(0, 0)
        pe.load_weight(5.0)
        pe.compute(1.0, 0.0)
        pe.reset()
        assert pe.weight == 0.0
        assert pe.total_cycles == 0
