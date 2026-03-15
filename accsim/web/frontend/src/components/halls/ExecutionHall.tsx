// HALL 5
'use client'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import NextHallButton from '@/components/ui/NextHallButton'
import Term from '@/components/ui/Term'
import { useLevelText } from '@/hooks/useLevelText'
import { useKnowledgeLevel } from '@/stores/useKnowledgeLevel'
import HallBackground from '@/components/ui/HallBackground'
import InfoPanel from '@/components/ui/InfoPanel'
import ScrollGuide from '@/components/ui/ScrollGuide'

type Mode = 'high' | 'tech'

const STAGES = [
  { key: 'wihGates', opcode: 'MATMUL',      cycles: 4000, color: '#3B82F6', group: 0 },
  { key: 'whhGates', opcode: 'MATMUL',      cycles: 4000, color: '#6366F1', group: 0 },
  { key: 'elemAdd',  opcode: 'ELEM_ADD',    cycles: 200,  color: '#8B5CF6', group: 0 },
  { key: 'sigmoid',  opcode: 'ACT_SIGMOID', cycles: 260,  color: '#F59E0B', group: 1 },
  { key: 'tanh',     opcode: 'ACT_TANH',    cycles: 260,  color: '#F97316', group: 1 },
  { key: 'elemMul',  opcode: 'ELEM_MUL',    cycles: 200,  color: '#10B981', group: 2 },
  { key: 'cell',     opcode: 'ACT_TANH',    cycles: 260,  color: '#06B6D4', group: 2 },
  { key: 'hidden',   opcode: 'ELEM_MUL',    cycles: 200,  color: '#0EA5E9', group: 2 },
]

const TOTAL = STAGES.reduce((s, st) => s + st.cycles, 0)
const LAYOUT = (() => {
  let cum = 0
  return STAGES.map(st => {
    const startPct = cum / TOTAL * 100
    cum += st.cycles
    return { ...st, startPct, widthPct: st.cycles / TOTAL * 100 }
  })
})()

const GROUPS = ['Gate Computation', 'Activation', 'State Update']

const GATES = [
  { name: 'i', label: 'input', color: '#3B82F6' },
  { name: 'f', label: 'forget', color: '#6366F1' },
  { name: 'g', label: 'cell', color: '#F97316' },
  { name: 'o', label: 'output', color: '#10B981' },
]

const STEP_STAGES: { indices: number[]; color: string }[] = [
  { indices: [],              color: '#8B5CF6' },  // Step 1: 데이터 로드
  { indices: [0, 1, 2],       color: '#3B82F6' },  // Step 2: MATMUL
  { indices: [3, 4, 5, 6, 7], color: '#F59E0B' },  // Step 3: 활성화+상태
  { indices: [],              color: '#06B6D4' },  // Step 4: 반복
]

