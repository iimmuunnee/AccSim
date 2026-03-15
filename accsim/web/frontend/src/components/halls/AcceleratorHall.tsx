// HALL 2
'use client'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Slider from '@/components/ui/Slider'
import NextHallButton from '@/components/ui/NextHallButton'
import HallBackground from '@/components/ui/HallBackground'
import InfoPanel from '@/components/ui/InfoPanel'
import ScrollGuide from '@/components/ui/ScrollGuide'
import { useLevelText } from '@/hooks/useLevelText'

const N = 4

/* ─── Cell activation step per processor type ─── */
function cellStep(type: 'cpu' | 'gpu' | 'acc', r: number, c: number) {
  if (type === 'cpu') return r * N + c  // sequential: 0..15
  if (type === 'gpu') return r           // row-parallel: 0..3
  return r + c                           // diagonal wave: 0..6
}

function cycleAt(type: 'cpu' | 'gpu' | 'acc', step: number) {
  if (step < 0) return 0
  if (type === 'cpu') return step + 1       // 1..16
  if (type === 'gpu') return (step + 1) * 2 // 2,4,6,8 (row + sync overhead)
  return step + 1                           // 1..7
}

const CFG = {
  cpu: { maxStep: N * N - 1, totalCycles: 16, ms: 180, color: '#F59E0B' },
  gpu: { maxStep: N - 1,     totalCycles: 8,  ms: 500, color: '#10B981' },
  acc: { maxStep: 2 * (N-1), totalCycles: 7,  ms: 260, color: '#3B82F6' },
}

/* ─── Section A: slow sequential fill (frustration) ─── */
function SlowMatrixFill() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const [step, setStep] = useState(-1)

  useEffect(() => {
    if (!inView) return
    let s = -1
    const iv = setInterval(() => {
      if (++s >= N * N) { clearInterval(iv); return }
      setStep(s)
    }, 420)
    return () => clearInterval(iv)
  }, [inView])

  return (
    <div ref={ref} className="inline-grid grid-cols-4 gap-2">
      {Array.from({ length: N * N }, (_, i) => (
        <motion.div
          key={i}
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center font-mono text-xs select-none"
          style={{
            backgroundColor: step >= i ? 'rgba(59,130,246,0.65)' : 'rgba(39,39,42,0.25)',
            border: `1px solid ${step >= i ? 'rgba(59,130,246,0.3)' : 'rgba(63,63,70,0.15)'}`,
            color: step >= i ? 'rgba(255,255,255,0.7)' : 'transparent',
          }}
          animate={step === i ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.2 }}
        >
          c<sub className="text-[9px]">{i}</sub>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── Section B: matrix fill comparison (auto-play on mount) ─── */
function MatrixFill({ type, delay = 0 }: { type: 'cpu' | 'gpu' | 'acc'; delay?: number }) {
  const [step, setStep] = useState(-1)
  const { maxStep, totalCycles, ms, color } = CFG[type]

  useEffect(() => {
    let s = -1
    let iv: ReturnType<typeof setInterval> | null = null
    const timeout = setTimeout(() => {
      iv = setInterval(() => {
        if (++s > maxStep) { if (iv) clearInterval(iv); return }
        setStep(s)
      }, ms)
    }, delay)
    return () => { clearTimeout(timeout); if (iv) clearInterval(iv) }
  }, [maxStep, ms, delay])

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: N * N }, (_, i) => {
          const r = Math.floor(i / N), c = i % N
          const cs = cellStep(type, r, c)
          const active = step >= cs
          return (
            <motion.div
              key={i}
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-md"
              style={{
                backgroundColor: active ? color + 'B0' : 'rgba(39,39,42,0.2)',
                border: `1px solid ${active ? color + '35' : 'rgba(63,63,70,0.1)'}`,
              }}
              animate={step === cs ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.15 }}
            />
          )
        })}
      </div>
      <div className="mt-4 font-mono tabular-nums text-lg" style={{ color }}>
        {cycleAt(type, step)}{' '}
        <span className="text-text-muted text-sm">/ {totalCycles} cycles</span>
      </div>
    </div>
  )
}

