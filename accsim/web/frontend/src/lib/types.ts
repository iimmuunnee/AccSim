export interface RunRequest {
  array_size?: number
  batch_size?: number
  seq_len?: number
  precision?: 'fp32' | 'fp16' | 'int8'
  model_type?: 'lstm' | 'matmul'
  m?: number
  k?: number
  n?: number
}

export interface RooflinePoint {
  operational_intensity: number
  performance: number
  is_compute_bound: boolean
}

export interface CycleBreakdown {
  compute: number
  memory: number
  activation: number
  stall: number
}

export interface TimelineEntry {
  opcode: string
  opcode_kr: string
  start_cycle: number
  end_cycle: number
  cycles: number
  comment: string
}

export interface HardwareConfig {
  array_size: number
  clock_freq_hz: number
  peak_gops: number
  dram_bandwidth_gbps: number
}

export interface SimMetrics {
  total_cycles: number
  matmul_cycles: number
  memory_cycles: number
  activation_cycles: number
  elementwise_cycles: number
  instruction_count: number
  pe_utilization: number
  total_ops: number
  arithmetic_intensity: number
  achieved_gops: number
  cycle_breakdown: CycleBreakdown
}

export interface SimulationResult {
  total_cycles: number
  utilization: number
  roofline_point: RooflinePoint
  heatmap_matrix: number[][]
  breakdown: CycleBreakdown
  timeline: TimelineEntry[]
  config: HardwareConfig
  metrics: SimMetrics
  animation_frames: number[][][]
  error: string | null
}
