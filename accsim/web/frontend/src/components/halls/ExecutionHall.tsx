'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import NextHallButton from '@/components/ui/NextHallButton'
import Term from '@/components/ui/Term'
import { useLevelText } from '@/hooks/useLevelText'

type Mode = 'high' | 'tech'

const PIPELINE_STAGES = [
  { key: 'wihGates', opcode: 'MATMUL', cycles: 4000, color: '#3B82F6', width: 38 },
  { key: 'whhGates', opcode: 'MATMUL', cycles: 4000, color: '#6366F1', width: 38 },
  { key: 'elemAdd', opcode: 'ELEM_ADD', cycles: 200, color: '#8B5CF6', width: 4 },
  { key: 'sigmoid', opcode: 'ACT_SIGMOID', cycles: 260, color: '#F59E0B', width: 6 },
  { key: 'tanh', opcode: 'ACT_TANH', cycles: 260, color: '#F97316', width: 6 },
  { key: 'elemMul', opcode: 'ELEM_MUL', cycles: 200, color: '#10B981', width: 4 },
  { key: 'cell', opcode: 'ACT_TANH', cycles: 260, color: '#06B6D4', width: 6 },
  { key: 'hidden', opcode: 'ELEM_MUL', cycles: 200, color: '#0EA5E9', width: 4 },
]

function GanttChart({ stages, mode }: { stages: typeof PIPELINE_STAGES; mode: Mode }) {
  const totalCycles = stages.reduce((s, st) => s + st.cycles, 0)
  return (
    <div className="bg-surface1 border border-border rounded-xl p-6">
      <p className="text-text-muted text-sm mb-4 font-mono">Timeline ({totalCycles.toLocaleString()} cycles)</p>
      <div className="flex gap-0.5">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.key}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{
              flex: stage.width,
              backgroundColor: stage.color,
              transformOrigin: 'left',
            }}
            className="h-10 rounded relative group cursor-default"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 rounded" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface2 border border-border rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {mode === 'tech' ? stage.opcode + ' ' : ''}
              {stage.cycles.toLocaleString()} cycles
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-0.5 mt-1">
        {stages.map((stage) => (
          <div key={stage.key} style={{ flex: stage.width }} className="overflow-hidden">
            {mode === 'tech' && (
              <p className="text-xs font-mono truncate" style={{ color: stage.color }}>
                {stage.opcode}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function BlockDiagram({ stages, mode, t }: { stages: typeof PIPELINE_STAGES; mode: Mode; t: any }) {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-center">
      {stages.map((stage, i) => (
        <div key={stage.key} className="flex items-center gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="border rounded-lg px-4 py-3 text-center min-w-[100px]"
            style={{ borderColor: stage.color + '60', backgroundColor: stage.color + '15' }}
          >
            <p className="text-xs font-semibold" style={{ color: stage.color }}>
              {t(`pipeline.${stage.key}`)}
            </p>
            {mode === 'tech' && (
              <p className="text-xs font-mono text-text-muted mt-0.5">{stage.opcode}</p>
            )}
          </motion.div>
          {i < stages.length - 1 && (
            <span className="text-text-muted text-sm">→</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ExecutionHall() {
  const t = useTranslations('execution')
  const lt = useLevelText('execution')
  const [mode, setMode] = useState<Mode>('high')

  return (
    <div className="bg-background min-h-screen">
      <section className="hall-section flex items-center justify-center px-6">
        <div className="max-w-5xl w-full">
          <ScrollReveal>
            <p className="text-text-muted text-sm font-mono tracking-widest uppercase mb-4 text-center">Hall 5 — Execution</p>
            <h1 className="text-5xl font-bold text-text-primary text-center mb-4">{t('title')}</h1>
            <p className="text-text-muted text-xl text-center max-w-2xl mx-auto mb-8">{lt('subtitle')}</p>
          </ScrollReveal>

          <div className="flex justify-center mb-10">
            <div className="flex bg-surface1 border border-border rounded-full p-1">
              {(['high', 'tech'] as Mode[]).map((m) => (
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

          <ScrollReveal>
            <div className="bg-surface1 border border-border rounded-2xl p-8 mb-8">
              <h3 className="text-sm text-text-muted font-mono mb-6 text-center">
                <Term id="LSTM">LSTM</Term> Single Step Execution
              </h3>
              <BlockDiagram stages={PIPELINE_STAGES} mode={mode} t={t} />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <GanttChart stages={PIPELINE_STAGES} mode={mode} />
          </ScrollReveal>

          {mode === 'tech' && (
            <ScrollReveal delay={0.3}>
              <div className="mt-8 bg-surface2 border border-border rounded-xl p-6 font-mono text-sm">
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
