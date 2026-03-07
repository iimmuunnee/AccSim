// HALL 8
'use client'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import MetricCard from '@/components/ui/MetricCard'
import NextHallButton from '@/components/ui/NextHallButton'
import { useSimulator } from '@/hooks/useSimulator'
import HallBackground from '@/components/ui/HallBackground'

const RooflineChart = dynamic(() => import('@/components/d3/RooflineChart').then(m => ({ default: m.RooflineChart })), { ssr: false })
const PEHeatmap = dynamic(() => import('@/components/d3/PEHeatmap').then(m => ({ default: m.PEHeatmap })), { ssr: false })
const CycleBreakdownChart = dynamic(() => import('@/components/d3/CycleBreakdown').then(m => ({ default: m.CycleBreakdown })), { ssr: false })

type Precision = 'fp32' | 'fp16' | 'int8'

const OPCODE_COLORS: Record<string, string> = {
  LOAD_WEIGHT: '#3B82F6',
  LOAD_INPUT: '#6366F1',
  MATMUL: '#8B5CF6',
  STORE: '#F59E0B',
  ACT_SIGMOID: '#F97316',
  ACT_TANH: '#10B981',
  ELEM_MUL: '#06B6D4',
  ELEM_ADD: '#0EA5E9',
  NOP: '#71717A',
}

/* ─── Typewriter text for stage progress ─── */
function TypewriterStage({ text, color }: { text: string; color: string }) {
  const [display, setDisplay] = useState('')
  useEffect(() => {
    let i = 0
    setDisplay('')
    const iv = setInterval(() => {
      if (i < text.length) { setDisplay(text.slice(0, i + 1)); i++ }
      else clearInterval(iv)
    }, 40)
    return () => clearInterval(iv)
  }, [text])
  return <span style={{ color }} className="font-mono">{display}<span className="animate-pulse">_</span></span>
}

