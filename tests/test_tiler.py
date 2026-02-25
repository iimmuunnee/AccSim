"""Tests for tiling strategy."""
import pytest
from accsim.compiler.tiler import create_tiling_plan


class TestTiler:
    def test_exact_fit(self):
        """Matrix fits exactly in the array."""
        plan = create_tiling_plan(M=8, K=8, N=8, array_size=8)
        assert plan.num_tiles == 1

    def test_k_tiling(self):
        """K dimension requires multiple tiles."""
        # SolarX W_hh: (256, 64) -> K=64 with array_size=8 -> 8 K-tiles
        plan = create_tiling_plan(M=256, K=64, N=1, array_size=8)
        assert any(t.accumulate for t in plan.tiles)

    def test_solarx_wih(self):
        """SolarX W_ih (256,8) @ (8,1) tiling."""
        plan = create_tiling_plan(M=256, K=8, N=1, array_size=8)
        # K=8 fits in one tile, M=256 needs 32 M-tiles
        assert plan.num_tiles == 32
        # No accumulation needed (single K-tile)
        assert not any(t.accumulate for t in plan.tiles)

    def test_solarx_whh(self):
        """SolarX W_hh (256,64) @ (64,1) tiling."""
        plan = create_tiling_plan(M=256, K=64, N=1, array_size=8)
        # K=64 -> 8 K-tiles, M=256 -> 32 M-tiles, N=1 -> 1 N-tile
        # Total = 1 * 8 * 32 = 256 tiles
        assert plan.num_tiles == 256
        # Most tiles should accumulate (except first K-tile)
        accum_count = sum(1 for t in plan.tiles if t.accumulate)
        assert accum_count > 0

    def test_tile_covers_full_matrix(self):
        """All tiles together should cover the entire output."""
        plan = create_tiling_plan(M=10, K=12, N=6, array_size=4)
        # Check all output positions are covered
        covered = set()
        for t in plan.tiles:
            for m in range(t.m_start, t.m_end):
                for n in range(t.n_start, t.n_end):
                    covered.add((m, n))
        expected = {(m, n) for m in range(10) for n in range(6)}
        assert covered == expected
