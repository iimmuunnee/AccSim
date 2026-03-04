'use client'
import { useTranslations } from 'next-intl'
import { useState, useMemo } from 'react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Slider from '@/components/ui/Slider'
import Term from '@/components/ui/Term'
import NextHallButton from '@/components/ui/NextHallButton'
import { useLevelText } from '@/hooks/useLevelText'
import { motion } from 'framer-motion'

const CHIPS = [
  {
    key: 'cpu',
    color: '#F59E0B',
    icon: '🖥',
    cores: '8–32',
    basePerf: 1,
    powerBase: 65,
  },
  {
    key: 'gpu',
    color: '#10B981',
    icon: '🎮',
    cores: '3584–16384',
    basePerf: 80,
    powerBase: 250,
  },
  {
    key: 'ai',
    color: '#3B82F6',
    icon: '⚡',
    cores: '256×256 PE',
    basePerf: 312,
    powerBase: 300,
  },
]

function BarChart({ values, labels, colors, unit }: { values: number[]; labels: string[]; colors: string[]; unit?: string }) {
  // Log-scale bar heights for large range differences
  const logValues = values.map(v => Math.log10(Math.max(v, 0.01)))
  const logMin = Math.min(...logValues)
  const logRange = Math.max(...logValues) - logMin || 1

  return (
    <div className="flex flex-col">
      {/* Fixed-height value label area */}
      <div className="flex gap-6 px-4 h-8 items-end">
        {values.map((v, i) => (
          <div key={i} className="flex-1 text-center">
            <motion.span
              key={v.toFixed(1)}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-sm font-mono"
              style={{ color: colors[i] }}
            >
              {v.toFixed(1)}{unit ? ` ${unit}` : ''}
            </motion.span>
          </div>
        ))}
      </div>
      {/* Bar area — constrained height */}
      <div className="flex items-end gap-6 h-40 px-4">
        {values.map((v, i) => {
          const logV = Math.log10(Math.max(v, 0.01))
          const height = Math.min(((logV - logMin) / logRange) * 140 + 16, 160)
          return (
            <div key={i} className="flex-1">
              <motion.div
                className="w-full rounded-t-md transition-shadow duration-300 hover:shadow-[0_0_12px_var(--bar-color)]"
                style={{ backgroundColor: colors[i], '--bar-color': colors[i] + '40' } as any}
                animate={{ height: `${height}px` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          )
        })}
      </div>
      {/* Name label area */}
      <div className="flex gap-6 px-4 mt-2">
        {labels.map((label, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-sm text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AcceleratorHall() {
  const t = useTranslations('accelerator')
  const lt = useLevelText('accelerator')
  const [modelSize, setModelSize] = useState(50)
  const [batchSize, setBatchSize] = useState(8)
  const [powerLimit, setPowerLimit] = useState(150)

  const metrics = useMemo(() => {
    const m = modelSize, b = batchSize, p = powerLimit

    // Processing Time (ms) — lower is better
    const cpuTime = 0.5 * m * (1 + 0.02 * m) * (1 + 0.8 * Math.log2(b + 1))
    const gpuPowerThrottle = Math.min(p / 250, 1)
    const gpuTime = (2 + m * 0.15) / Math.sqrt(b) / gpuPowerThrottle
    const aiTime = (0.3 + m * 0.008) * (1 + 0.1 / Math.sqrt(b))

    // Power Efficiency (GOPS/W) — higher is better
    const cpuEff = 8 / (1 + m * 0.05) / Math.max(p / 65, 1)
    const gpuEff = (15 + 50 * (b / 128)) * gpuPowerThrottle / (p / 100)
    const aiEff = (200 + 300 * Math.min(b / 16, 1)) / (p / 100) * 0.8

    return {
      processingTime: [cpuTime, gpuTime, aiTime],
      powerEfficiency: [cpuEff, gpuEff, aiEff],
    }
  }, [modelSize, batchSize, powerLimit])

  const chipColors = CHIPS.map(c => c.color)
  const chipNames = CHIPS.map(c => t(`${c.key}.name` as any))

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="hall-section flex items-center justify-center px-6">
        <div className="max-w-6xl w-full">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 bg-accent-amber rounded-full" />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 2 — Accelerator</p>
            </div>
            <h1 className="text-5xl font-bold text-text-primary text-center mb-4">{t('title')}</h1>
            <p className="text-text-muted text-xl text-center max-w-2xl mx-auto mb-16 whitespace-pre-line">{t('subtitle')}</p>
          </ScrollReveal>

          {/* 3-column chip comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {CHIPS.map((chip, i) => (
              <ScrollReveal key={chip.key} delay={i * 0.1}>
                <div className="group bg-surface1 border border-border rounded-2xl p-8 hover:border-accent-blue/50 transition-all duration-300">
                  <div className="text-4xl mb-4 group-hover:animate-pulse">{chip.icon}</div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: chip.color }}>
                    {t(`${chip.key}.name` as any)}
                  </h3>
                  <p className="text-text-muted text-sm mb-6 whitespace-pre-line">{lt(`${chip.key}.desc`)}</p>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Cores</span>
                      <span className="text-text-primary">{chip.cores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Base Perf</span>
                      <span style={{ color: chip.color }}>{chip.basePerf} TFLOPS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">TDP</span>
                      <span className="text-text-primary">{chip.powerBase}W</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive section */}
      <section className="hall-section flex items-center justify-center px-6">
        <div className="max-w-6xl w-full">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
              <Term id="GEMM">GEMM</Term> Performance Comparison
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Sliders */}
            <ScrollReveal direction="left">
              <div className="bg-surface1 border border-border rounded-2xl p-8 space-y-8">
                <h3 className="font-semibold text-text-primary mb-6">{t('sliders.modelSize')}</h3>
                <Slider
                  label={t('sliders.modelSize')}
                  value={modelSize}
                  min={1}
                  max={100}
                  onChange={setModelSize}
                  displayValue={`${modelSize}B params`}
                />
                <Slider
                  label={t('sliders.batchSize')}
                  value={batchSize}
                  min={1}
                  max={128}
                  onChange={setBatchSize}
                />
                <Slider
                  label={t('sliders.powerLimit')}
                  value={powerLimit}
                  min={10}
                  max={400}
                  onChange={setPowerLimit}
                  displayValue={`${powerLimit}W`}
                />
              </div>
            </ScrollReveal>

            {/* Charts */}
            <ScrollReveal direction="right">
              <div className="space-y-6">
                <div className="bg-surface1 border border-border rounded-2xl p-6">
                  <p className="text-sm text-text-muted mb-4">
                    {t('chart.processingTime')} ({t('chart.processingTimeUnit')})
                  </p>
                  <BarChart values={metrics.processingTime} labels={chipNames} colors={chipColors} unit={t('chart.processingTimeUnit')} />
                </div>
                <div className="bg-surface1 border border-border rounded-2xl p-6">
                  <p className="text-sm text-text-muted mb-4">
                    {t('chart.powerEfficiency')} ({t('chart.powerEfficiencyUnit')})
                  </p>
                  <BarChart values={metrics.powerEfficiency} labels={chipNames} colors={chipColors} unit={t('chart.powerEfficiencyUnit')} />
                </div>
              </div>
            </ScrollReveal>
          </div>
          <NextHallButton currentHall="accelerator" />
        </div>
      </section>
    </div>
  )
}