export default function ExecutionHall() {
  const t = useTranslations('execution')
  const lt = useLevelText('execution')
  const { level } = useKnowledgeLevel()
  const [mode, setMode] = useState<Mode>('high')
  // Expert: 기본 기술 상세 모드
  useEffect(() => {
    if (level === 'expert') setMode('tech')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [activeIdx, setActiveIdx] = useState(0)
  const [hoverIdx, setHoverIdx] = useState(-1)
  const gateContainerRef = useRef<HTMLDivElement>(null)

  // Scroll-driven Gate intro
  const { scrollYProgress: gateScroll } = useScroll({
    target: gateContainerRef,
    offset: ['start start', 'end end'],
  })
  const [gateProgress, setGateProgress] = useState(0)
  useMotionValueEvent(gateScroll, 'change', v => {
    const q = Math.round(v * 20) / 20
    setGateProgress(prev => prev === q ? prev : q)
  })

  const highlightIdx = hoverIdx >= 0 ? hoverIdx : activeIdx

  const playheadPct = activeIdx < 0 ? 0
    : LAYOUT[activeIdx].startPct + LAYOUT[activeIdx].widthPct / 2

  return (
    <div className="bg-background min-h-screen relative">
      <HallBackground hall="execution" />

      {/* ── Section A: 도입 — Scroll-Driven Gate Reveal ── */}
      <div ref={gateContainerRef} className="hall-section relative z-10" style={{ height: '200vh' }}>
        <div className="sticky top-0 h-screen flex items-center justify-center px-6 overflow-hidden">
          <div className="max-w-5xl w-full text-center">
            {/* Header — always visible */}
            <motion.div
              animate={{ opacity: gateProgress < 0.05 ? 1 : Math.max(0.4, 1 - gateProgress * 0.8) }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-0.5 h-6 rounded-full" style={{ backgroundColor: '#6366F1' }} />
                <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 5 — Execution</p>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
                {t('sectionA.heading')}
              </h1>
              <p className="text-text-muted text-xl max-w-2xl mx-auto mb-12">
                {lt('sectionA.subtext')}
              </p>
            </motion.div>

            {/* Gate boxes — scroll-driven sequential reveal */}
            <InfoPanel variant="highlight" className="max-w-lg mx-auto mb-8">
              <div className="flex justify-center gap-3 sm:gap-6">
                {GATES.map((gate, i) => {
                  const threshold = 0.15 + i * 0.15
                  const isVisible = gateProgress > threshold
                  const isCurrent = gateProgress > threshold && (i === GATES.length - 1 || gateProgress <= threshold + 0.15)
                  return (
                    <motion.div
                      key={gate.name}
                      animate={{
                        opacity: isVisible ? 1 : 0.1,
                        scale: isCurrent ? 1.1 : isVisible ? 1 : 0.8,
                        y: isVisible ? 0 : 20,
                      }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-3xl font-mono font-bold border transition-shadow duration-300"
                        style={{
                          borderColor: isVisible ? gate.color + '60' : gate.color + '20',
                          backgroundColor: isVisible ? gate.color + '15' : 'transparent',
                          color: gate.color,
                          boxShadow: isCurrent ? `0 0 20px ${gate.color}40` : 'none',
                        }}
                      >
                        {gate.name}
                      </div>
                      <span className="text-text-muted text-sm" style={{ opacity: isVisible ? 1 : 0.3 }}>{gate.label}</span>
                    </motion.div>
                  )
                })}
              </div>
            </InfoPanel>

            {/* Transition text — all gates visible */}
            <motion.p
              animate={{ opacity: gateProgress > 0.8 ? 1 : 0, y: gateProgress > 0.8 ? 0 : 10 }}
              transition={{ duration: 0.4 }}
              className="text-text-muted text-lg"
            >
              {t('sectionA.transition')}
            </motion.p>

            <div className="mt-4">
              <ScrollGuide hideAfterIndex={0} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section B: Score + Gantt ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-6xl w-full">
          {/* Controls row */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex bg-surface1 border border-border rounded-full p-1">
              {(['high', 'tech'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-5 py-2 rounded-full text-sm transition-all ${
                    mode === m ? 'bg-accent-blue text-white' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {m === 'high' ? t('toggleHigh') : t('toggleTech')}
                </button>
              ))}
            </div>
          </div>

          {/* Score timeline */}
          <div className="bg-surface1 border border-border rounded-2xl p-3 sm:p-6 mb-6">
            <p className="text-base text-text-muted font-mono mb-6 text-center">
              <Term id="LSTM">LSTM</Term> Single Step — {TOTAL.toLocaleString()} cycles
            </p>

            {/* Group labels */}
            <div className="flex gap-0.5 mb-2">
              {LAYOUT.map((stage, i) => {
                const isGroupStart = i === 0 || stage.group !== LAYOUT[i - 1].group
                if (!isGroupStart) return <div key={i} style={{ flex: stage.widthPct }} />
                const groupWidth = LAYOUT.filter(s => s.group === stage.group).reduce((s, st) => s + st.widthPct, 0)
                return (
                  <div key={i} style={{ flex: groupWidth }} className="overflow-hidden">
                    <p className="text-xs text-text-muted truncate">{GROUPS[stage.group]}</p>
                  </div>
                )
              })}
            </div>

            {/* Timeline with playhead */}
            <div className="relative">
              <div className="flex gap-0.5">
                {LAYOUT.map((stage, i) => {
                  const isHighlight = highlightIdx === i
                  const isPast = highlightIdx > i && activeIdx >= 0
                  return (
                    <motion.div
                      key={stage.key}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className="h-14 rounded relative group cursor-pointer"
                      style={{
                        flex: stage.widthPct,
                        backgroundColor: isHighlight ? stage.color + 'D0' : isPast ? stage.color + '90' : stage.color + '40',
                        transformOrigin: 'left',
                        boxShadow: isHighlight ? `0 0 12px ${stage.color}50` : 'none',
                        opacity: hoverIdx >= 0 && !isHighlight ? 0.3 : 1,
                        transition: 'background-color 0.2s, box-shadow 0.2s, opacity 0.2s',
                      }}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(-1)}
                      onClick={() => setActiveIdx(i)}
                      animate={isHighlight ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                        {stage.widthPct > 5 && (
                          <span className="text-xs font-mono truncate px-1 text-white/80">
                            {mode === 'tech' ? stage.opcode : ''}
                          </span>
                        )}
                      </div>
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-surface-tooltip border border-border-tooltip rounded px-3 py-1.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg pointer-events-none">
                        {t(`pipeline.${stage.key}` as any)}
                        {mode === 'tech' && ` (${stage.opcode})`}
                        {' — '}{stage.cycles.toLocaleString()} cycles
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Playhead */}
              {activeIdx >= 0 && (
                <motion.div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/70 pointer-events-none z-10"
                  animate={{ left: `${playheadPct}%` }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="w-2.5 h-2.5 bg-white rounded-full absolute -top-1 -translate-x-1" />
                </motion.div>
              )}
            </div>

            {/* Opcode labels below */}
            {mode === 'tech' && (
              <div className="flex gap-0.5 mt-1">
                {LAYOUT.map(stage => (
                  <div key={stage.key} style={{ flex: stage.widthPct }} className="overflow-hidden">
                    <p className="text-xs font-mono truncate" style={{ color: stage.color }}>{stage.opcode}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Active stage detail */}
            <AnimatePresence mode="wait">
              {highlightIdx >= 0 && (
                <motion.div
                  key={highlightIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 p-4 rounded-xl text-center"
                  style={{
                    backgroundColor: LAYOUT[highlightIdx].color + '12',
                    border: `1px solid ${LAYOUT[highlightIdx].color}25`,
                  }}
                >
                  <p className="font-semibold text-base" style={{ color: LAYOUT[highlightIdx].color }}>
                    {t(`pipeline.${LAYOUT[highlightIdx].key}` as any)}
                  </p>
                  <p className="text-sm text-text-muted font-mono mt-1">
                    {mode === 'tech' ? `${LAYOUT[highlightIdx].opcode} — ` : ''}
                    {LAYOUT[highlightIdx].cycles.toLocaleString()} cycles
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* High-level mode: 4-step explanation */}
          {mode === 'high' && (
            <ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[1, 2, 3, 4].map(n => {
                  const step = STEP_STAGES[n - 1]
                  return (
                    <div
                      key={n}
                      className="bg-surface1/40 border border-border/40 rounded-xl p-6 border-l-4"
                      style={{ borderLeftColor: step.color }}
                    >
                      <p className="text-base font-medium text-text-primary mb-1">Step {n}</p>
                      <p className="text-sm text-text-muted leading-relaxed mb-3">
                        {lt(`highLevel.step${n}`)}
                      </p>
                      {step.indices.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {step.indices.map(idx => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: STAGES[idx].color + '20',
                                color: STAGES[idx].color,
                              }}
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: STAGES[idx].color }}
                              />
                              {STAGES[idx].opcode}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollReveal>
          )}

          {/* Tech mode: code block */}
          {mode === 'tech' && (
            <ScrollReveal>
              <div className="bg-surface2 border border-border rounded-xl p-6 font-mono text-sm mb-8">
                <p className="text-accent-amber mb-3">// LSTM Gate Operations (PyTorch order: i, f, g, o)</p>
                <p className="text-text-muted">gates = W_ih @ x_t + W_hh @ h_t + bias</p>
                <p className="text-text-muted">i, f, g, o = gates.split(hidden_size)</p>
                <p className="text-text-muted">i, f, o = <Term id="sigmoid">sigmoid</Term>(i), sigmoid(f), sigmoid(o)</p>
                <p className="text-text-muted">g = <Term id="tanh">tanh</Term>(g)</p>
                <p className="text-data-green">c_t = f ⊙ c_prev + i ⊙ g</p>
                <p className="text-data-green">h_t = o ⊙ tanh(c_t)</p>
              </div>
            </ScrollReveal>
          )}

          <NextHallButton currentHall="execution" />
        </div>
      </section>
    </div>
  )
}
