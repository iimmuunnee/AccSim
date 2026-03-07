// HALL 6
'use client'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import MetricCard from '@/components/ui/MetricCard'
import Slider from '@/components/ui/Slider'
import NextHallButton from '@/components/ui/NextHallButton'
import { useSimulator } from '@/hooks/useSimulator'
import { useKnowledgeLevel } from '@/stores/useKnowledgeLevel'
import { useLevelText } from '@/hooks/useLevelText'
import { getDemoData } from '@/lib/api'

const RooflineChart = dynamic(() => import('@/components/d3/RooflineChart').then(m => ({ default: m.RooflineChart })), { ssr: false })
const PEHeatmap = dynamic(() => import('@/components/d3/PEHeatmap').then(m => ({ default: m.PEHeatmap })), { ssr: false })
const CycleBreakdownChart = dynamic(() => import('@/components/d3/CycleBreakdown').then(m => ({ default: m.CycleBreakdown })), { ssr: false })

const PRESETS = {
  small: { batch: 1, array: 4, seq: 8 },
  balanced: { batch: 4, array: 8, seq: 24 },
  large: { batch: 32, array: 16, seq: 64 },
} as const

export default function PerformanceLab() {
  const t = useTranslations('lab')
  const lt = useLevelText('lab')
  const { level } = useKnowledgeLevel()
  const { result, loading, isFallback, runDebounced } = useSimulator()
  const [batchSize, setBatchSize] = useState(1)
  const [arraySize, setArraySize] = useState(8)
  const [seqLen, setSeqLen] = useState(24)

  const [displayData, setDisplayData] = useState(getDemoData(8, 1, 24))
  const prevCycles = useRef(displayData.total_cycles)

  useEffect(() => {
    if (result) {
      prevCycles.current = displayData.total_cycles
      setDisplayData(result)
    }
  }, [result])

  const handleChange = useCallback(() => {
    runDebounced({ array_size: arraySize, batch_size: batchSize, seq_len: seqLen }, 600)
  }, [arraySize, batchSize, seqLen, runDebounced])

  useEffect(() => { handleChange() }, [handleChange])

  const applyPreset = (key: keyof typeof PRESETS) => {
    const p = PRESETS[key]
    setBatchSize(p.batch)
    setArraySize(p.array)
    setSeqLen(p.seq)
  }

  const breakdown = displayData.breakdown
  const chartLabels = {
    compute: t('charts.breakdown.compute'),
    memory: t('charts.breakdown.memory'),
    activation: t('charts.breakdown.activation'),
    stall: t('charts.breakdown.stall'),
  }
  const rooflineLabels = {
    xAxis: t('charts.roofline.xAxis'),
    yAxis: t('charts.roofline.yAxis'),
    memoryBound: t('charts.roofline.memoryBound'),
    computeBound: t('charts.roofline.computeBound'),
    workload: t('charts.roofline.workload'),
  }

  const cycleDelta = displayData.total_cycles - prevCycles.current

  return (
    <div className="bg-background min-h-screen relative">
      {/* Graph paper background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `linear-gradient(rgba(63,63,70,0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(63,63,70,0.03) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }} />

      {/* ── Section A: 도입 — 연구실에 오신 것을 환영합니다 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 bg-data-green rounded-full" />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 6 — Performance Lab</p>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
              {t('title')}
            </h1>
            <p className="text-text-muted text-xl max-w-2xl mx-auto mb-12 whitespace-pre-line">
              {lt('subtitle')}
            </p>
          </ScrollReveal>

          {/* 3 key metric previews */}
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              {[
                { title: t('metricPreview.cycles'), value: displayData.total_cycles.toLocaleString(), unit: 'cycles', variant: 'default' as const },
                { title: t('metricPreview.utilization'), value: (displayData.utilization * 100).toFixed(1), unit: '%', variant: (displayData.utilization > 0.7 ? 'good' : 'amber') as 'good' | 'amber' },
                { title: t('metricPreview.gops'), value: (displayData.roofline_point?.performance ?? 0).toFixed(2), unit: 'GOPS', variant: 'amber' as const },
              ].map((m, i) => (
                <motion.div
                  key={m.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <MetricCard title={m.title} value={m.value} unit={m.unit} variant={m.variant} delay={0} />
                </motion.div>
              ))}
            </div>
            <p className="text-text-muted text-xs mt-6 opacity-60">{t('metricPreview.hint')}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Section B: 실험 대시보드 ── */}
      <section className="hall-section hall-section-alt px-6 pt-8 pb-20 relative z-10">
        <div className="max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Control panel */}
            <ScrollReveal direction="left">
              <div className="xl:col-span-1 bg-surface1 border border-border rounded-2xl p-3 sm:p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text-primary text-sm">{t('controlHeader')}</h3>
                  {loading && (
                    <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                {isFallback && (
                  <div className="text-xs text-accent-amber bg-accent-amber/10 border border-accent-amber/30 rounded-lg px-3 py-2">
                    Demo data
                  </div>
                )}

                {/* Presets */}
                <div>
                  <label className="text-xs text-text-muted mb-2 block">{t('presets.title')}</label>
                  <div className="flex gap-2">
                    {(['small', 'balanced', 'large'] as const).map(key => (
                      <button
                        key={key}
                        onClick={() => applyPreset(key)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-mono bg-surface2 text-text-muted hover:text-text-primary hover:bg-accent-blue/10 transition-all"
                      >
                        {t(`presets.${key}` as any)}
                      </button>
                    ))}
                  </div>
                </div>

                <Slider
                  label={t('controls.batchSize')}
                  value={batchSize}
                  min={1}
                  max={32}
                  onChange={v => { setBatchSize(v) }}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-text-muted">{t('controls.arraySize')}</label>
                  <div className="flex gap-2">
                    {[4, 8, 16].map(s => (
                      <button
                        key={s}
                        onClick={() => setArraySize(s)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-mono transition-all ${
                          arraySize === s ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <Slider
                  label="Seq Len"
                  value={seqLen}
                  min={8}
                  max={64}
                  step={8}
                  onChange={v => setSeqLen(v)}
                />

                {/* Beginner guide */}
                {level === 'beginner' && (
                  <div className="text-xs text-accent-blue bg-accent-blue/10 border border-accent-blue/30 rounded-lg px-3 py-2 space-y-1">
                    <p className="font-semibold">{t('guide.title')}</p>
                    <p>{t('guide.tip1')}</p>
                    <p>{t('guide.tip2')}</p>
                  </div>
                )}

                {/* Summary metrics */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">{t('charts.breakdown.compute')}</span>
                    <span className="font-mono text-accent-blue">
                      {displayData.total_cycles.toLocaleString()} cycles
                      {cycleDelta !== 0 && (
                        <span className={`ml-1 text-xs ${cycleDelta > 0 ? 'text-data-red' : 'text-data-green'}`}>
                          {cycleDelta > 0 ? '+' : ''}{cycleDelta.toLocaleString()}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">PE {t('charts.heatmap.utilization')}</span>
                    <span className="font-mono text-data-green">{(displayData.utilization * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">GOPS</span>
                    <span className="font-mono text-accent-amber">{(displayData.roofline_point?.performance ?? 0).toFixed(2)} GOPS</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Charts */}
            <div className="xl:col-span-3 space-y-6">
              <h3 className="font-semibold text-text-primary text-sm">{t('resultHeader')}</h3>

              <ScrollReveal>
                <RooflineChart
                  data={displayData.roofline_point}
                  config={displayData.config}
                  labels={rooflineLabels}
                />
                {level !== 'expert' && (
                  <p className="text-sm text-text-muted mt-2 px-2">{lt('annotations.roofline')}</p>
                )}
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScrollReveal delay={0.1}>
                  <PEHeatmap
                    data={displayData.heatmap_matrix}
                    title={t('charts.heatmap.title')}
                    unitLabel={t('charts.heatmap.utilization')}
                  />
                  {level !== 'expert' && (
                    <p className="text-sm text-text-muted mt-2 px-2">{lt('annotations.heatmap')}</p>
                  )}
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <CycleBreakdownChart
                    data={breakdown}
                    title={t('charts.breakdown.title')}
                    labels={chartLabels}
                  />
                  {level !== 'expert' && (
                    <p className="text-sm text-text-muted mt-2 px-2">{lt('annotations.breakdown')}</p>
                  )}
                </ScrollReveal>
              </div>
            </div>
          </div>
          <NextHallButton currentHall="lab" />
        </div>
      </section>
    </div>
  )
}
