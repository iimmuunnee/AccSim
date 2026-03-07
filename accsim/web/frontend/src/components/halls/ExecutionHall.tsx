// HALL 5
'use client'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import NextHallButton from '@/components/ui/NextHallButton'
import Term from '@/components/ui/Term'
import { useLevelText } from '@/hooks/useLevelText'
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

export default function ExecutionHall() {
  const t = useTranslations('execution')
  const lt = useLevelText('execution')
  const [mode, setMode] = useState<Mode>('high')
  const [activeIdx, setActiveIdx] = useState(-1)
  const [hoverIdx, setHoverIdx] = useState(-1)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Scroll-driven playhead
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start end', 'end start'],
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    // Map scroll progress to stage index
    // Visible range: roughly 0.2 ~ 0.8 of the scroll range
    const mapped = Math.min(Math.max((v - 0.15) / 0.55, 0), 1)
    const idx = Math.floor(mapped * STAGES.length)
    const newIdx = idx >= STAGES.length ? STAGES.length - 1 : idx === 0 && mapped === 0 ? -1 : idx
    setActiveIdx(prev => prev === newIdx ? prev : newIdx)
  })

  const highlightIdx = hoverIdx >= 0 ? hoverIdx : activeIdx

  // Cumulative cycle count for playhead position
  const playheadPct = activeIdx < 0 ? 0
    : LAYOUT[activeIdx].startPct + LAYOUT[activeIdx].widthPct / 2

  return (
    <div className="bg-background min-h-screen relative">
      <HallBackground variant="gradient" />

      {/* ── Section A: 도입 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-5xl w-full text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 rounded-full" style={{ backgroundColor: '#6366F1' }} />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 5 — Execution</p>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
              {t('sectionA.heading')}
            </h1>
            <p className="text-text-muted text-xl max-w-2xl mx-auto mb-12">
              {t('sectionA.subtext')}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <InfoPanel variant="highlight" className="max-w-lg mx-auto mb-8">
              <div className="flex justify-center gap-3 sm:gap-6">
                {GATES.map((gate, i) => (
                  <motion.div
                    key={gate.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl font-mono font-bold border"
                      style={{ borderColor: gate.color + '40', backgroundColor: gate.color + '15', color: gate.color }}
                    >
                      {gate.name}
                    </div>
                    <span className="text-text-muted text-xs">{gate.label}</span>
                  </motion.div>
                ))}
              </div>
            </InfoPanel>
          </ScrollReveal>
          <div className="mt-4">
            <ScrollGuide hideAfterIndex={0} />
          </div>
        </div>
      </section>

      {/* ── Section B: Score + Gantt ── */}
      <section ref={timelineRef} className="hall-section hall-section-alt flex items-center justify-center px-6 relative z-10">
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
            <p className="text-sm text-text-muted font-mono mb-6 text-center">
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
                    <p className="text-[10px] text-text-muted truncate">{GROUPS[stage.group]}</p>
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
                      animate={isHighlight ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                        {stage.widthPct > 5 && (
                          <span className="text-[10px] font-mono truncate px-1 text-white/80">
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
                    <p className="text-[10px] font-mono truncate" style={{ color: stage.color }}>{stage.opcode}</p>
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
                  <p className="font-semibold text-sm" style={{ color: LAYOUT[highlightIdx].color }}>
                    {t(`pipeline.${LAYOUT[highlightIdx].key}` as any)}
                  </p>
                  <p className="text-xs text-text-muted font-mono mt-1">
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
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-surface1/40 border border-border/40 rounded-xl p-5">
                    <p className="text-sm font-medium text-text-primary mb-1">Step {n}</p>
                    <p className="text-xs text-text-muted leading-relaxed">{t(`highLevel.step${n}` as any)}</p>
                  </div>
                ))}
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
