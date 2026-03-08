// HALL 8 — SolarX Mission Control
'use client'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import MetricCard from '@/components/ui/MetricCard'
import NextHallButton from '@/components/ui/NextHallButton'
import { useSimulator } from '@/hooks/useSimulator'
import { getDemoData } from '@/lib/api'
import HallBackground from '@/components/ui/HallBackground'
import { useLevelText } from '@/hooks/useLevelText'

/* ─── Constants ─── */
const SOLAR_DATA = generateSolarData()
const FEATURES = ['temp', 'humidity', 'wind_speed', 'wind_dir', 'pressure', 'cloud', 'irradiance', 'precip']
const FEATURE_ICONS = ['🌡', '💧', '🌬', '🧭', '📊', '☁', '☀', '🌧']

// Generate realistic 24h solar power data
function generateSolarData() {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const actual = hours.map(h => {
    // Bell curve centered at 12-13h with noise
    const base = Math.max(0, Math.exp(-0.5 * ((h - 12.5) / 3.2) ** 2) * 85)
    const noise = (Math.sin(h * 1.7) * 3 + Math.cos(h * 2.3) * 2)
    return Math.max(0, Math.round((base + noise) * 10) / 10)
  })
  const predicted = actual.map((v, i) => {
    // LSTM prediction with small error
    const err = (Math.sin(i * 3.1) * 2 + Math.cos(i * 1.9) * 1.5)
    return Math.max(0, Math.round((v + err) * 10) / 10)
  })
  return { hours, actual, predicted }
}

/* ─── Mini bar chart for features ─── */
function FeatureBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 w-full bg-surface2 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

/* ─── Simple SVG line chart for solar data ─── */
function SolarChart({ actual, predicted, hours, revealProgress, labels }: {
  actual: number[]
  predicted: number[]
  hours: number[]
  revealProgress: number
  labels: { actual: string; predicted: string; hour: string; power: string }
}) {
  const W = 600, H = 250, PAD = 45, PADR = 20, PADT = 15, PADB = 30
  const maxY = Math.max(...actual, ...predicted) * 1.1
  const xScale = (i: number) => PAD + (i / 23) * (W - PAD - PADR)
  const yScale = (v: number) => PADT + (1 - v / maxY) * (H - PADT - PADB)

  const toPath = (data: number[]) => {
    const visibleCount = Math.floor(revealProgress * data.length)
    return data.slice(0, visibleCount).map((v, i) =>
      `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`
    ).join(' ')
  }

  const areaPath = (data: number[]) => {
    const visibleCount = Math.floor(revealProgress * data.length)
    const pts = data.slice(0, visibleCount)
    if (pts.length < 2) return ''
    const line = pts.map((v, i) => `${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`).join(' L ')
    const lastX = xScale(pts.length - 1)
    const firstX = xScale(0)
    return `M ${firstX} ${yScale(0)} L ${line} L ${lastX} ${yScale(0)} Z`
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 300 }}>
      {/* Y axis ticks */}
      {[0, 20, 40, 60, 80].map(v => (
        <g key={v}>
          <line x1={PAD} y1={yScale(v)} x2={W - PADR} y2={yScale(v)} stroke="#27272A" strokeWidth={0.5} />
          <text x={PAD - 6} y={yScale(v) + 3} fill="#71717A" fontSize={9} textAnchor="end" fontFamily="monospace">{v}</text>
        </g>
      ))}
      {/* X axis ticks */}
      {[0, 4, 8, 12, 16, 20, 23].map(h => (
        <text key={h} x={xScale(h)} y={H - 5} fill="#71717A" fontSize={9} textAnchor="middle" fontFamily="monospace">{h}h</text>
      ))}
      {/* Axis labels */}
      <text x={8} y={H / 2} fill="#71717A" fontSize={8} textAnchor="middle" transform={`rotate(-90, 8, ${H / 2})`}>{labels.power}</text>
      <text x={W / 2} y={H - 0} fill="#71717A" fontSize={8} textAnchor="middle">{labels.hour}</text>
      {/* Actual area fill */}
      <path d={areaPath(actual)} fill="rgba(245,158,11,0.08)" />
      {/* Lines */}
      <path d={toPath(actual)} fill="none" stroke="#F59E0B" strokeWidth={2} />
      <path d={toPath(predicted)} fill="none" stroke="#3B82F6" strokeWidth={2} strokeDasharray="6 3" />
      {/* Legend */}
      <g transform={`translate(${PAD + 10}, ${PADT + 10})`}>
        <line x1={0} y1={0} x2={16} y2={0} stroke="#F59E0B" strokeWidth={2} />
        <text x={20} y={3} fill="#F59E0B" fontSize={9}>{labels.actual}</text>
        <line x1={90} y1={0} x2={106} y2={0} stroke="#3B82F6" strokeWidth={2} strokeDasharray="6 3" />
        <text x={110} y={3} fill="#3B82F6" fontSize={9}>{labels.predicted}</text>
      </g>
    </svg>
  )
}

