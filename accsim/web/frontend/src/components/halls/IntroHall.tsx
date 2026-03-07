// HALL 1
'use client'
import { useTranslations } from 'next-intl'
import { motion, useInView, useMotionValueEvent, useScroll } from 'framer-motion'
import { useState, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import ScrollGuide from '@/components/ui/ScrollGuide'
import NextHallButton from '@/components/ui/NextHallButton'
import Term from '@/components/ui/Term'
import HallBackground from '@/components/ui/HallBackground'

const IntroHero = dynamic(() => import('@/components/three/IntroHero').then(m => ({ default: m.IntroHero })), { ssr: false })

/* ── Shared Utilities ── */

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (idx >= text.length) return
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, idx + 1))
      setIdx(i => i + 1)
    }, 50)
    return () => clearTimeout(t)
  }, [idx, text])
  return <span>{displayed}<span className="animate-pulse">|</span></span>
}

function CountUpNumber({ target, duration = 2000, suffix = '', trigger = true }: { target: number; duration?: number; suffix?: string; trigger?: boolean }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, trigger])
  return <>{val.toLocaleString()}{suffix}</>
}

/* ── Section 2: Explosion Dashboard ── */

const MILESTONES = [
  { year: 2012, compute: 1 },
  { year: 2015, compute: 10 },
  { year: 2018, compute: 300 },
  { year: 2021, compute: 3000 },
  { year: 2025, compute: 10000 },
]

