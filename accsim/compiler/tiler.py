"""Matrix tiling strategy for mapping large matmuls onto the systolic array."""
from __future__ import annotations
from dataclasses import dataclass
import math


@dataclass
class Tile:
    """A single tile of a matrix multiplication."""
    m_start: int
    m_end: int
    k_start: int
    k_end: int
    n_start: int
    n_end: int
    # Whether this tile's partial sum should accumulate with previous
    accumulate: bool = False

    @property
    def M(self) -> int:
        return self.m_end - self.m_start

    @property
    def K(self) -> int:
        return self.k_end - self.k_start

    @property
    def N(self) -> int:
        return self.n_end - self.n_start


@dataclass
class TilingPlan:
    """Complete tiling plan for a matrix multiplication C = A @ B.
    A: (M, K), B: (K, N), C: (M, N)
    """
    M: int
    K: int
    N: int
    array_size: int
    tiles: list[Tile]

    @property
    def num_tiles(self) -> int:
        return len(self.tiles)

    @property
    def num_weight_loads(self) -> int:
        """Number of unique weight tile loads needed."""
        seen = set()
        for t in self.tiles:
            seen.add((t.k_start, t.n_start))
        return len(seen)


def create_tiling_plan(M: int, K: int, N: int, array_size: int) -> TilingPlan:
    """Create a tiling plan to map (M,K)@(K,N) onto an array_size x array_size array.

    Tiling order: N-tiles (outer) -> K-tiles (middle, accumulate) -> M-tiles (inner)
    This minimizes weight reloads: each (K-tile, N-tile) weight block is loaded once.
    """
    tiles = []
    n_tiles = math.ceil(N / array_size)
    k_tiles = math.ceil(K / array_size)
    m_tiles = math.ceil(M / array_size)

    for nt in range(n_tiles):
        n_start = nt * array_size
        n_end = min(n_start + array_size, N)
        for kt in range(k_tiles):
            k_start = kt * array_size
            k_end = min(k_start + array_size, K)
            accumulate = kt > 0  # First K-tile starts fresh, rest accumulate
            for mt in range(m_tiles):
                m_start = mt * array_size
                m_end = min(m_start + array_size, M)
                tiles.append(Tile(
                    m_start=m_start, m_end=m_end,
                    k_start=k_start, k_end=k_end,
                    n_start=n_start, n_end=n_end,
                    accumulate=accumulate,
                ))

    return TilingPlan(M=M, K=K, N=N, array_size=array_size, tiles=tiles)
