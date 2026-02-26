'use client'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Slider from '@/components/ui/Slider'
import { useSimulator } from '@/hooks/useSimulator'
import { getDemoData } from '@/lib/api'

const RooflineChart = dynamic(() => import('@/components/d3/RooflineChart').then(m => ({ default: m.RooflineChart })), { ssr: false })
const PEHeatmap = dynamic(() => import('@/components/d3/PEHeatmap').then(m => ({ default: m.PEHeatmap })), { ssr: false })
const CycleBreakdownChart = dynamic(() => import('@/components/d3/CycleBreakdown').then(m => ({ default: m.CycleBreakdown })), { ssr: false })

export default function PerformanceLab() {
  const t = useTranslations('lab')
  const { result, loading, isFallback, runDebounced } = useSimulator()
  const [batchSize, setBatchSize] = useState(1)
  const [arraySize, setArraySize] = useState(8)
  const [seqLen, setSeqLen] = useState(24)

  // Load demo data initially
  const [displayData, setDisplayData] = useState(getDemoData())

  useEffect(() => {
    if (result) setDisplayData(result)
  }, [result])

  const handleChange = useCallback(() => {
    runDebounced({ array_size: arraySize, batch_size: batchSize, seq_len: seqLen }, 600)
  }, [arraySize, batchSize, seqLen, runDebounced])

  useEffect(() => { handleChange() }, [handleChange])

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

  return (
    <div className="bg-background min-h-screen">
      <section className="hall-section flex items-start justify-center px-6 pt-20 pb-12">
        <div className="max-w-7xl w-full">
          <ScrollReveal>
            <p className="text-text-muted text-sm font-mono tracking-widest uppercase mb-4 text-center">Hall 6 — Performance Lab</p>
            <h1 className="text-5xl font-bold text-text-primary text-center mb-4">{t('title')}</h1>
            <p className="text-text-muted text-xl text-center max-w-2xl mx-auto mb-12">{t('subtitle')}</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Control panel */}
            <ScrollReveal direction="left">
              <div className="xl:col-span-1 bg-surface1 border border-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text-primary text-sm">파라미터</h3>
                  {loading && (
                    <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                {isFallback && (
                  <div className="text-xs text-accent-amber bg-accent-amber/10 border border-accent-amber/30 rounded-lg px-3 py-2">
                    데모 데이터
                  </div>
                )}
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

                {/* Summary metrics */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">총 사이클</span>
                    <span className="font-mono text-accent-blue">{displayData.total_cycles.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">PE 활용률</span>
                    <span className="font-mono text-data-green">{(displayData.utilization * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">달성 GOPS</span>
                    <span className="font-mono text-accent-amber">{(displayData.roofline_point?.performance ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Charts */}
            <div className="xl:col-span-3 space-y-6">
              <ScrollReveal>
                <RooflineChart
                  data={displayData.roofline_point}
                  config={displayData.config}
                  labels={rooflineLabels}
                />
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScrollReveal delay={0.1}>
                  <PEHeatmap
                    data={displayData.heatmap_matrix}
                    title={t('charts.heatmap.title')}
                    unitLabel={t('charts.heatmap.utilization')}
                  />
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <CycleBreakdownChart
                    data={breakdown}
                    title={t('charts.breakdown.title')}
                    labels={chartLabels}
                  />
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