/* ─── Cycle counter ─── */
function CycleCounter({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const step = () => {
      const elapsed = performance.now() - start
      const progress = Math.min(elapsed / (duration * 1000), 1)
      setVal(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return <span className="font-mono text-data-green tabular-nums">{val.toLocaleString()}</span>
}

/* ─── Progress stage indicator ─── */
const STAGES = [
  { key: 'compiling', color: '#3B82F6', icon: '⚙' },
  { key: 'executing', color: '#F59E0B', icon: '⚡' },
  { key: 'analyzing', color: '#10B981', icon: '📊' },
]

export default function LiveDemo() {
  const t = useTranslations('demo')
  const { result, loading, isFallback, run } = useSimulator()

  const [timelineOpen, setTimelineOpen] = useState(false)
  const [arraySize, setArraySize] = useState<4 | 8 | 16>(8)
  const [batchSize, setBatchSize] = useState(1)
  const [precision, setPrecision] = useState<Precision>('fp32')
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle')
  const [stageIdx, setStageIdx] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleRun = () => {
    setPhase('running')
    setStageIdx(0)
    setShowResults(false)
    setTimelineOpen(false)
    run({ array_size: arraySize, batch_size: batchSize, seq_len: 24, precision })

    // Animate through stages
    let s = 0
    stageTimerRef.current = setInterval(() => {
      s++
      if (s < STAGES.length) {
        setStageIdx(s)
      } else {
        if (stageTimerRef.current) clearInterval(stageTimerRef.current)
      }
    }, 1200)
  }

  // When loading finishes, transition to done
  useEffect(() => {
    if (!loading && phase === 'running' && result) {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current)
      setStageIdx(STAGES.length - 1)
      const timer = setTimeout(() => {
        setPhase('done')
        setTimeout(() => setShowResults(true), 200)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [loading, phase, result])

  const data = result

  return (
    <div className="bg-background min-h-screen relative">
      <HallBackground hall="demo" />

      {/* ── Section A: Stage — Run Button + Progress ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 bg-data-green rounded-full" />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 8 — Live Demo</p>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
              {t('title')}
            </h1>
            <p className="text-text-muted text-xl max-w-2xl mx-auto mb-12 whitespace-pre-line">
              {t('subtitle')}
            </p>
          </ScrollReveal>

          {/* Parameter selection — compact inline */}
          <ScrollReveal delay={0.15}>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              {/* Array Size */}
              <div className="flex items-center gap-2 bg-surface1 border border-border rounded-full px-4 py-2">
                <span className="text-text-muted text-sm">{t('inputs.arraySize')}:</span>
                {([4, 8, 16] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setArraySize(s)}
                    disabled={phase === 'running'}
                    className={`px-3 py-1 rounded-full text-sm font-mono transition-all ${
                      arraySize === s
                        ? 'bg-data-green text-white'
                        : 'text-text-muted hover:text-text-primary disabled:opacity-50'
                    }`}
                  >
                    {s}×{s}
                  </button>
                ))}
              </div>

              {/* Batch Size */}
              <div className="flex items-center gap-2 bg-surface1 border border-border rounded-full px-4 py-2">
                <span className="text-text-muted text-sm">{t('inputs.batchSize')}:</span>
                {[1, 4, 8].map(b => (
                  <button
                    key={b}
                    onClick={() => setBatchSize(b)}
                    disabled={phase === 'running'}
                    className={`px-3 py-1 rounded-full text-sm font-mono transition-all ${
                      batchSize === b
                        ? 'bg-data-green text-white'
                        : 'text-text-muted hover:text-text-primary disabled:opacity-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* Precision */}
              <div className="flex items-center gap-2 bg-surface1 border border-border rounded-full px-4 py-2">
                <span className="text-text-muted text-sm">{t('inputs.precision')}:</span>
                {(['fp32', 'fp16', 'int8'] as Precision[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPrecision(p)}
                    disabled={phase === 'running'}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                      precision === p
                        ? 'bg-data-green text-white'
                        : 'text-text-muted hover:text-text-primary disabled:opacity-50'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Run Button */}
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div
                key="run-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={handleRun}
                  className="group relative w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-data-green/10 border-2 border-data-green/40 hover:border-data-green hover:bg-data-green/20 transition-all duration-300 mx-auto flex items-center justify-center"
                >
                  <div className="absolute inset-0 rounded-full bg-data-green/5 group-hover:bg-data-green/10 transition-all duration-300 animate-pulse" />
                  <div className="text-center relative z-10">
                    <div className="text-3xl sm:text-4xl mb-1">▶</div>
                    <div className="text-sm font-semibold text-data-green">{t('inputs.runButton')}</div>
                  </div>
                </button>
                {data && (
                  <p className="text-text-muted text-xs mt-4">{t('rerun')}</p>
                )}
              </motion.div>
            )}

            {phase === 'running' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Stage progress */}
                <div className="flex items-center justify-center gap-8">
                  {STAGES.map((stage, i) => {
                    const isActive = i === stageIdx
                    const isPast = i < stageIdx
                    return (
                      <div key={stage.key} className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-2">
                          <motion.div
                            className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all duration-300"
                            style={{
                              borderColor: (isActive || isPast) ? stage.color : stage.color + '30',
                              backgroundColor: isActive ? stage.color + '20' : 'transparent',
                            }}
                            animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            {isPast ? '✓' : stage.icon}
                          </motion.div>
                          <span className="text-xs font-mono" style={{ color: (isActive || isPast) ? stage.color : '#71717A' }}>
                            {t(`stages.${stage.key}` as any)}
                          </span>
                        </div>
                        {i < STAGES.length - 1 && (
                          <div className="w-6 sm:w-12 h-0.5 rounded-full transition-all duration-500"
                            style={{ backgroundColor: isPast ? STAGES[i + 1].color + '60' : '#27272A' }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Current stage text */}
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">
                    <TypewriterStage
                      text={t(`stages.${STAGES[stageIdx].key}` as any) + '...'}
                      color={STAGES[stageIdx].color}
                    />
                  </div>
                  {stageIdx === 1 && (
                    <p className="text-text-muted text-sm">
                      {t('stages.cycleHint')}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {phase === 'done' && !showResults && (
              <motion.div
                key="transitioning"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {isFallback && phase !== 'running' && (
            <div className="text-xs text-center text-accent-amber bg-accent-amber/10 border border-accent-amber/30 rounded-lg px-3 py-2 max-w-sm mx-auto mt-4">
              {t('results.fallbackBadge')}
            </div>
          )}
        </div>
      </section>

      {/* ── Section B: Results Reveal ── */}
      <AnimatePresence>
        {showResults && data && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="hall-section hall-section-alt px-6 pb-20 relative z-10"
          >
            <div className="max-w-6xl w-full mx-auto space-y-8">
              {/* Metric cards — stagger reveal */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    title: t('results.totalCycles'),
                    value: data.total_cycles,
                    unit: 'cycles',
                    variant: 'default' as const,
                  },
                  {
                    title: t('results.utilization'),
                    value: (data.utilization * 100).toFixed(1),
                    unit: '%',
                    variant: (data.utilization > 0.7 ? 'good' : data.utilization > 0.4 ? 'amber' : 'bad') as 'good' | 'amber' | 'bad',
                  },
                  {
                    title: t('results.gops'),
                    value: (data.roofline_point?.performance ?? 0).toFixed(2),
                    unit: 'GOPS',
                    variant: 'amber' as const,
                  },
                  {
                    title: t('results.speedup'),
                    value: (() => {
                      const ops = data.metrics?.total_ops ?? 0
                      const cycles = data.total_cycles
                      const freq = data.config?.clock_freq_hz ?? 1e9
                      if (!ops || !cycles) return '-'
                      const cpuTime = (ops * 5) / 3e9
                      const accelTime = cycles / freq
                      return accelTime > 0 ? (cpuTime / accelTime).toFixed(1) : '-'
                    })(),
                    unit: t('results.speedupUnit'),
                    variant: 'good' as const,
                  },
                ].map((metric, i) => (
                  <motion.div
                    key={metric.title}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <MetricCard
                      title={metric.title}
                      value={metric.value}
                      unit={metric.unit}
                      variant={metric.variant}
                      delay={0}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Charts — draw-in reveal */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="border-t-2 border-data-green/50 pt-6"
              >
                <RooflineChart data={data.roofline_point} config={data.config} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <PEHeatmap data={data.heatmap_matrix} title={t('results.heatmapTitle')} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                  >
                    <CycleBreakdownChart data={data.breakdown} title={t('results.breakdownTitle')} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Timeline table (collapsible) */}
              {data.timeline && data.timeline.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                  className="bg-surface1 border border-border rounded-xl p-4"
                >
                  <button
                    onClick={() => setTimelineOpen(!timelineOpen)}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    <span className="text-data-green text-sm">{timelineOpen ? '▼' : '▶'}</span>
                    <h4 className="text-sm font-semibold text-data-green font-mono">
                      {t('results.timelineTitle')} ({data.timeline.length})
                    </h4>
                  </button>
                  {timelineOpen && (
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-xs font-mono">
                        <thead>
                          <tr className="text-text-muted border-b border-border">
                            <th className="text-left py-2 px-2">{t('results.timelineCols.opcode')}</th>
                            <th className="text-right py-2 px-2">{t('results.timelineCols.start')}</th>
                            <th className="text-right py-2 px-2">{t('results.timelineCols.end')}</th>
                            <th className="text-right py-2 px-2">{t('results.timelineCols.cycles')}</th>
                            <th className="text-left py-2 px-2">{t('results.timelineCols.comment')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.timeline.map((entry: any, i: number) => (
                            <tr key={i} className="border-b border-border/50 hover:bg-surface2/50">
                              <td className="py-1.5 px-2 font-semibold" style={{ color: OPCODE_COLORS[entry.opcode] || '#10B981' }}>{entry.opcode}</td>
                              <td className="py-1.5 px-2 text-right text-text-muted">{entry.start_cycle}</td>
                              <td className="py-1.5 px-2 text-right text-text-muted">{entry.end_cycle}</td>
                              <td className="py-1.5 px-2 text-right text-text-primary">{entry.cycles}</td>
                              <td className="py-1.5 px-2 text-text-muted">{entry.comment || ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Raw Metrics panel */}
              {data.metrics && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className="bg-surface1 border border-border rounded-xl p-4"
                >
                  <h4 className="text-sm font-semibold text-data-green mb-1 font-mono">{t('results.rawMetricsTitle')}</h4>
                  <p className="text-xs text-text-muted mb-3">{t('results.rawMetricsDesc')}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono text-xs">
                    {Object.entries(data.metrics).map(([key, val]) => (
                      <div key={key} className="flex justify-between bg-surface2 rounded px-3 py-2">
                        <span className="text-text-muted">{key}</span>
                        <span className="text-text-primary">{typeof val === 'number' ? val.toLocaleString() : String(val)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Re-run button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.4 }}
                className="flex justify-center"
              >
                <button
                  onClick={() => { setPhase('idle'); setShowResults(false) }}
                  className="text-sm text-text-muted hover:text-data-green transition-colors flex items-center gap-2"
                >
                  <span className="text-base">↻</span> {t('rerun')}
                </button>
              </motion.div>

              <NextHallButton currentHall="demo" />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Placeholder when no results and not running */}
      {phase === 'idle' && !data && (
        <div className="px-6 pb-20 relative z-10">
          <NextHallButton currentHall="demo" />
        </div>
      )}

      {/* Show NextHallButton if idle with previous data but results hidden */}
      {phase === 'idle' && data && !showResults && (
        <div className="px-6 pb-20 relative z-10">
          <div className="max-w-6xl w-full mx-auto">
            <NextHallButton currentHall="demo" />
          </div>
        </div>
      )}
    </div>
  )
}
