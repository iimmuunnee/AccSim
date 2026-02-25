"""Global cycle counter for the simulator."""


class Clock:
    """Global clock that tracks simulation cycles."""

    def __init__(self):
        self._cycle: int = 0

    @property
    def cycle(self) -> int:
        return self._cycle

    def tick(self, n: int = 1) -> int:
        """Advance clock by n cycles. Returns new cycle count."""
        self._cycle += n
        return self._cycle

    def reset(self):
        self._cycle = 0
