// HALL 3 — Scroll-Driven Scene Transition
'use client'
import { useTranslations } from 'next-intl'
import { useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import NextHallButton from '@/components/ui/NextHallButton'
import Term from '@/components/ui/Term'
import DeepDiveToggle from '@/components/layout/DeepDiveToggle'
import { useLevelText } from '@/hooks/useLevelText'
import HallBackground from '@/components/ui/HallBackground'
import InfoPanel from '@/components/ui/InfoPanel'
import ScrollGuide from '@/components/ui/ScrollGuide'

const SystolicScene = dynamic(
  () => import('@/components/three/SystolicScene').then(m => ({ default: m.SystolicScene })),
  { ssr: false, loading: () => <div className="h-[18.75rem] sm:h-[25rem] md:h-[30rem] bg-surface1 rounded-xl animate-pulse" /> }
)

const ARRAY_SIZES = [4, 8, 16]

function makeUtilization(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      const diag = 1 - Math.abs(i - j) / n
      return Math.max(0.1, diag * 0.9 + Math.random() * 0.1)
    })
  )
}

/* ─── PE Anatomy — scroll-driven assembly inside sticky viewport ─── */
function PEAssembly({ progress }: { progress: number }) {
  const showBox = progress > 0.05
  const showActivation = progress > 0.15
  const showRight = progress > 0.25
  const showPsumIn = progress > 0.35
  const showPsumOut = progress > 0.50
  const showFormula = progress > 0.65

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Activation input (left) */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-4 flex items-center gap-2"
        animate={{ opacity: showActivation ? 1 : 0, x: showActivation ? 0 : -20 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-sm text-cyan-400 font-mono">activation</span>
        <div className="w-10 h-0.5 bg-cyan-400" />
        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-cyan-400" />
      </motion.div>

      {/* Psum input (top) */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-4 flex flex-col items-center gap-1.5"
        animate={{ opacity: showPsumIn ? 1 : 0, y: showPsumIn ? 0 : -20 }}
        transition={{ duration: 0.4 }}
      >
        <span className="text-sm text-amber-400 font-mono">psum_in</span>
        <div className="h-8 w-0.5 bg-amber-400" />
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-amber-400" />
      </motion.div>

      {/* PE box */}
      <motion.div
        className="relative w-48 h-48 sm:w-60 sm:h-60 mx-auto rounded-2xl border-2 border-blue-500/50 bg-blue-500/10 flex flex-col items-center justify-center gap-4"
        animate={{ opacity: showBox ? 1 : 0, scale: showBox ? 1 : 0.8 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute top-3 left-4 text-xs font-mono text-blue-400/60">PE[i][j]</div>
        <div className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <span className="text-sm font-mono text-blue-400">weight (fixed)</span>
        </div>
        <motion.div
          className="text-sm font-mono text-text-muted text-center leading-relaxed"
          animate={{ opacity: showFormula ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-cyan-400">act</span>
          <span className="text-text-muted"> × </span>
          <span className="text-blue-400">w</span>
          <span className="text-text-muted"> + </span>
          <span className="text-amber-400">psum</span>
        </motion.div>
        <motion.div
          className="text-xs text-text-muted/60 font-mono"
          animate={{ opacity: showFormula ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          = psum_out
        </motion.div>
      </motion.div>

      {/* Psum output (bottom) */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-4 flex flex-col items-center gap-1.5"
        animate={{ opacity: showPsumOut ? 1 : 0, y: showPsumOut ? 0 : 20 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-amber-400" />
        <div className="h-8 w-0.5 bg-amber-400" />
        <span className="text-sm text-amber-400 font-mono">psum_out</span>
      </motion.div>

      {/* Activation passthrough (right) */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-4 flex items-center gap-2"
        animate={{ opacity: showRight ? 1 : 0, x: showRight ? 0 : 20 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-cyan-400" />
        <div className="w-10 h-0.5 bg-cyan-400" />
        <span className="text-sm text-cyan-400 font-mono">→ next PE</span>
      </motion.div>
    </div>
  )
}

/* ─── Scroll-driven data flow steps ─── */
function DataFlowSteps({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const t = useTranslations('chip')
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  })
  const [p, setP] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => {
    // Wider range: 0.1~0.9 of scroll → 0~1
    const mapped = Math.min(Math.max((v - 0.1) / 0.8, 0), 1)
    const q = Math.round(mapped * 20) / 20
    setP(prev => prev === q ? prev : q)
  })

  const steps = [
    { label: t('sectionD.step1.title'), desc: t('sectionD.step1.desc'), color: '#3B82F6', icon: '■' },
    { label: t('sectionD.step2.title'), desc: t('sectionD.step2.desc'), color: '#06B6D4', icon: '→' },
    { label: t('sectionD.step3.title'), desc: t('sectionD.step3.desc'), color: '#F59E0B', icon: '↓' },
  ]

  return (
    <div className="flex flex-col items-center space-y-8 max-w-3xl mx-auto">
      {steps.map((item, i) => {
        // Evenly spaced thresholds: 0, 0.3, 0.6 — all reachable
        const threshold = i * 0.3
        const isActive = p > threshold
        const isCurrent = isActive && (i === steps.length - 1 || p <= (i + 1) * 0.3)
        return (
          <motion.div
            key={i}
            animate={{ opacity: isActive ? 1 : 0.15, x: isActive ? 0 : 30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-5"
          >
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border transition-all duration-300"
                style={{
                  borderColor: isActive ? item.color + '80' : item.color + '20',
                  color: item.color,
                  boxShadow: isCurrent ? `0 0 12px ${item.color}40` : 'none',
                }}
              >
                {item.icon}
              </div>
              {i < 2 && <div className="w-px h-10 mt-1 transition-colors duration-300" style={{ backgroundColor: isActive ? item.color + '40' : '#3F3F4620' }} />}
            </div>
            <div className="pt-1">
              <h4 className="font-semibold text-base mb-1" style={{ color: item.color }}>{item.label}</h4>
              <p className="text-text-muted text-base leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default function ChipHall() {
  const t = useTranslations('chip')
  const lt = useLevelText('chip')
  const [arraySize, setArraySize] = useState(8)
  const [deepDive, setDeepDive] = useState(false)
  const utilization = useMemo(() => makeUtilization(arraySize), [arraySize])

  // Scroll-driven PE assembly: tall container + sticky viewport
  const peContainerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: peScroll } = useScroll({
    target: peContainerRef,
    offset: ['start start', 'end end'],
  })
  const [peProgress, setPeProgress] = useState(0)
  useMotionValueEvent(peScroll, 'change', v => {
    const q = Math.round(v * 40) / 40
    setPeProgress(prev => prev === q ? prev : q)
  })

  // Scene phases within sticky viewport
  // 0~0.7: PE assembly, 0.7~1.0: transition text (PE stays visible)
  const assemblyProgress = Math.min(peProgress / 0.7, 1)
  const showTransitionText = peProgress > 0.65

  // Data flow section ref
  const dataFlowRef = useRef<HTMLDivElement>(null)

  return (
    <div className="bg-background min-h-screen relative">
      <HallBackground hall="chip" />

      {/* ── Section A: 도입 — 칩 내부로 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 rounded-full" style={{ backgroundColor: '#06B6D4' }} />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 3 — Inside the Chip</p>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
              {t('sectionA.heading')}
            </h1>
            <p className="text-text-muted text-xl max-w-4xl mx-auto mb-4">
              {t('sectionA.subtext')}
            </p>
            <p className="text-text-muted text-sm opacity-60">
              {arraySize}×{arraySize} = {arraySize * arraySize} <Term id="PE">PEs</Term>
            </p>
          </ScrollReveal>
          <div className="mt-8">
            <ScrollGuide hideAfterIndex={0} />
          </div>
        </div>
      </section>

      {/* ── Section B: PE 해부도 — Scroll-Driven Sticky Assembly ── */}
      <div ref={peContainerRef} className="hall-section relative z-10" style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
          {/* Background alt for this section */}
          <div className="absolute inset-0 bg-[#0E0E11]" />
          <div className="relative z-10 max-w-4xl w-full">
            {/* Title — fades as PE builds */}
            <motion.div
              className="text-center mb-8"
              animate={{ opacity: peProgress < 0.05 ? 1 : peProgress < 0.15 ? 1 - (peProgress - 0.05) / 0.1 * 0.5 : 0.5 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-4">
                {t('sectionB.heading')}
              </h2>
              <InfoPanel variant="highlight" className="max-w-lg mx-auto">
                <p className="text-text-muted text-center">
                  {t('sectionB.subtext')}
                </p>
              </InfoPanel>
            </motion.div>

            {/* PE Diagram — scroll-driven assembly */}
            <motion.div className="py-8 md:py-12 px-4 sm:px-8">
              <PEAssembly progress={assemblyProgress} />
            </motion.div>

            {/* Formula — appears when assembly complete */}
            <motion.p
              className="text-center text-m text-text-muted font-mono mt-4"
              animate={{ opacity: assemblyProgress > 0.85 ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              psum_out = psum_in + weight × activation
            </motion.p>

            {/* Transition text — "이것이 모여서..." */}
            <motion.div
              className="mt-8 text-center"
              animate={{ opacity: showTransitionText ? 1 : 0, y: showTransitionText ? 0 : 20 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400/80">
                {t('sectionB.transition')}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Section C: 3D Systolic Array ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
              {t('title')}
            </h2>
            <p className="text-text-muted text-center max-w-2xl mx-auto mb-8 whitespace-pre-line">
              {lt('subtitle')}
            </p>
          </ScrollReveal>

          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6">
            <div className="flex items-center gap-2 bg-surface1 border border-border rounded-full px-4 py-2">
              <span className="text-text-muted text-sm">{t('arraySizeLabel')}:</span>
              {ARRAY_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setArraySize(size)}
                  className={`px-3 py-1 rounded-full text-sm font-mono transition-all ${
                    arraySize === size
                      ? 'bg-accent-blue text-white'
                      : 'text-text-muted hover:text-text-primary opacity-60 hover:opacity-100'
                  }`}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
            <DeepDiveToggle enabled={deepDive} onChange={setDeepDive} />
          </div>

          <ScrollReveal>
            <SystolicScene n={arraySize} utilization={utilization} showUtil={deepDive} />
            <p className="text-center text-text-muted text-xs mt-3 opacity-60">
              {t('interactionHint')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Section D: 데이터 흐름 해설 — Scroll-Driven Steps ── */}
      <section ref={dataFlowRef} className="hall-section hall-section-alt flex items-center justify-center px-6 relative z-10">
        <div className="max-w-5xl w-full">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
              <Term id="weightStationary">Weight-Stationary</Term> Data Flow
            </h2>
          </ScrollReveal>

          <DataFlowSteps containerRef={dataFlowRef} />

          {deepDive && (
            <ScrollReveal delay={0.3}>
              <div className="mt-10 bg-surface2 border border-border rounded-2xl p-6 font-mono text-sm max-w-2xl mx-auto">
                <p className="text-accent-amber mb-3">// Deep Dive: <Term id="PE">PE</Term> Computation</p>
                <p className="text-text-muted">C[row][col] = Σ A[row][k] × W[k][col]</p>
                <p className="text-text-muted mt-2">PE[i][j]: psum_in += activation[i] × weight[j]</p>
                <p className="text-data-green mt-2">Array {arraySize}×{arraySize} → {arraySize * arraySize} PEs in parallel</p>
              </div>
            </ScrollReveal>
          )}

          <NextHallButton currentHall="chip" />
        </div>
      </section>
    </div>
  )
}