function ExplosionSection() {
  const t = useTranslations('intro')
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-20%' })

  const [animProg, setAnimProg] = useState(0)
  const [titleShrunk, setTitleShrunk] = useState(false)

  useEffect(() => {
    if (!inView) return
    const delay = setTimeout(() => {
      setTitleShrunk(true)
      const start = Date.now()
      const duration = 3000
      const tick = () => {
        const elapsed = Date.now() - start
        const p = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setAnimProg(eased)
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, 1000)
    return () => clearTimeout(delay)
  }, [inView])

  const activeMilestoneIdx = Math.min(Math.floor(animProg * MILESTONES.length), MILESTONES.length - 1)

  // SVG graph dimensions (enlarged)
  const graphW = 800
  const graphH = 300
  const padding = 50

  // Exponential demand curve points
  const demandPoints = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= 100; i++) {
      const frac = i / 100
      const x = padding + frac * (graphW - 2 * padding)
      // Exponential: y = e^(frac*9.2) / e^9.2 maps [0,1] → [0,1]
      const norm = (Math.exp(frac * 9.2) - 1) / (Math.exp(9.2) - 1)
      const y = graphH - padding - norm * (graphH - 2 * padding)
      pts.push(`${x},${y}`)
    }
    return pts.join(' ')
  }, [])

  // Linear HW performance curve
  const hwPoints = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= 100; i++) {
      const frac = i / 100
      const x = padding + frac * (graphW - 2 * padding)
      const norm = frac * 0.15 // HW grows much slower
      const y = graphH - padding - norm * (graphH - 2 * padding)
      pts.push(`${x},${y}`)
    }
    return pts.join(' ')
  }, [])

  // Gap area between demand and HW curves
  const gapPoints = useMemo(() => {
    const demandPts: string[] = []
    const hwPtsReverse: string[] = []
    for (let i = 0; i <= 100; i++) {
      const frac = i / 100
      const x = padding + frac * (graphW - 2 * padding)
      const demandNorm = (Math.exp(frac * 9.2) - 1) / (Math.exp(9.2) - 1)
      const demandY = graphH - padding - demandNorm * (graphH - 2 * padding)
      const hwNorm = frac * 0.15
      const hwY = graphH - padding - hwNorm * (graphH - 2 * padding)
      demandPts.push(`${x},${demandY}`)
      hwPtsReverse.unshift(`${x},${hwY}`)
    }
    return [...demandPts, ...hwPtsReverse].join(' ')
  }, [])

  // Clip path for animated reveal
  const revealFrac = Math.min(animProg * 1.2, 1)

  return (
    <section ref={sectionRef} className="hall-section hall-section-alt relative flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      <HallBackground variant="gradient" />

      <div className="relative z-10 max-w-5xl w-full">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, scale: 1.4 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-text-primary text-center mb-12"
        >
          {t('explosion.title')}
        </motion.h2>

        {/* Timeline + Graph + CountUp wrapper — appears after title shrinks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={titleShrunk ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >

        {/* Timeline */}
        <div className="mb-8">
          <div className="relative flex justify-between max-w-3xl mx-auto pt-10 pb-2">
            {/* Track line — top: 48px = pt-10(40px) + circle radius(8px) */}
            <div className="absolute left-0 right-0 h-px bg-border" style={{ top: '48px' }} />
            <div
              className="absolute left-0 h-px transition-all duration-500"
              style={{ top: '48px', width: `${animProg * 100}%`, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }}
            />

            {MILESTONES.map((ms, i) => {
              const isActive = i <= activeMilestoneIdx && inView
              const t_color = MILESTONES.length > 1 ? i / (MILESTONES.length - 1) : 0
              // #3B82F6 → #8B5CF6 gradient interpolation
              const cR = Math.round(59 + (139 - 59) * t_color)
              const cG = Math.round(130 + (92 - 130) * t_color)
              const circleColor = `rgb(${cR}, ${cG}, 246)`
              const glowColor = `rgba(${cR}, ${cG}, 246, 0.5)`
              return (
                <div key={ms.year} className="relative z-10 flex flex-col items-center group">
                  {/* Tooltip above circle — absolute positioned */}
                  <div className={`absolute bottom-full mb-2 px-3 py-1 rounded-md text-xs font-mono transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'opacity-100 border'
                      : 'opacity-0'
                  }`}
                  style={isActive ? { color: circleColor, borderColor: `rgba(${cR}, ${cG}, 246, 0.3)`, background: `rgba(${cR}, ${cG}, 246, 0.15)` } : {}}>
                    {ms.compute.toLocaleString()}×
                  </div>
                  {/* Circle — center overlaps the line, gradient color per index */}
                  <motion.div
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? 'border-transparent'
                        : 'bg-background border-border'
                    }`}
                    style={isActive ? { backgroundColor: circleColor, boxShadow: `0 0 12px ${glowColor}` } : {}}
                  />
                  {/* Year below circle */}
                  <span className={`mt-2 text-sm font-mono transition-colors duration-300 ${
                    isActive ? 'text-text-primary' : 'text-text-muted/40'
                  }`}>
                    {ms.year}
                  </span>
                  {/* Milestone label */}
                  <span className={`mt-1 text-xs transition-colors duration-300 ${
                    isActive ? 'text-text-muted' : 'text-text-muted/20'
                  }`}>
                    {t(`explosion.milestones.${ms.year}.label` as any)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Exponential vs HW graph */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-2xl">
            <svg viewBox={`0 0 ${graphW} ${graphH}`} className="w-full h-auto">
              <defs>
                <clipPath id="reveal-clip">
                  <rect x="0" y="0" width={revealFrac * graphW} height={graphH} />
                </clipPath>
                {/* Demand line gradient: blue → purple */}
                <linearGradient id="demand-line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                {/* Demand area fill gradient */}
                <linearGradient id="demand-fill-grad" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
                </linearGradient>
                {/* Gap area fill */}
                <linearGradient id="gap-fill-grad" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.12" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map(f => (
                <line key={f} x1={padding} y1={padding + f * (graphH - 2 * padding)} x2={graphW - padding} y2={padding + f * (graphH - 2 * padding)}
                  stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              ))}

              {/* Gap area between curves (red tint) */}
              <polygon
                points={gapPoints}
                fill="url(#gap-fill-grad)"
                clipPath="url(#reveal-clip)"
              />

              {/* HW performance (amber dashed) */}
              <polyline
                points={hwPoints}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeDasharray="6 4"
                clipPath="url(#reveal-clip)"
              />

              {/* Demand curve fill */}
              <polygon
                points={`${padding},${graphH - padding} ${demandPoints} ${graphW - padding},${graphH - padding}`}
                fill="url(#demand-fill-grad)"
                clipPath="url(#reveal-clip)"
              />

              {/* Demand curve line (gradient) */}
              <polyline
                points={demandPoints}
                fill="none"
                stroke="url(#demand-line-grad)"
                strokeWidth="2.5"
                clipPath="url(#reveal-clip)"
              />

              {/* Legend (top-left inside SVG) */}
              <g transform={`translate(${padding + 10}, ${padding + 10})`}>
                {/* Demand legend */}
                <line x1="0" y1="0" x2="20" y2="0" stroke="url(#demand-line-grad)" strokeWidth="2.5" />
                <text x="26" y="4" fill="#A78BFA" fontSize="16" fontFamily="Inter, sans-serif" fontWeight="500">
                  {t('explosion.demandLabel')}
                </text>
                {/* HW legend */}
                <line x1="0" y1="20" x2="20" y2="20" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" />
                <text x="26" y="24" fill="#F59E0B" fontSize="16" fontFamily="Inter, sans-serif" fontWeight="500">
                  {t('explosion.hwLabel')}
                </text>
              </g>
            </svg>

            {/* Gap warning */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={animProg > 0.7 ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center text-text-muted text-sm mt-4"
            >
              {t('explosion.gapWarning')}
            </motion.p>
          </div>
        </div>

        {/* Big count-up number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={animProg > 0.6 ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <div
            className="text-4xl sm:text-6xl md:text-8xl font-bold font-mono mb-2"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <CountUpNumber target={10000} duration={2500} suffix={t('explosion.countUpSuffix')} trigger={animProg > 0.6} />
          </div>
          <p className="text-text-muted text-lg">{t('explosion.countUpDesc')}</p>
        </motion.div>

        </motion.div>{/* end titleShrunk wrapper */}
      </div>
    </section>
  )
}

/* ── Section 3: Matrix Keynote Reveal ── */

function MatrixRevealSection() {
  const t = useTranslations('intro')
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-20%' })
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const [scrollProg, setScrollProg] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => {
    const quantized = Math.round(v * 40) / 40
    setScrollProg(prev => prev === quantized ? prev : quantized)
  })

  const revealProg = Math.min(Math.max((scrollProg - 0.15) / 0.4, 0), 1)
  const showBillions = revealProg > 0.7
  const showTilePattern = revealProg > 0.85

  const [waveActive, setWaveActive] = useState(false)
  useEffect(() => {
    if (showTilePattern && inView) {
      const timer = setTimeout(() => setWaveActive(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [showTilePattern, inView])

  // Matrix values for display
  const matA = [[2, 0, 1], [1, 3, 1], [0, 2, 4]]
  const matW = [[1, 2, 0], [0, 1, 3], [2, 0, 1]]
  const matC = [
    [4, 4, 1],
    [3, 5, 10],
    [8, 2, 10],
  ]

  const cellDelay = (i: number, phase: number) => phase + i * 0.06

  return (
    <section ref={sectionRef} className="hall-section relative flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      <HallBackground variant="gradient" />
      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Title - dramatic fade in */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-text-primary mb-4"
        >
          {t('matrix.title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-text-muted text-lg mb-12"
        >
          {t('matrix.subtitle')}
        </motion.p>

        {/* Matrix A @ W = C — Keynote style reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 sm:gap-4 md:gap-8 justify-center flex-wrap mb-12"
        >
          {/* Matrix A */}
          <div className="text-center">
            <p className="text-text-muted text-xs mb-2 font-mono tracking-wider">Activation (A)</p>
            <div className="grid grid-cols-3 gap-1">
              {matA.flat().map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: cellDelay(i, 1.0), duration: 0.3, ease: 'backOut' }}
                  className="w-8 h-8 sm:w-11 sm:h-11 bg-accent-blue/15 border border-accent-blue/30 rounded-md flex items-center justify-center text-accent-blue text-sm font-mono font-medium"
                >
                  {v}
                </motion.div>
              ))}
            </div>
          </div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1.6, duration: 0.3 }}
            className="text-text-muted text-3xl font-light"
          >
            ×
          </motion.span>

          {/* Matrix W */}
          <div className="text-center">
            <p className="text-text-muted text-xs mb-2 font-mono tracking-wider">Weight (W)</p>
            <div className="grid grid-cols-3 gap-1">
              {matW.flat().map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: cellDelay(i, 1.7), duration: 0.3, ease: 'backOut' }}
                  className="w-8 h-8 sm:w-11 sm:h-11 bg-accent-amber/15 border border-accent-amber/30 rounded-md flex items-center justify-center text-accent-amber text-sm font-mono font-medium"
                >
                  {v}
                </motion.div>
              ))}
            </div>
          </div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 2.3, duration: 0.3 }}
            className="text-text-muted text-3xl font-light"
          >
            =
          </motion.span>

          {/* Matrix C */}
          <div className="text-center">
            <p className="text-text-muted text-xs mb-2 font-mono tracking-wider">Output (C)</p>
            <div className="grid grid-cols-3 gap-1">
              {matC.flat().map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: cellDelay(i, 2.4), duration: 0.3, ease: 'backOut' }}
                  className="w-8 h-8 sm:w-11 sm:h-11 bg-data-green/15 border border-data-green/30 rounded-md flex items-center justify-center text-data-green text-sm font-mono font-medium"
                >
                  {v}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Description with Term components */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 3.0, duration: 0.8 }}
          className="text-text-muted text-base max-w-2xl mx-auto mb-8"
        >
          {(() => {
            const desc = t('matrix.desc');
            const [beforeGEMM, ...afterGEMM] = desc.split('GEMM');
            const postGEMM = afterGEMM.join('GEMM');
            const [beforeMAC, ...afterMAC] = postGEMM.split('MAC');
            const postMAC = afterMAC.join('MAC');
            // beforeMAC 예: " 연산으로 귀결됩니다. 하나의 결과값을 얻기 위한 곱셈과 덧셈, 이 "
            // ". " 기준으로 첫 문장 / 둘째 문장 분리
            const sentenceSplit = beforeMAC.split('. ');
            const firstSentenceEnd = sentenceSplit[0] + '.';
            const secondSentenceStart = sentenceSplit.slice(1).join('. ');
            return (
              <>
                <span className="whitespace-nowrap">
                  {beforeGEMM}<Term id="GEMM">GEMM</Term>{firstSentenceEnd}
                </span>
                <br />
                <span className="whitespace-nowrap">
                  {secondSentenceStart}<Term id="MAC">MAC</Term>{postMAC}
                </span>
              </>
            );
          })()}
        </motion.p>

        {/* "Billions of times" reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showBillions && inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <p className="text-2xl md:text-3xl font-semibold text-text-primary">
            {t('matrix.billions')}
          </p>
        </motion.div>

        {/* Repeating tile pattern — scale visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={showTilePattern && inView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="flex justify-center"
        >
          <style>{`
            @keyframes tileWave {
              0%, 100% { opacity: 0.15; transform: scale(0.95); }
              35%, 50% { opacity: 0.6; transform: scale(1.1); }
              70% { opacity: 0.2; transform: scale(0.97); }
            }
          `}</style>
          <div className="grid grid-cols-8 md:grid-cols-12 gap-[2px]">
            {Array.from({ length: 96 }).map((_, i) => {
              const cols = 12
              const row = Math.floor(i / cols)
              const col = i % cols
              const waveDelay = row * 0.6 + col * 0.08
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={showTilePattern && inView ? { opacity: 0.15 + Math.random() * 0.35, scale: 1 } : {}}
                  transition={{ delay: i * 0.008, duration: 0.2 }}
                  className="w-3 h-3 md:w-4 md:h-4 rounded-[2px]"
                  style={{
                    backgroundColor: ['rgb(59,130,246)', 'rgb(245,158,11)', 'rgb(34,197,94)'][i % 3],
                    ...(waveActive ? {
                      animation: `tileWave 2.5s ease-in-out ${waveDelay}s infinite`,
                    } : {}),
                  }}
                />
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Section 4: CPU / GPU / Accelerator Comparison ── */

function CompareSection() {
  const t = useTranslations('intro')
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-15%' })
  const [raceStarted, setRaceStarted] = useState(false)
  const [racePhase, setRacePhase] = useState(0) // 0: idle, 1: running, 2: done
  const [cpuProgress, setCpuProgress] = useState(0)
  const [gpuProgress, setGpuProgress] = useState(0)
  const [accProgress, setAccProgress] = useState(0)
  const [revealed, setRevealed] = useState(false)

  // Start race when scrolled into view
  useEffect(() => {
    if (inView && !raceStarted) {
      const timer = setTimeout(() => {
        setRaceStarted(true)
        setRacePhase(1)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [inView, raceStarted])

  // Animate progress bars
  useEffect(() => {
    if (racePhase !== 1) return

    const cpuDuration = 4000
    const gpuDuration = 2200
    const accDuration = 800
    const start = Date.now()

    const tick = () => {
      const elapsed = Date.now() - start
      const ease = (p: number) => p < 1 ? p * p * (3 - 2 * p) : 1

      setCpuProgress(ease(Math.min(elapsed / cpuDuration, 1)))
      setGpuProgress(ease(Math.min(elapsed / gpuDuration, 1)))
      setAccProgress(ease(Math.min(elapsed / accDuration, 1)))

      if (elapsed < cpuDuration) {
        requestAnimationFrame(tick)
      } else {
        setRacePhase(2)
      }
    }
    requestAnimationFrame(tick)
  }, [racePhase])

  // Reveal systolic array after race completes
  useEffect(() => {
    if (racePhase === 2) {
      const timer = setTimeout(() => setRevealed(true), 600)
      return () => clearTimeout(timer)
    }
  }, [racePhase])

  const processors = [
    {
      key: 'cpu',
      name: t('compare.cpu.name'),
      desc: t('compare.cpu.desc'),
      progress: cpuProgress,
      color: 'rgb(239,68,68)',
      icon: (
        <div className="w-12 h-12 border border-red-500/40 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 bg-red-500/30 rounded-sm" />
        </div>
      ),
    },
    {
      key: 'gpu',
      name: t('compare.gpu.name'),
      desc: t('compare.gpu.desc'),
      progress: gpuProgress,
      color: 'rgb(168,85,247)',
      icon: (
        <div className="w-12 h-12 border border-purple-500/40 rounded-lg grid grid-cols-3 grid-rows-3 gap-[2px] p-1">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="bg-purple-500/30 rounded-[1px]" />
          ))}
        </div>
      ),
    },
    {
      key: 'acc',
      name: revealed ? t('compare.acc.revealName') : t('compare.acc.name'),
      desc: t('compare.acc.desc'),
      progress: accProgress,
      color: 'rgb(59,130,246)',
      icon: (
        <div className="w-12 h-12 border border-accent-blue/40 rounded-lg relative overflow-hidden">
          {revealed ? (
            <div className="grid grid-cols-4 grid-rows-4 gap-[1px] p-[3px] h-full">
              {Array(16).fill(0).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-accent-blue/40 rounded-[1px]"
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-accent-blue text-lg font-bold">?</div>
          )}
        </div>
      ),
    },
  ]

  return (
    <section ref={sectionRef} className="hall-section hall-section-alt relative flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      <HallBackground variant="gradient" />

      <div className="relative z-10 max-w-4xl w-full">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-text-primary text-center mb-2 md:mb-4"
        >
          {t('compare.title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-text-muted text-lg text-center mb-8"
        >
          {t('compare.subtitle')}
        </motion.p>

        {/* Three processor cards + race bars */}
        <div className="space-y-4 md:space-y-6 mb-12 group/cards">
          {processors.map((proc, i) => (
            <motion.div
              key={proc.key}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
              className="flex items-center gap-4 md:gap-6 transition-opacity duration-300 group-hover/cards:opacity-30 hover:!opacity-100"
            >
              {/* Icon */}
              {proc.icon}

              {/* Info + progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-semibold text-text-primary text-lg">{proc.name}</span>
                  <span className="text-text-muted text-sm hidden md:inline">{proc.desc}</span>
                </div>

                {/* Progress bar */}
                <div className="h-3 bg-surface1 rounded-full overflow-hidden border border-border">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${proc.progress * 100}%`,
                      backgroundColor: proc.color,
                      boxShadow: proc.progress >= 1 ? `0 0 12px ${proc.color}` : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Completion indicator */}
              <div className="w-8 text-center">
                {proc.progress >= 1 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className="text-lg"
                    style={{ color: proc.color }}
                  >
                    ✓
                  </motion.span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reveal: Systolic Array */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={revealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-blue mb-3">
            {t('compare.reveal')}
          </h3>
          <p className="text-text-muted text-base mb-6 max-w-lg mx-auto">
            {t('compare.revealDesc')}
          </p>

          {/* Systolic array grid visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={revealed ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-grid grid-cols-8 gap-1 mb-8"
          >
            {Array.from({ length: 64 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={revealed ? { opacity: 1 } : {}}
                transition={{ delay: 0.4 + i * 0.01, duration: 0.2 }}
                className="w-5 h-5 md:w-6 md:h-6 rounded-sm bg-accent-blue/20 border border-accent-blue/30"
                style={{
                  boxShadow: `0 0 ${4 + Math.random() * 4}px rgba(59,130,246,${0.1 + Math.random() * 0.2})`,
                }}
              />
            ))}
          </motion.div>

          {/* CTA to next hall */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={revealed ? { opacity: 1 } : {}}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <p className="text-text-muted text-sm mb-4 md:mb-6">{t('compare.cta')}</p>
            <NextHallButton currentHall="intro" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Main IntroHall ── */

export default function IntroHall() {
  const t = useTranslations('intro')

  return (
    <div className="bg-background">
      {/* Section 1: Hero (preserved) */}
      <section className="hall-section relative flex items-center justify-center overflow-hidden">
        <IntroHero />
        <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="text-text-muted text-sm font-mono tracking-widest uppercase mb-4">
              Hall 1 — Intro
            </p>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-text-primary leading-tight mb-6">
              <TypewriterText text={t('hero.title')} />
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('hero.subtitle1')}
              <br />
              {t('hero.subtitle2')}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ScrollGuide />
        </div>
      </section>

      {/* Section 2: Explosion Dashboard */}
      <ExplosionSection />

      {/* Section 3: Matrix Keynote Reveal */}
      <MatrixRevealSection />

      {/* Section 4: CPU/GPU/Accelerator Comparison */}
      <CompareSection />
    </div>
  )
}