/* ─── Section C: race track ─── */
function RaceTrack({ durations, running }: { durations: [number, number, number]; running: boolean }) {
  const types = ['cpu', 'gpu', 'acc'] as const
  const labels = ['CPU', 'GPU', 'AI Accelerator']
  const max = Math.max(...durations)

  return (
    <div className="space-y-6">
      {types.map((type, i) => (
        <div key={type}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm font-medium" style={{ color: CFG[type].color }}>
              {labels[i]}
            </span>
            <span className="font-mono text-sm text-text-muted tabular-nums">
              {durations[i].toFixed(1)} ms
            </span>
          </div>
          <div className="h-10 bg-surface2/30 rounded-full overflow-hidden border border-border/20">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${CFG[type].color}B0, ${CFG[type].color}50)` }}
              initial={{ width: '0%' }}
              animate={running ? { width: '100%' } : { width: '0%' }}
              transition={running ? { duration: (durations[i] / max) * 3, ease: 'linear' } : { duration: 0.3 }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Section D: count-up number ─── */
function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / 1500, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ═══════════════════════════════════════════ */
export default function AcceleratorHall() {
  const t = useTranslations('accelerator')
  const lt = useLevelText('accelerator')
  const [modelSize, setModelSize] = useState(50)
  const [batchSize, setBatchSize] = useState(8)
  const [raceRunning, setRaceRunning] = useState(false)
  const [raceKey, setRaceKey] = useState(0)

  // Section B: auto-play when scrolled into view
  const [matrixKey, setMatrixKey] = useState(0)
  const matrixRef = useRef<HTMLDivElement>(null)
  const matrixInView = useInView(matrixRef, { once: true, margin: '-20%' })
  useEffect(() => { if (matrixInView) setMatrixKey(1) }, [matrixInView])

  // Section C: auto-play race when scrolled into view
  const raceRef = useRef<HTMLDivElement>(null)
  const raceInView = useInView(raceRef, { once: true, margin: '-30%' })
  useEffect(() => {
    if (raceInView) { setRaceRunning(true); setRaceKey(1) }
  }, [raceInView])

  const durations = useMemo((): [number, number, number] => {
    const m = modelSize, b = batchSize
    return [
      0.5 * m * (1 + 0.02 * m) * (1 + 0.8 * Math.log2(b + 1)),
      (2 + m * 0.15) / Math.sqrt(b),
      (0.3 + m * 0.008) * (1 + 0.1 / Math.sqrt(b)),
    ]
  }, [modelSize, batchSize])

  const startRace = () => {
    setRaceRunning(false)
    setTimeout(() => { setRaceRunning(true); setRaceKey(k => k + 1) }, 50)
  }

  return (
    <div className="bg-background min-h-screen relative">
      <HallBackground hall="accelerator" />

      {/* ── Section A: 도입 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 bg-accent-amber rounded-full" />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">
                Hall 2 — Accelerator
              </p>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
              {t('sectionA.heading')}
            </h1>
            <InfoPanel variant="highlight" className="max-w-2xl mx-auto mb-12 text-center">
              <p className="text-text-muted text-lg">
                {lt('sectionA.subtext')}
              </p>
            </InfoPanel>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <SlowMatrixFill />
            <p className="text-text-muted text-sm mt-6 italic">{t('sectionA.matrixHint')}</p>
          </ScrollReveal>
          <div className="mt-8">
            <ScrollGuide hideAfterIndex={0} />
          </div>
        </div>
      </section>

      {/* ── Section B: 세 가지 접근 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-6xl w-full">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
              {t('sectionB.heading')}
            </h2>
            <p className="text-text-muted text-center mb-12 max-w-lg mx-auto">
              {t('sectionB.subtext')}
            </p>
          </ScrollReveal>

          <div ref={matrixRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 group/cards" key={matrixKey}>
            {matrixKey > 0 && (['cpu', 'gpu', 'acc'] as const).map((type, i) => (
              <ScrollReveal key={type} delay={i * 0.12}>
                <div className="flex flex-col items-center p-8 bg-surface1/40 border border-border/40 rounded-2xl transition-opacity duration-300 group-hover/cards:opacity-30 hover:!opacity-100">
                  <h3 className="text-xl font-bold mb-1" style={{ color: CFG[type].color }}>
                    {t(`sectionB.${type}.name` as any)}
                  </h3>
                  <p className="text-text-muted text-sm mb-6 italic">
                    {t(`sectionB.${type}.analogy` as any)}
                  </p>
                  <MatrixFill type={type} delay={i * 400} />
                  <p className="text-text-muted text-xs mt-5 text-center leading-relaxed">
                    {lt(`sectionB.${type}.desc`)}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setMatrixKey(k => k + 1)}
              className="text-sm text-text-muted hover:text-accent-blue transition-colors flex items-center gap-2"
            >
              <span className="text-base">↻</span> {t('sectionB.replay')}
            </button>
          </div>
        </div>
      </section>

      {/* ── Section C: 인터랙티브 비교 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-5xl w-full">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
              {t('sectionC.heading')}
            </h2>
            <p className="text-text-muted text-center mb-12">
              {t('sectionC.subtext')}
            </p>
          </ScrollReveal>

          <div ref={raceRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ScrollReveal direction="left">
              <div className="bg-surface1 border border-border rounded-2xl p-8 space-y-6">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  {t('sectionC.controls')}
                </p>
                <Slider
                  label={t('sectionC.modelSize')}
                  value={modelSize} min={1} max={100}
                  onChange={v => { setModelSize(v); setRaceRunning(false) }}
                  displayValue={`${modelSize}B`}
                />
                <Slider
                  label={t('sectionC.batchSize')}
                  value={batchSize} min={1} max={128}
                  onChange={v => { setBatchSize(v); setRaceRunning(false) }}
                />
                <button
                  onClick={startRace}
                  className="w-full py-3 bg-accent-blue/10 border border-accent-blue/30 rounded-xl text-accent-blue font-medium hover:bg-accent-blue/20 transition-colors"
                >
                  {t('sectionC.start')}
                </button>
              </div>
            </ScrollReveal>

            <div className="lg:col-span-2">
              <ScrollReveal direction="right">
                <div className="bg-surface1 border border-border rounded-2xl p-8">
                  <RaceTrack key={raceKey} durations={durations} running={raceRunning} />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section D: 결론 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { target: 1000, suffix: '×', label: t('sectionD.stat1Label') },
              { target: 100, suffix: '×', label: t('sectionD.stat2Label') },
              { target: 1, suffix: '', label: t('sectionD.stat3Label') },
            ].map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="p-8">
                  <div className="text-3xl sm:text-5xl md:text-6xl font-bold font-mono text-accent-blue mb-3 whitespace-nowrap">
                    <CountUp target={s.target} suffix={s.suffix} />
                  </div>
                  <p className="text-text-muted text-lg">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <p className="text-2xl md:text-3xl font-bold text-text-primary leading-relaxed mb-12">
              {lt('sectionD.conclusion')}
            </p>
          </ScrollReveal>

          <NextHallButton currentHall="accelerator" />
        </div>
      </section>
    </div>
  )
}
