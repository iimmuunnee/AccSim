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
export function getDemoData(arraySize = 8, batchSize = 1, seqLen = 24): SimulationResult {
  const arrScale = arraySize / 8
  // utilization: arraySize↑ → 활용률↑, batchSize↑ → 활용률↑ (포화 곡선)
  const utilization = Math.min(0.95, 0.3 + 0.35 * (1 - 4 / (arraySize + 4)) + 0.3 * (1 - 1 / (batchSize + 1)))
  // totalCycles: seqLen·batchSize에 비례, arraySize²에 반비례
  const totalCycles = Math.round(12480 * (seqLen / 24) * (batchSize) / (arrScale * arrScale))
  const peakGops = arraySize * arraySize // N² MACs/cycle at 1GHz
  // compute 비율: arraySize 커지면 compute 비율↑
  const computeRatio = 0.65 + 0.1 * (1 - 4 / (arraySize + 4))
  const memoryRatio = 1 - computeRatio - 0.06
  const computeCycles = Math.round(totalCycles * computeRatio)
  const memoryCycles = Math.round(totalCycles * memoryRatio)
  const activationCycles = Math.round(totalCycles * 0.04)
  const stallCycles = totalCycles - computeCycles - memoryCycles - activationCycles
  const achievedGops = (utilization * peakGops)
  const arithmeticIntensity = 4.0 * batchSize / (1 + (batchSize - 1) * 0.3)
  return {
    total_cycles: totalCycles,
    utilization,
    roofline_point: {
      operational_intensity: arithmeticIntensity,
      performance: achievedGops,
      is_compute_bound: arithmeticIntensity > 3.0,
    },
    heatmap_matrix: Array.from({ length: arraySize }, (_, i) =>
      Array.from({ length: arraySize }, (_, j) => {
        const base = 0.5 + 0.4 * Math.sin(i * (0.8 * 8 / arraySize) + j * (0.5 * 8 / arraySize))
        const batchBoost = Math.min(0.15, 0.05 * Math.log2(batchSize + 1))
        return Math.min(1.0, base + batchBoost)
      })
    ),
    breakdown: {
      compute: computeCycles,
      memory: memoryCycles,
      activation: activationCycles,
      stall: stallCycles,
    },
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
    config: { array_size: arraySize, clock_freq_hz: 1_000_000_000, peak_gops: peakGops, dram_bandwidth_gbps: 25.6 },
    metrics: {
      total_cycles: totalCycles,
      matmul_cycles: computeCycles,
      memory_cycles: memoryCycles,
      activation_cycles: activationCycles,
      elementwise_cycles: stallCycles,
      instruction_count: 9 * seqLen,
      pe_utilization: utilization,
      total_ops: Math.round(786432 * arrScale * arrScale * batchSize * (seqLen / 24)),
      arithmetic_intensity: arithmeticIntensity,
      achieved_gops: achievedGops,
      cycle_breakdown: {
        compute: computeCycles,
        memory: memoryCycles,
        activation: activationCycles,
        stall: stallCycles,
      },
    },
    animation_frames: [],
    error: null,
  }
}
