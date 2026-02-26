'use client'
import { useTranslations } from 'next-intl'
import { useState, useMemo } from 'react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Slider from '@/components/ui/Slider'
import { motion, AnimatePresence } from 'framer-motion'

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

function BarChart({ values, labels, colors }: { values: number[]; labels: string[]; colors: string[] }) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex items-end gap-6 h-48 px-4">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-xs font-mono" style={{ color: colors[i] }}>
            {v.toFixed(1)}
          </span>
          <motion.div
            className="w-full rounded-t-md"
            style={{ backgroundColor: colors[i] }}
            initial={{ height: 0 }}
            animate={{ height: `${(v / max) * 160}px` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
          <span className="text-xs text-text-muted text-center">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

export default function AcceleratorHall() {
  const t = useTranslations('accelerator')
  const [modelSize, setModelSize] = useState(50)   // 1–100 (billion params index)
  const [batchSize, setBatchSize] = useState(8)    // 1–128
  const [powerLimit, setPowerLimit] = useState(150) // 10–400W

  const metrics = useMemo(() => {
    const modelFactor = 1 + modelSize * 0.3
    const batchFactor = Math.log2(batchSize + 1) + 1
    const powerFactor = powerLimit / 100

    const cpuTime = modelFactor * 100 / batchFactor
    const gpuTime = modelFactor * 2 / batchFactor * (powerLimit < 150 ? 1.5 : 1)
    const aiTime = modelFactor * 0.4 / batchFactor

    const cpuEff = Math.min(batchFactor * 0.1 / (powerLimit > 65 ? 2 : 1), 2)
    const gpuEff = batchFactor * 3 / (powerFactor * 1.5)
    const aiEff = batchFactor * 15 / (powerFactor * 0.9)

    const cpuCost = cpuTime * 0.002
    const gpuCost = gpuTime * 0.05
    const aiCost = aiTime * 0.03

    return {
      processingTime: [cpuTime, gpuTime, aiTime],
      powerEfficiency: [cpuEff, gpuEff, aiEff],
      costPerInference: [cpuCost, gpuCost, aiCost],
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
            <p className="text-text-muted text-sm font-mono tracking-widest uppercase mb-4 text-center">Hall 2 — Accelerator</p>
            <h1 className="text-5xl font-bold text-text-primary text-center mb-4">{t('title')}</h1>
            <p className="text-text-muted text-xl text-center max-w-2xl mx-auto mb-16">{t('subtitle')}</p>
          </ScrollReveal>

          {/* 3-column chip comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {CHIPS.map((chip, i) => (
              <ScrollReveal key={chip.key} delay={i * 0.1}>
                <div className="bg-surface1 border border-border rounded-2xl p-8 hover:border-accent-blue/50 transition-all duration-300">
                  <div className="text-4xl mb-4">{chip.icon}</div>
                  <h3 className="text-xl font-bold mb-1" style={{ color: chip.color }}>
                    {t(`${chip.key}.name` as any)}
                  </h3>
                  <p className="text-text-muted text-sm mb-6">{t(`${chip.key}.desc` as any)}</p>
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
      <section className="hall-section flex items-center justify-center px-6 bg-surface1/20">
        <div className="max-w-6xl w-full">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary text-center mb-12">인터랙티브 비교</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Sliders */}
            <ScrollReveal direction="left">
              <div className="bg-surface1 border border-border rounded-2xl p-8 space-y-8">
                <h3 className="font-semibold text-text-primary mb-6">{t('sliders.modelSize')} & 환경 설정</h3>
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
                  <p className="text-sm text-text-muted mb-4">{t('chart.processingTime')} (ms, 낮을수록 좋음)</p>
                  <BarChart values={metrics.processingTime} labels={chipNames} colors={chipColors} />
                </div>
                <div className="bg-surface1 border border-border rounded-2xl p-6">
                  <p className="text-sm text-text-muted mb-4">{t('chart.powerEfficiency')} (GFLOPS/W, 높을수록 좋음)</p>
                  <BarChart values={metrics.powerEfficiency} labels={chipNames} colors={chipColors} />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  )
}
