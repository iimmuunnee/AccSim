"""Instruction scheduling - converts tiling plan into instruction stream."""
from __future__ import annotations
from .instruction import Instruction, Opcode, Program
from .tiler import TilingPlan


def schedule_matmul(plan: TilingPlan, input_key: str, weight_key: str,
                    output_key: str, comment_prefix: str = "") -> Program:
    """Generate instruction stream for a tiled matrix multiply.

    Handles weight loading, input loading, matmul execution, and
    partial sum accumulation across K-tiles.
    """
    prog = Program()
    prog.metadata['tiling_plan'] = plan

    for i, tile in enumerate(plan.tiles):
        prefix = f"{comment_prefix}tile[{i}]" if comment_prefix else f"tile[{i}]"

        # Load weight tile
        w_key = f"{weight_key}_k{tile.k_start}_n{tile.n_start}"
        prog.add(Instruction(
            opcode=Opcode.LOAD_WEIGHT,
            src1=w_key,
            dst=w_key,
            comment=f"{prefix} load W[{tile.k_start}:{tile.k_end},{tile.n_start}:{tile.n_end}]",
        ))

        # Load input tile
        a_key = f"{input_key}_m{tile.m_start}_k{tile.k_start}"
        prog.add(Instruction(
            opcode=Opcode.LOAD_INPUT,
            src1=a_key,
            dst=a_key,
            comment=f"{prefix} load A[{tile.m_start}:{tile.m_end},{tile.k_start}:{tile.k_end}]",
        ))

        # Matmul
        out_key = f"{output_key}_m{tile.m_start}_n{tile.n_start}"
        prog.add(Instruction(
            opcode=Opcode.MATMUL,
            src1=a_key,
            src2=w_key,
            dst=f"{out_key}_partial" if tile.accumulate else out_key,
            M=tile.M, K=tile.K, N=tile.N,
            comment=f"{prefix} matmul ({tile.M}x{tile.K})@({tile.K}x{tile.N})",
        ))

        # Accumulate partial sums if needed
        if tile.accumulate:
            prog.add(Instruction(
                opcode=Opcode.ELEM_ADD,
                src1=out_key,
                src2=f"{out_key}_partial",
                dst=out_key,
                comment=f"{prefix} accumulate partial sum",
            ))

    return prog
