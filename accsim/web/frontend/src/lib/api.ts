import type { RunRequest, SimulationResult } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

export async function runSimulation(req: RunRequest): Promise<SimulationResult> {
  const res = await fetch(`${BASE}/api/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function getConfig(arraySize = 8): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/api/config?array_size=${arraySize}`)
  if (!res.ok) throw new Error(`Config API error: ${res.status}`)
  return res.json()
}

// Fallback demo data for when API is unavailable
export function getDemoData(): SimulationResult {
  return {
    total_cycles: 12480,
    utilization: 0.734,
    roofline_point: {
      operational_intensity: 4.0,
      performance: 58.72,
      is_compute_bound: true,
    },
    heatmap_matrix: Array.from({ length: 8 }, (_, i) =>
      Array.from({ length: 8 }, (_, j) => 0.5 + 0.4 * Math.sin(i * 0.8 + j * 0.5))
    ),
    breakdown: { compute: 8960, memory: 2800, activation: 480, stall: 240 },
    timeline: [
      { opcode: 'LOAD_WEIGHT', opcode_kr: '가중치 로드', start_cycle: 0, end_cycle: 100, cycles: 100, comment: 'W_ih 로드' },
      { opcode: 'MATMUL', opcode_kr: '행렬 곱셈', start_cycle: 100, end_cycle: 4100, cycles: 4000, comment: 'W_ih @ x_t' },
      { opcode: 'LOAD_WEIGHT', opcode_kr: '가중치 로드', start_cycle: 4100, end_cycle: 4200, cycles: 100, comment: 'W_hh 로드' },
      { opcode: 'MATMUL', opcode_kr: '행렬 곱셈', start_cycle: 4200, end_cycle: 8200, cycles: 4000, comment: 'W_hh @ h_t' },
      { opcode: 'ELEM_ADD', opcode_kr: '원소 덧셈', start_cycle: 8200, end_cycle: 8300, cycles: 100, comment: 'gates 합산' },
      { opcode: 'ACT_SIGMOID', opcode_kr: 'Sigmoid 활성화', start_cycle: 8300, end_cycle: 8560, cycles: 260, comment: 'i, f, o 게이트' },
      { opcode: 'ACT_TANH', opcode_kr: 'Tanh 활성화', start_cycle: 8560, end_cycle: 8820, cycles: 260, comment: 'g 게이트' },
      { opcode: 'ELEM_MUL', opcode_kr: '원소 곱셈', start_cycle: 8820, end_cycle: 8920, cycles: 100, comment: 'cell state 업데이트' },
      { opcode: 'ACT_TANH', opcode_kr: 'Tanh 활성화', start_cycle: 8920, end_cycle: 9180, cycles: 260, comment: 'hidden state' },
    ],
    config: { array_size: 8, clock_freq_hz: 1_000_000_000, peak_gops: 0.128, dram_bandwidth_gbps: 25.6 },
    metrics: {
      total_cycles: 12480,
      matmul_cycles: 8000,
      memory_cycles: 3200,
      activation_cycles: 780,
      elementwise_cycles: 200,
      instruction_count: 9,
      pe_utilization: 0.734,
      total_ops: 786432,
      arithmetic_intensity: 4.0,
      achieved_gops: 58.72,
      cycle_breakdown: { compute: 8960, memory: 2800, activation: 480, stall: 240 },
    },
    animation_frames: [],
    error: null,
  }
}
