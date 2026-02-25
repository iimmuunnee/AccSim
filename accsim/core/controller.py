"""Instruction dispatch and execution controller."""
from __future__ import annotations
import numpy as np
from .clock import Clock
from .systolic_array import SystolicArray
from .memory import MemoryHierarchy
from ..compiler.instruction import Instruction, Opcode, Program
from ..config import AcceleratorConfig


class Controller:
    """Fetches and executes instructions on the accelerator hardware."""

    def __init__(self, config: AcceleratorConfig):
        self.config = config
        self.clock = Clock()
        self.array = SystolicArray(config.array_size, self.clock)
        self.memory = MemoryHierarchy(config)
        # Execution trace
        self.trace: list[dict] = []

    def execute_program(self, program: Program) -> dict:
        """Execute a full program. Returns execution statistics."""
        self.clock.reset()
        self.array.reset()
        self.memory.reset_stats()
        self.trace.clear()
        start_cycle = 0

        for i, inst in enumerate(program):
            cycle_before = self.clock.cycle
            self._execute_instruction(inst)
            cycles_used = self.clock.cycle - cycle_before
            self.trace.append({
                'index': i,
                'opcode': inst.opcode.name,
                'start_cycle': cycle_before,
                'end_cycle': self.clock.cycle,
                'cycles': cycles_used,
                'comment': inst.comment,
            })

        total_cycles = self.clock.cycle
        return {
            'total_cycles': total_cycles,
            'instruction_count': len(program),
            'array_utilization': self.array.get_utilization(),
            'trace': self.trace,
        }

    def _execute_instruction(self, inst: Instruction):
        """Dispatch and execute a single instruction."""
        match inst.opcode:
            case Opcode.LOAD_WEIGHT:
                self._exec_load_weight(inst)
            case Opcode.LOAD_INPUT:
                self._exec_load_input(inst)
            case Opcode.MATMUL:
                self._exec_matmul(inst)
            case Opcode.STORE:
                self._exec_store(inst)
            case Opcode.ACT_SIGMOID:
                self._exec_activation(inst, np.vectorize(self._sigmoid))
            case Opcode.ACT_TANH:
                self._exec_activation(inst, np.tanh)
            case Opcode.ELEM_MUL:
                self._exec_elementwise(inst, np.multiply)
            case Opcode.ELEM_ADD:
                self._exec_elementwise(inst, np.add)
            case Opcode.NOP:
                self.clock.tick(1)

    def _exec_load_weight(self, inst: Instruction):
        """Load weight from DRAM -> weight SRAM."""
        if self.memory.dram.has(inst.src1):
            self.memory.load_to_sram(
                inst.src1, self.memory.weight_buf, inst.dst or inst.src1, self.clock
            )
        # If already in weight SRAM, just 1 cycle
        elif self.memory.weight_buf.has(inst.src1):
            self.clock.tick(1)

    def _exec_load_input(self, inst: Instruction):
        """Load input from DRAM -> input SRAM."""
        if self.memory.dram.has(inst.src1):
            self.memory.load_to_sram(
                inst.src1, self.memory.input_buf, inst.dst or inst.src1, self.clock
            )
        elif self.memory.input_buf.has(inst.src1):
            self.clock.tick(1)

    def _read_from_any_sram(self, key: str) -> tuple[np.ndarray, int]:
        """Read from whichever SRAM buffer contains the key."""
        for buf in [self.memory.input_buf, self.memory.weight_buf, self.memory.output_buf]:
            if buf.has(key):
                return buf.read(key, self.clock)
        raise KeyError(f"Key '{key}' not found in any SRAM buffer")

    def _exec_matmul(self, inst: Instruction):
        """Execute matrix multiply on systolic array. C = src1 @ src2."""
        # Read operands from any SRAM buffer
        A, _ = self._read_from_any_sram(inst.src1)
        W, _ = self._read_from_any_sram(inst.src2)

        M, K, N = inst.M, inst.K, inst.N

        # Reshape data to match instruction dimensions
        if A.ndim == 1:
            A = A.reshape(M, K) if A.size == M * K else A.reshape(-1, 1)
        if W.ndim == 1:
            W = W.reshape(K, N) if W.size == K * N else W.reshape(-1, 1)

        # Slice to tile dimensions if data is larger
        A_tile = A[:M, :K]
        W_tile = W[:K, :N]

        # Execute on systolic array
        self.array.reset_stats()
        result, cycles = self.array.execute_matmul(A_tile, W_tile)

        # Write result to output SRAM
        self.memory.output_buf.write(inst.dst, result, self.clock)

    def _exec_activation(self, inst: Instruction, func):
        """Apply element-wise activation function."""
        # Read from output SRAM
        data, _ = self.memory.output_buf.read(inst.src1, self.clock)
        result = func(data)
        self.memory.output_buf.write(inst.dst, result, self.clock)
        self.clock.tick(self.config.activation_latency)

    def _exec_elementwise(self, inst: Instruction, func):
        """Element-wise binary operation."""
        # Both operands from output SRAM
        a, _ = self.memory.output_buf.read(inst.src1, self.clock)
        b, _ = self.memory.output_buf.read(inst.src2, self.clock)
        result = func(a, b)
        self.memory.output_buf.write(inst.dst, result, self.clock)
        self.clock.tick(self.config.elementwise_latency)

    def get_sram_data(self, buf_name: str, key: str) -> np.ndarray:
        """Read data from an SRAM buffer without cycle cost (for verification)."""
        buf = {
            'input': self.memory.input_buf,
            'weight': self.memory.weight_buf,
            'output': self.memory.output_buf,
        }[buf_name]
        return buf._data.get(key)

    def preload_to_dram(self, key: str, data: np.ndarray):
        """Pre-load data into DRAM (no cycle cost)."""
        self.memory.dram.store(key, data)

    def preload_to_sram(self, buf_name: str, key: str, data: np.ndarray):
        """Pre-load data directly into SRAM (no cycle cost, for testing)."""
        buf = {
            'input': self.memory.input_buf,
            'weight': self.memory.weight_buf,
            'output': self.memory.output_buf,
        }[buf_name]
        buf._data[key] = data.copy()
        buf._used_bytes += data.nbytes

    @staticmethod
    def _sigmoid(x: float) -> float:
        return 1.0 / (1.0 + np.exp(-np.clip(x, -500, 500)))
