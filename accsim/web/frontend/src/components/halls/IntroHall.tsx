// HALL 1 — Scroll-Driven Scene Transitions
'use client'
import { useTranslations } from 'next-intl'
import { motion, useInView, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import ScrollGuide from '@/components/ui/ScrollGuide'
import NextHallButton from '@/components/ui/NextHallButton'
import Term from '@/components/ui/Term'
import HallBackground from '@/components/ui/HallBackground'
import { useLevelText } from '@/hooks/useLevelText'

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

/* ── Section 2: Explosion Dashboard — Scroll-Driven ── */

const MILESTONES = [
  { year: 2012, compute: 1 },
  { year: 2015, compute: 10 },
  { year: 2018, compute: 300 },
  { year: 2021, compute: 3000 },
  { year: 2025, compute: 10000 },
]

function ExplosionSection() {
  const t = useTranslations('intro')
  const lt = useLevelText('intro')
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll-driven: tall container (250vh) with sticky viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  const [animProg, setAnimProg] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => {
    const q = Math.round(v * 50) / 50
    setAnimProg(prev => prev === q ? prev : q)
  })

  const titleOpacity = animProg < 0.1 ? 1 : Math.max(0.3, 1 - (animProg - 0.1) / 0.15)
  const showContent = animProg > 0.08
  // Graph reveal synced to scroll
  const graphProgress = Math.min(Math.max((animProg - 0.1) / 0.5, 0), 1)
  const activeMilestoneIdx = Math.min(Math.floor(graphProgress * MILESTONES.length), MILESTONES.length - 1)
  const showCountUp = animProg > 0.65
  const [countUpTriggered, setCountUpTriggered] = useState(false)
  useEffect(() => {
    if (showCountUp && !countUpTriggered) setCountUpTriggered(true)
  }, [showCountUp, countUpTriggered])

  // SVG graph dimensions
  const graphW = 800
  const graphH = 300
  const padding = 50

  const demandPoints = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= 100; i++) {
      const frac = i / 100
      const x = padding + frac * (graphW - 2 * padding)
      const norm = (Math.exp(frac * 9.2) - 1) / (Math.exp(9.2) - 1)
      const y = graphH - padding - norm * (graphH - 2 * padding)
      pts.push(`${x},${y}`)
    }
    return pts.join(' ')
  }, [])

  const hwPoints = useMemo(() => {
    const pts: string[] = []
    for (let i = 0; i <= 100; i++) {
      const frac = i / 100
      const x = padding + frac * (graphW - 2 * padding)
      const norm = frac * 0.15
      const y = graphH - padding - norm * (graphH - 2 * padding)
      pts.push(`${x},${y}`)
    }
    return pts.join(' ')
  }, [])

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

  const revealFrac = Math.min(graphProgress * 1.2, 1)

  return (
    <div ref={containerRef} className="hall-section relative" style={{ height: '250vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">
        <div className="relative z-10 max-w-5xl w-full">
          {/* Title — fades with scroll */}
          <motion.h2
            className="text-3xl sm:text-4xl md:text-6xl font-bold text-text-primary text-center mb-12"
            style={{ opacity: titleOpacity, transition: 'opacity 0.2s ease' }}
          >
            {lt('explosion.title')}
          </motion.h2>

          {/* Timeline + Graph — scroll-driven reveal */}
          <motion.div
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Timeline */}
            <div className="mb-8">
              <div className="relative flex justify-between max-w-3xl mx-auto pt-10 pb-2">
                <div className="absolute left-0 right-0 h-px bg-border" style={{ top: '48px' }} />
                <div
                  className="absolute left-0 h-px"
                  style={{ top: '48px', width: `${graphProgress * 100}%`, background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', transition: 'width 0.15s linear' }}
                />

                {MILESTONES.map((ms, i) => {
                  const isActive = i <= activeMilestoneIdx && showContent
                  const t_color = MILESTONES.length > 1 ? i / (MILESTONES.length - 1) : 0
                  const cR = Math.round(59 + (139 - 59) * t_color)
                  const cG = Math.round(130 + (92 - 130) * t_color)
                  const circleColor = `rgb(${cR}, ${cG}, 246)`
                  const glowColor = `rgba(${cR}, ${cG}, 246, 0.5)`
                  return (
                    <div key={ms.year} className="relative z-10 flex flex-col items-center group">
                      <div className={`absolute bottom-full mb-2 px-3 py-1 rounded-md text-xs font-mono transition-all duration-300 whitespace-nowrap ${
                        isActive ? 'opacity-100 border' : 'opacity-0'
                      }`}
                      style={isActive ? { color: circleColor, borderColor: `rgba(${cR}, ${cG}, 246, 0.3)`, background: `rgba(${cR}, ${cG}, 246, 0.15)` } : {}}>
                        {ms.compute.toLocaleString()}×
                      </div>
                      <motion.div
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                          isActive ? 'border-transparent' : 'bg-background border-border'
                        }`}
                        style={isActive ? { backgroundColor: circleColor, boxShadow: `0 0 12px ${glowColor}` } : {}}
                      />
                      <span className={`mt-2 text-sm font-mono transition-colors duration-300 ${
                        isActive ? 'text-text-primary' : 'text-text-muted/40'
                      }`}>
                        {ms.year}
                      </span>
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

            {/* Exponential vs HW graph — scroll-driven clip */}
            <div className="flex justify-center mb-8">
              <div className="relative w-full max-w-2xl">
                <svg viewBox={`0 0 ${graphW} ${graphH}`} className="w-full h-auto">
                  <defs>
                    <clipPath id="reveal-clip">
                      <rect x="0" y="0" width={revealFrac * graphW} height={graphH} />
                    </clipPath>
                    <linearGradient id="demand-line-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                    <linearGradient id="demand-fill-grad" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="gap-fill-grad" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.02" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0.12" />
                    </linearGradient>
                  </defs>

                  {[0.25, 0.5, 0.75].map(f => (
                    <line key={f} x1={padding} y1={padding + f * (graphH - 2 * padding)} x2={graphW - padding} y2={padding + f * (graphH - 2 * padding)}
                      stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  ))}

                  <polygon points={gapPoints} fill="url(#gap-fill-grad)" clipPath="url(#reveal-clip)" />
                  <polyline points={hwPoints} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" clipPath="url(#reveal-clip)" />
                  <polygon points={`${padding},${graphH - padding} ${demandPoints} ${graphW - padding},${graphH - padding}`} fill="url(#demand-fill-grad)" clipPath="url(#reveal-clip)" />
                  <polyline points={demandPoints} fill="none" stroke="url(#demand-line-grad)" strokeWidth="2.5" clipPath="url(#reveal-clip)" />

                  <g transform={`translate(${padding + 10}, ${padding + 10})`}>
                    <line x1="0" y1="0" x2="20" y2="0" stroke="url(#demand-line-grad)" strokeWidth="2.5" />
                    <text x="26" y="4" fill="#A78BFA" fontSize="16" fontFamily="var(--font-sans), sans-serif" fontWeight="500">
                      {t('explosion.demandLabel')}
                    </text>
                    <line x1="0" y1="20" x2="20" y2="20" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" />
                    <text x="26" y="24" fill="#F59E0B" fontSize="16" fontFamily="var(--font-sans), sans-serif" fontWeight="500">
                      {t('explosion.hwLabel')}
                    </text>
                  </g>
                </svg>

                <motion.p
                  animate={{ opacity: graphProgress > 0.7 ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center text-text-muted text-sm mt-4"
                >
                  {t('explosion.gapWarning')}
                </motion.p>
              </div>
            </div>

            {/* Big count-up number — triggered once by scroll */}
            <motion.div
              animate={{ opacity: showCountUp ? 1 : 0, scale: showCountUp ? 1 : 0.8 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
                <CountUpNumber target={10000} duration={2500} suffix={t('explosion.countUpSuffix')} trigger={countUpTriggered} />
              </div>
              <p className="text-text-muted text-lg">{t('explosion.countUpDesc')}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ── Section 3: Matrix Keynote Reveal ── */

function MatrixRevealSection() {
  const t = useTranslations('intro')
  const lt = useLevelText('intro')
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

  const matA = [[2, 0, 1], [1, 3, 1], [0, 2, 4]]
  const matW = [[1, 2, 0], [0, 1, 3], [2, 0, 1]]
  const matC = [[4, 4, 1], [3, 5, 10], [8, 2, 10]]

  const cellDelay = (i: number, phase: number) => phase + i * 0.06

  return (
    <section ref={sectionRef} className="hall-section relative flex items-center justify-center px-4 sm:px-6 overflow-hidden">
      <div className="relative z-10 max-w-4xl w-full text-center">
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

        {/* Matrix A @ W = C */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 sm:gap-4 md:gap-8 justify-center flex-wrap mb-12"
        >
          <div className="text-center">
            <p className="text-text-muted text-xs mb-2 font-mono tracking-wider">Activation (A)</p>
            <div className="grid grid-cols-3 gap-1">
              {matA.flat().map((v, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: cellDelay(i, 1.0), duration: 0.3, ease: 'backOut' }}
                  className="w-8 h-8 sm:w-11 sm:h-11 bg-accent-blue/15 border border-accent-blue/30 rounded-md flex items-center justify-center text-accent-blue text-sm font-mono font-medium"
                >{v}</motion.div>
              ))}
            </div>
          </div>

          <motion.span initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.6, duration: 0.3 }}
            className="text-text-muted text-3xl font-light">×</motion.span>

          <div className="text-center">
            <p className="text-text-muted text-xs mb-2 font-mono tracking-wider">Weight (W)</p>
            <div className="grid grid-cols-3 gap-1">
              {matW.flat().map((v, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: cellDelay(i, 1.7), duration: 0.3, ease: 'backOut' }}
                  className="w-8 h-8 sm:w-11 sm:h-11 bg-accent-amber/15 border border-accent-amber/30 rounded-md flex items-center justify-center text-accent-amber text-sm font-mono font-medium"
                >{v}</motion.div>
              ))}
            </div>
          </div>

          <motion.span initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 2.3, duration: 0.3 }}
            className="text-text-muted text-3xl font-light">=</motion.span>

          <div className="text-center">
            <p className="text-text-muted text-xs mb-2 font-mono tracking-wider">Output (C)</p>
            <div className="grid grid-cols-3 gap-1">
              {matC.flat().map((v, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: cellDelay(i, 2.4), duration: 0.3, ease: 'backOut' }}
                  className="w-8 h-8 sm:w-11 sm:h-11 bg-data-green/15 border border-data-green/30 rounded-md flex items-center justify-center text-data-green text-sm font-mono font-medium"
                >{v}</motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 3.0, duration: 0.8 }}
          className="text-text-muted text-base max-w-2xl mx-auto mb-8"
        >
          {(() => {
            const desc = lt('matrix.desc');
            const [beforeGEMM, ...afterGEMM] = desc.split('GEMM');
            const postGEMM = afterGEMM.join('GEMM');
            const [beforeMAC, ...afterMAC] = postGEMM.split('MAC');
            const postMAC = afterMAC.join('MAC');
            if (!beforeGEMM && afterGEMM.length === 0) {
              return <>{desc}</>;
            }
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

        {/* "Billions of times" */}
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

        {/* Tile pattern */}
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
                    ...(waveActive ? { animation: `tileWave 2.5s ease-in-out ${waveDelay}s infinite` } : {}),
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

/* ── Section 4: CPU / GPU / Accelerator Comparison — Scroll-Driven Race ── */

function CompareSection() {
  const t = useTranslations('intro')
  const lt = useLevelText('intro')
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll-driven race
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  const [scrollProg, setScrollProg] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => {
    const q = Math.round(v * 40) / 40
    setScrollProg(prev => prev === q ? prev : q)
  })

  // Race progress: staggered — ACC finishes first, CPU last
  const raceProgress = Math.min(Math.max((scrollProg - 0.1) / 0.55, 0), 1)
  const accProgress = Math.min(raceProgress * 3, 1)       // finishes at 33%
  const gpuProgress = Math.min(raceProgress * 1.5, 1)     // finishes at 67%
  const cpuProgress = Math.min(raceProgress, 1)            // finishes at 100%

  const allDone = cpuProgress >= 1
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    if (allDone && !revealed) {
      const timer = setTimeout(() => setRevealed(true), 400)
      return () => clearTimeout(timer)
    }
  }, [allDone, revealed])

  const processors = [
    {
      key: 'cpu', name: t('compare.cpu.name'), desc: t('compare.cpu.desc'),
      progress: cpuProgress, color: 'rgb(239,68,68)',
      icon: (
        <div className="w-12 h-12 border border-red-500/40 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 bg-red-500/30 rounded-sm" />
        </div>
      ),
    },
    {
      key: 'gpu', name: t('compare.gpu.name'), desc: t('compare.gpu.desc'),
      progress: gpuProgress, color: 'rgb(168,85,247)',
      icon: (
        <div className="w-12 h-12 border border-purple-500/40 rounded-lg grid grid-cols-3 grid-rows-3 gap-[2px] p-1">
          {Array(9).fill(0).map((_, i) => <div key={i} className="bg-purple-500/30 rounded-[1px]" />)}
        </div>
      ),
    },
    {
      key: 'acc',
      name: revealed ? t('compare.acc.revealName') : t('compare.acc.name'),
      desc: t('compare.acc.desc'),
      progress: accProgress, color: 'rgb(59,130,246)',
      icon: (
        <div className="w-12 h-12 border border-accent-blue/40 rounded-lg relative overflow-hidden">
          {revealed ? (
            <div className="grid grid-cols-4 grid-rows-4 gap-[1px] p-[3px] h-full">
              {Array(16).fill(0).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }} className="bg-accent-blue/40 rounded-[1px]" />
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
    <div ref={containerRef} className="hall-section relative" style={{ height: '220vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">
        <div className="relative z-10 max-w-4xl w-full">
          {/* Title */}
          <motion.h2
            animate={{ opacity: scrollProg > 0.02 ? 1 : 0, y: scrollProg > 0.02 ? 0 : 30 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold text-text-primary text-center mb-2 md:mb-4"
          >
            {t('compare.title')}
          </motion.h2>
          <motion.p
            animate={{ opacity: scrollProg > 0.05 ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="text-text-muted text-lg text-center mb-8"
          >
            {t('compare.subtitle')}
          </motion.p>

          {/* Race bars — scroll-driven */}
          <div className="space-y-4 md:space-y-6 mb-12 group/cards">
            {processors.map((proc, i) => (
              <motion.div
                key={proc.key}
                animate={{ opacity: scrollProg > 0.05 + i * 0.03 ? 1 : 0, x: scrollProg > 0.05 + i * 0.03 ? 0 : -30 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-4 md:gap-6 transition-opacity duration-300 group-hover/cards:opacity-30 hover:!opacity-100"
              >
                {proc.icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="font-semibold text-text-primary text-lg">{proc.name}</span>
                    <span className="text-text-muted text-sm hidden md:inline">{proc.desc}</span>
                  </div>
                  <div className="h-3 bg-surface1 rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${proc.progress * 100}%`,
                        backgroundColor: proc.color,
                        boxShadow: proc.progress >= 1 ? `0 0 12px ${proc.color}` : 'none',
                        transition: 'width 0.15s linear, box-shadow 0.3s ease',
                      }}
                    />
                  </div>
                </div>
                <div className="w-8 text-center">
                  {proc.progress >= 1 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="text-lg" style={{ color: proc.color }}>✓</motion.span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Reveal: Systolic Array */}
          <motion.div
            animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 30 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-blue mb-3">
              {t('compare.reveal')}
            </h3>
            <p className="text-text-muted text-base mb-6 max-w-lg mx-auto">
              {lt('compare.revealDesc')}
            </p>

            <motion.div
              animate={{ opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0.8 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-grid grid-cols-8 gap-1 mb-8"
            >
              {Array.from({ length: 64 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={revealed ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.01, duration: 0.2 }}
                  className="w-5 h-5 md:w-6 md:h-6 rounded-sm bg-accent-blue/20 border border-accent-blue/30"
                  style={{ boxShadow: `0 0 ${4 + Math.random() * 4}px rgba(59,130,246,${0.1 + Math.random() * 0.2})` }}
                />
              ))}
            </motion.div>

            <motion.div
              animate={{ opacity: revealed ? 1 : 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <p className="text-text-muted text-sm mb-4 md:mb-6">{t('compare.cta')}</p>
              <NextHallButton currentHall="intro" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

/* ── Main IntroHall ── */

export default function IntroHall() {
  const t = useTranslations('intro')
  const lt = useLevelText('intro')

  return (
    <div className="bg-background relative">
      <HallBackground hall="intro" />
      {/* Section 1: Hero */}
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
              {lt('hero.subtitle1')}
              <br />
              {lt('hero.subtitle2')}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ScrollGuide />
        </div>
      </section>

      {/* Section 2: Explosion Dashboard — Scroll-Driven */}
      <ExplosionSection />

      {/* Section 3: Matrix Keynote Reveal */}
      <MatrixRevealSection />

      {/* Section 4: CPU/GPU/Accelerator Comparison — Scroll-Driven Race */}
      <CompareSection />
    </div>
  )
}
