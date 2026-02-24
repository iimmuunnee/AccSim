"""Tests for the controller and instruction execution."""
import pytest
import numpy as np
from accsim.core.controller import Controller
from accsim.compiler.instruction import Instruction, Opcode, Program
from accsim.config import AcceleratorConfig


class TestController:
    def test_simple_matmul(self):
        """Execute a simple matmul through the controller."""
        config = AcceleratorConfig(array_size=4)
        ctrl = Controller(config)

        A = np.array([[1.0, 2.0], [3.0, 4.0]])
        W = np.array([[5.0, 6.0], [7.0, 8.0]])

        # Preload data
        ctrl.preload_to_sram('input', 'A', A)
        ctrl.preload_to_sram('weight', 'W', W)

        prog = Program()
        prog.add(Instruction(opcode=Opcode.MATMUL, src1='A', src2='W', dst='C',
                             M=2, K=2, N=2))
        stats = ctrl.execute_program(prog)

        result = ctrl.get_sram_data('output', 'C')
        expected = A @ W
        np.testing.assert_allclose(result, expected, atol=1e-10)
        assert stats['total_cycles'] > 0

    def test_matmul_with_activation(self):
        """Matmul followed by sigmoid activation."""
        config = AcceleratorConfig(array_size=4)
        ctrl = Controller(config)

        A = np.array([[1.0, 0.0], [0.0, 1.0]])
        W = np.array([[0.0], [0.0]])

        ctrl.preload_to_sram('input', 'A', A)
        ctrl.preload_to_sram('weight', 'W', W)

        prog = Program()
        prog.add(Instruction(opcode=Opcode.MATMUL, src1='A', src2='W', dst='C',
                             M=2, K=2, N=1))
        prog.add(Instruction(opcode=Opcode.ACT_SIGMOID, src1='C', dst='C_sig'))
        stats = ctrl.execute_program(prog)

        result = ctrl.get_sram_data('output', 'C_sig')
        # sigmoid(0) = 0.5
        np.testing.assert_allclose(result, 0.5, atol=1e-6)

    def test_elementwise_ops(self):
        """Test element-wise add and multiply."""
        config = AcceleratorConfig(array_size=4)
        ctrl = Controller(config)

        a = np.array([1.0, 2.0, 3.0])
        b = np.array([4.0, 5.0, 6.0])

        ctrl.preload_to_sram('output', 'a', a)
        ctrl.preload_to_sram('output', 'b', b)

        prog = Program()
        prog.add(Instruction(opcode=Opcode.ELEM_ADD, src1='a', src2='b', dst='sum'))
        prog.add(Instruction(opcode=Opcode.ELEM_MUL, src1='a', src2='b', dst='prod'))
        stats = ctrl.execute_program(prog)

        np.testing.assert_allclose(ctrl.get_sram_data('output', 'sum'), [5, 7, 9])
        np.testing.assert_allclose(ctrl.get_sram_data('output', 'prod'), [4, 10, 18])

    def test_dram_load(self):
        """Test loading from DRAM to SRAM."""
        config = AcceleratorConfig(array_size=4, dram_latency=10)
        ctrl = Controller(config)

        data = np.ones((4, 4), dtype=np.float64)
        ctrl.preload_to_dram('weights', data)

        prog = Program()
        prog.add(Instruction(opcode=Opcode.LOAD_WEIGHT, src1='weights', dst='w0'))
        stats = ctrl.execute_program(prog)

        assert stats['total_cycles'] > 10  # At least DRAM latency
