'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import MetricCard from '@/components/ui/MetricCard'
import Slider from '@/components/ui/Slider'
import { useSimulator } from '@/hooks/useSimulator'

const RooflineChart = dynamic(() => import('@/components/d3/RooflineChart').then(m => ({ default: m.RooflineChart })), { ssr: false })
const PEHeatmap = dynamic(() => import('@/components/d3/PEHeatmap').then(m => ({ default: m.PEHeatmap })), { ssr: false })
const CycleBreakdownChart = dynamic(() => import('@/components/d3/CycleBreakdown').then(m => ({ default: m.CycleBreakdown })), { ssr: false })

type Precision = 'fp32' | 'fp16' | 'int8'

export default function LiveDemo() {
  const t = useTranslations('demo')
  const { result, loading, isFallback, run } = useSimulator()

  const [arraySize, setArraySize] = useState<4 | 8 | 16>(8)
  const [batchSize, setBatchSize] = useState(1)
  const [seqLen, setSeqLen] = useState(24)
  const [precision, setPrecision] = useState<Precision>('fp32')

  const handleRun = () => {
    run({ array_size: arraySize, batch_size: batchSize, seq_len: seqLen, precision })
  }

  const data = result

  return (
    <div className="bg-background min-h-screen">
      <section className="hall-section flex items-start justify-center px-6 pt-20 pb-20">
        <div className="max-w-7xl w-full">
          <ScrollReveal>
            <p className="text-text-muted text-sm font-mono tracking-widest uppercase mb-4 text-center">Hall 8 — Live Demo</p>
            <h1 className="text-5xl font-bold text-text-primary text-center mb-4">{t('title')}</h1>
            <p className="text-text-muted text-xl text-center max-w-2xl mx-auto mb-12">{t('subtitle')}</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Input panel */}
            <ScrollReveal direction="left">
              <div className="bg-surface1 border border-border rounded-2xl p-8 space-y-6">
                <h3 className="font-semibold text-text-primary">{t('inputs.arraySize')}</h3>
                <div className="flex gap-2">
                  {([4, 8, 16] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setArraySize(s)}
                      className={`flex-1 py-2 rounded-xl text-sm font-mono transition-all ${
                        arraySize === s ? 'bg-accent-blue text-white' : 'bg-surface2 text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {s}×{s}
                    </button>
                  ))}
                </div>

                <Slider
                  label={t('inputs.batchSize')}
                  value={batchSize}
                  min={1}
                  max={32}
                  onChange={setBatchSize}
                />

                <Slider
                  label={t('inputs.seqLen')}
                  value={seqLen}
                  min={8}
                  max={64}
                  step={8}
                  onChange={setSeqLen}
                />

                <div>
                  <label className="text-sm text-text-muted block mb-2">{t('inputs.precision')}</label>
                  <div className="flex gap-1 bg-surface2 rounded-xl p-1">
                    {(['fp32', 'fp16', 'int8'] as Precision[]).map(p => (
                      <button
                        key={p}
                        onClick={() => setPrecision(p)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all ${
                          precision === p ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRun}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-accent-blue text-white font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('inputs.loading')}
                    </>
                  ) : (
                    <>▶ {t('inputs.runButton')}</>
                  )}
                </button>

                {isFallback && (
                  <div className="text-xs text-center text-accent-amber bg-accent-amber/10 border border-accent-amber/30 rounded-lg px-3 py-2">
                    {t('results.fallbackBadge')}
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Results */}
            <div className="xl:col-span-2 space-y-6">
              <AnimatePresence>
                {data && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Metric cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MetricCard
                        title={t('results.totalCycles')}
                        value={data.total_cycles}
                        variant="default"
                        delay={0}
                      />
                      <MetricCard
                        title={t('results.utilization')}
                        value={(data.utilization * 100).toFixed(1)}
                        unit="%"
                        variant={data.utilization > 0.7 ? 'good' : data.utilization > 0.4 ? 'amber' : 'bad'}
                        delay={0.1}
                      />
                      <MetricCard
                        title={t('results.gops')}
                        value={(data.roofline_point?.performance ?? 0).toFixed(2)}
                        unit="GOPS"
                        variant="amber"
                        delay={0.2}
                      />
                      <MetricCard
                        title={t('results.speedup')}
                        value={(() => {
                          const ops = data.metrics?.total_ops ?? 0
                          const cycles = data.total_cycles
                          const freq = data.config?.clock_freq_hz ?? 1e9
                          if (!ops || !cycles) return '-'
                          const cpuTime = (ops * 5) / 3e9
                          const accelTime = cycles / freq
                          return accelTime > 0 ? (cpuTime / accelTime).toFixed(1) : '-'
                        })()}
                        unit={t('results.speedupUnit')}
                        variant="good"
                        delay={0.3}
                      />
                    </div>

                    {/* Charts */}
                    <RooflineChart data={data.roofline_point} config={data.config} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PEHeatmap
                        data={data.heatmap_matrix}
                        title={t('results.heatmapTitle')}
                      />
                      <CycleBreakdownChart
                        data={data.breakdown}
                        title={t('results.breakdownTitle')}
                      />
                    </div>
                  </motion.div>
                )}

                {!data && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-surface1 border border-border rounded-2xl h-96 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <p className="text-4xl mb-4">▶</p>
                      <p className="text-text-muted">{t('results.placeholder')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