/* ─── Race Progress Bar ─── */
function RaceBar({ progress, label, color, time }: {
  progress: number; label: string; color: string; time: string | null
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-muted font-mono">{label}</span>
        {time && <span className="font-mono" style={{ color }}>{time}</span>}
      </div>
      <div className="h-3 bg-surface2 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export default function SolarXMission() {
  const t = useTranslations('demo')
  const lt = useLevelText('demo')
  const { result, loading, isFallback, run } = useSimulator()

  const [racePhase, setRacePhase] = useState<'idle' | 'simulating' | 'racing' | 'done'>('idle')
  const [cpuProgress, setCpuProgress] = useState(0)
  const [accelProgress, setAccelProgress] = useState(0)
  const [chartReveal, setChartReveal] = useState(0)
  const [accelFinished, setAccelFinished] = useState(false)
  const [cpuFinished, setCpuFinished] = useState(false)
  const raceRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const raceResultRef = useRef(result)
  raceResultRef.current = result

  // Simulation data — use result when available, fallback constants otherwise
  const simData = result
  const totalOps = simData?.metrics?.total_ops ?? 786432
  const totalCycles = simData?.total_cycles ?? 12480
  const utilization = simData?.utilization ?? 0.65
  const freq = simData?.config?.clock_freq_hz ?? 1e9

  // Derived metrics
  const accelTimeUs = (totalCycles / freq) * 1e6
  const cpuCPI = 5
  const cpuFreq = 3e9
  const cpuTimeUs = (totalOps * cpuCPI / cpuFreq) * 1e6
  const speedup = cpuTimeUs / accelTimeUs

  // Feature sample values (normalized 0-1)
  const featureValues = useMemo(() => [0.72, 0.45, 0.31, 0.58, 0.85, 0.22, 0.91, 0.05], [])

  // Start visual race animation using actual speedup ratio
  const startVisualRace = useCallback((ratio: number) => {
    setCpuProgress(0)
    setAccelProgress(0)
    setAccelFinished(false)
    setCpuFinished(false)

    const accelDuration = 1500 // ms for visual
    const cpuDuration = accelDuration * Math.min(ratio, 8) // cap visual ratio
    const intervalMs = 30
    let elapsed = 0

    raceRef.current = setInterval(() => {
      elapsed += intervalMs
      const ap = Math.min(100, (elapsed / accelDuration) * 100)
      const cp = Math.min(100, (elapsed / cpuDuration) * 100)
      setAccelProgress(ap)
      setCpuProgress(cp)

      if (ap >= 100) setAccelFinished(true)
      if (cp >= 100) setCpuFinished(true)

      if (ap >= 100 && cp >= 100) {
        if (raceRef.current) clearInterval(raceRef.current)
        setRacePhase('done')
        // Reveal chart after race
        let chartT = 0
        const chartInterval = setInterval(() => {
          chartT += 40
          setChartReveal(Math.min(1, chartT / 1200))
          if (chartT >= 1200) clearInterval(chartInterval)
        }, 40)
      }
    }, intervalMs)
  }, [])

  const startRace = useCallback(() => {
    setRacePhase('simulating')
    setChartReveal(0)
    run({ array_size: 8, batch_size: 1, seq_len: 24 })
  }, [run])

  // Skip button: during simulating → use fallback, during racing → jump to done
  const handleSkip = useCallback(() => {
    if (racePhase === 'simulating') {
      const fallback = getDemoData(8, 1, 24)
      const ops = fallback.metrics.total_ops
      const cycles = fallback.total_cycles
      const freqHz = fallback.config.clock_freq_hz
      const accelUs = (cycles / freqHz) * 1e6
      const cpuUs = (ops * 5 / 3e9) * 1e6
      const ratio = cpuUs / accelUs
      // Set result to fallback so metrics display correctly
      // (useSimulator will also set it when API responds, but we proceed immediately)
      setRacePhase('racing')
      startVisualRace(ratio)
    } else if (racePhase === 'racing') {
      if (raceRef.current) clearInterval(raceRef.current)
      setCpuProgress(100)
      setAccelProgress(100)
      setAccelFinished(true)
      setCpuFinished(true)
      setRacePhase('done')
      setChartReveal(1)
    }
  }, [racePhase, startVisualRace])

  // Cleanup
  useEffect(() => {
    return () => { if (raceRef.current) clearInterval(raceRef.current) }
  }, [])

  // When simulation result arrives during 'simulating' phase → start racing
  useEffect(() => {
    if (!loading && racePhase === 'simulating' && result) {
      const ops = result.metrics.total_ops
      const cycles = result.total_cycles
      const freqHz = result.config.clock_freq_hz
      const accelUs = (cycles / freqHz) * 1e6
      const cpuUs = (ops * 5 / 3e9) * 1e6
      const ratio = cpuUs / accelUs

      setRacePhase('racing')
      startVisualRace(ratio)
    }
  }, [loading, racePhase, result, startVisualRace])

  const solarLabels = {
    actual: t('solar.actualLabel'),
    predicted: t('solar.predictedLabel'),
    hour: t('solar.hourLabel'),
    power: t('solar.powerLabel'),
  }

  const peakHour = SOLAR_DATA.actual.indexOf(Math.max(...SOLAR_DATA.actual))
  const rmse = Math.sqrt(
    SOLAR_DATA.actual.reduce((sum, v, i) => sum + (v - SOLAR_DATA.predicted[i]) ** 2, 0) / 24
  ).toFixed(2)

  return (
    <div className="bg-background min-h-screen relative">
      <HallBackground hall="demo" />

      {/* ── Section A: 미션 브리핑 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 bg-accent-amber rounded-full" />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 8 — SolarX Mission Control</p>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
              {t('title')}
            </h1>
            <p className="text-text-muted text-xl max-w-2xl mx-auto mb-12 whitespace-pre-line">
              {lt('subtitle')}
            </p>
          </ScrollReveal>

          {/* Scenario card */}
          <ScrollReveal delay={0.15}>
            <div className="bg-surface1 border border-border rounded-2xl p-6 sm:p-8 text-left max-w-3xl mx-auto">
              <h3 className="text-base font-semibold text-accent-amber mb-3">{t('scenario.title')}</h3>
              <p className="text-text-muted text-base mb-6">{t('scenario.desc')}</p>

              {/* Feature grid */}
              <div className="mb-4">
                <p className="text-sm text-text-muted mb-3">{t('scenario.inputFeatures')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {FEATURES.map((f, i) => (
                    <div key={f} className="bg-surface2 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{FEATURE_ICONS[i]}</span>
                        <span className="text-sm text-text-muted">{(t as any)(`scenario.features.${i}`)}</span>
                      </div>
                      <FeatureBar value={featureValues[i]} max={1} color="#F59E0B" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-base">
                <span className="text-accent-amber">→</span>
                <span className="text-text-primary">{t('scenario.outputLabel')}</span>
              </div>
              <p className="text-sm text-text-muted mt-2 font-mono opacity-60">{t('scenario.modelSpec')}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Section B: 추론 레이스 ── */}
      <section className="hall-section px-6 pt-8 pb-20 relative z-10">
        <div className="max-w-5xl w-full mx-auto">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center mb-2">{t('race.title')}</h2>
          </ScrollReveal>

          {/* Race arena */}
          <ScrollReveal delay={0.1}>
            <div className="bg-surface1 border border-border rounded-2xl p-6 sm:p-8 mt-8 space-y-6">
              {/* CPU lane */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-data-red">{t('race.cpuLabel')}</span>
                    <span className="text-xs text-text-muted ml-2">{t('race.cpuDesc')}</span>
                  </div>
                  <span className="text-xs font-mono text-text-muted">
                    {racePhase === 'simulating' && t('race.waiting')}
                    {racePhase === 'racing' && (cpuFinished ? t('race.finished') : t('race.running'))}
                    {racePhase === 'done' && t('race.finished')}
                  </span>
                </div>
                <RaceBar
                  progress={cpuProgress}
                  label=""
                  color="#EF4444"
                  time={racePhase === 'done' ? `${cpuTimeUs.toFixed(1)} \u00B5s` : null}
                />
              </div>

              {/* Accel lane */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-data-green">{t('race.accelLabel')}</span>
                    <span className="text-xs text-text-muted ml-2">{t('race.accelDesc')}</span>
                  </div>
                  <span className="text-xs font-mono text-text-muted">
                    {racePhase === 'simulating' && t('race.waiting')}
                    {racePhase === 'racing' && (accelFinished ? t('race.finished') : t('race.running'))}
                    {racePhase === 'done' && t('race.finished')}
                  </span>
                </div>
                <RaceBar
                  progress={accelProgress}
                  label=""
                  color="#10B981"
                  time={racePhase === 'done' ? `${accelTimeUs.toFixed(1)} \u00B5s` : null}
                />
              </div>

              {/* Race button */}
              <div className="flex justify-center pt-2">
                <AnimatePresence mode="wait">
                  {racePhase === 'idle' && (
                    <motion.button
                      key="start"
                      onClick={startRace}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="px-8 py-3 rounded-full bg-accent-amber/10 border-2 border-accent-amber/40 hover:border-accent-amber hover:bg-accent-amber/20 text-accent-amber font-semibold transition-all"
                    >
                      {t('race.startButton')}
                    </motion.button>
                  )}
                  {racePhase === 'simulating' && (
                    <motion.div
                      key="simulating"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-accent-amber" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span className="text-accent-amber font-mono text-sm">{t('race.simulating')}</span>
                      </div>
                      <button
                        onClick={handleSkip}
                        className="text-sm text-text-muted hover:text-accent-amber transition-colors"
                      >
                        {t('race.skip')}
                      </button>
                    </motion.div>
                  )}
                  {racePhase === 'racing' && (
                    <motion.div
                      key="racing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <button
                        onClick={handleSkip}
                        className="text-sm text-text-muted hover:text-accent-amber transition-colors"
                      >
                        {t('race.skip')}
                      </button>
                    </motion.div>
                  )}
                  {racePhase === 'done' && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-3"
                    >
                      <p className="text-lg font-bold text-data-green">
                        {t('race.speedupResult', { value: speedup.toFixed(1) })}
                      </p>
                      <button
                        onClick={() => { setRacePhase('idle'); setCpuProgress(0); setAccelProgress(0); setChartReveal(0) }}
                        className="text-sm text-text-muted hover:text-accent-amber transition-colors"
                      >
                        ↻ {t('race.restart')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isFallback && racePhase !== 'idle' && (
                <p className="text-xs text-center text-accent-amber bg-accent-amber/10 border border-accent-amber/30 rounded-lg px-3 py-1.5">
                  Browser mode
                </p>
              )}
            </div>
          </ScrollReveal>

          {/* Race result metrics */}
          <AnimatePresence>
            {racePhase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8"
              >
                <MetricCard title={t('race.latencyLabel')} value={`${accelTimeUs.toFixed(1)}`} unit={'\u00B5s'} variant="good" delay={0} />
                <MetricCard title={t('race.opsLabel')} value={totalOps.toLocaleString()} variant="default" delay={0.1} />
                <MetricCard title={t('race.speedupLabel')} value={speedup.toFixed(1)} unit="×" variant="good" delay={0.2} />
                <MetricCard title="PE Util." value={`${(utilization * 100).toFixed(1)}`} unit="%" variant={utilization > 0.7 ? 'good' : 'amber'} delay={0.3} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Solar prediction chart */}
          <AnimatePresence>
            {racePhase === 'done' && chartReveal > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mt-12"
              >
                <ScrollReveal>
                  <h3 className="text-xl font-bold text-text-primary text-center mb-2">{t('solar.chartTitle')}</h3>
                  <div className="bg-surface1 border border-border rounded-2xl p-4 sm:p-6">
                    <SolarChart
                      actual={SOLAR_DATA.actual}
                      predicted={SOLAR_DATA.predicted}
                      hours={SOLAR_DATA.hours}
                      revealProgress={chartReveal}
                      labels={solarLabels}
                    />
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-xs font-mono text-text-muted">
                      <span>{t('solar.accuracyLabel')}: <span className="text-accent-blue">{rmse} kW</span></span>
                      <span>{t('solar.peakHour')}: <span className="text-accent-amber">{peakHour}:00</span></span>
                    </div>
                  </div>
                </ScrollReveal>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insights section */}
          <AnimatePresence>
            {racePhase === 'done' && chartReveal >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-12 space-y-8"
              >
                <h3 className="text-2xl font-bold text-text-primary text-center">{t('insights.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Latency insight */}
                  <div className="bg-surface1 border border-border rounded-xl p-5 space-y-2">
                    <h4 className="text-base font-semibold text-data-green">{t('insights.latencyTitle')}</h4>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t('insights.latencyDesc', { cycles: totalCycles.toLocaleString(), time: `${accelTimeUs.toFixed(1)} \u00B5s` })}
                    </p>
                  </div>
                  {/* Efficiency insight */}
                  <div className="bg-surface1 border border-border rounded-xl p-5 space-y-2">
                    <h4 className="text-base font-semibold text-accent-amber">{t('insights.efficiencyTitle')}</h4>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t('insights.efficiencyDesc', { ratio: speedup.toFixed(1) })}
                    </p>
                  </div>
                  {/* Tradeoff insight */}
                  <div className="bg-surface1 border border-border rounded-xl p-5 space-y-2">
                    <h4 className="text-base font-semibold text-accent-blue">{t('insights.tradeoffTitle')}</h4>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t('insights.tradeoffDesc')}
                    </p>
                  </div>
                </div>

                {/* Conclusion */}
                <div className="border-t-2 border-accent-amber/30 pt-8 text-center max-w-2xl mx-auto">
                  <h3 className="text-xl font-bold text-accent-amber mb-3">{t('conclusion.title')}</h3>
                  <p className="text-text-muted text-base whitespace-pre-line leading-relaxed">
                    {t('conclusion.desc')}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <NextHallButton currentHall="demo" />
        </div>
      </section>
    </div>
  )
}
