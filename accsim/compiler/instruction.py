"""ISA definition for the accelerator."""
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any


class Opcode(Enum):
    LOAD_WEIGHT = auto()   # Load weight tile from SRAM to PE array
    LOAD_INPUT = auto()    # Load input from DRAM to input SRAM
    MATMUL = auto()        # Execute matrix multiply on systolic array
    STORE = auto()         # Store result from output SRAM to DRAM (or keep in SRAM)
    ACT_SIGMOID = auto()   # Element-wise sigmoid activation
    ACT_TANH = auto()      # Element-wise tanh activation
    ELEM_MUL = auto()      # Element-wise multiply
    ELEM_ADD = auto()       # Element-wise add
    NOP = auto()           # No operation


@dataclass
class Instruction:
    """Single accelerator instruction."""
    opcode: Opcode
    # Operand keys for memory addressing
    src1: str = ""         # Source 1 key (SRAM or DRAM)
    src2: str = ""         # Source 2 key
    dst: str = ""          # Destination key
    # Matrix dimensions for MATMUL
    M: int = 0
    K: int = 0
    N: int = 0
    # Metadata
    comment: str = ""

    def __repr__(self) -> str:
        parts = [self.opcode.name]
        if self.src1:
            parts.append(f"src1={self.src1}")
        if self.src2:
            parts.append(f"src2={self.src2}")
        if self.dst:
            parts.append(f"dst={self.dst}")
        if self.M:
            parts.append(f"({self.M}x{self.K})@({self.K}x{self.N})")
        if self.comment:
            parts.append(f"# {self.comment}")
        return " ".join(parts)


@dataclass
class Program:
    """A sequence of instructions forming a complete program."""
    instructions: list[Instruction] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

    def add(self, inst: Instruction):
        self.instructions.append(inst)

    def __len__(self) -> int:
        return len(self.instructions)

    def __iter__(self):
        return iter(self.instructions)

    def dump(self) -> str:
        """Pretty-print the program."""
        lines = [f"Program ({len(self.instructions)} instructions):"]
        for i, inst in enumerate(self.instructions):
            lines.append(f"  [{i:3d}] {inst}")
        return "\n".join(lines)
