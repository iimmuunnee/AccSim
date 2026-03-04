'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import NextHallButton from '@/components/ui/NextHallButton'
import Term from '@/components/ui/Term'
import DeepDiveToggle from '@/components/layout/DeepDiveToggle'
import { useLevelText } from '@/hooks/useLevelText'

const SystolicScene = dynamic(
  () => import('@/components/three/SystolicScene').then(m => ({ default: m.SystolicScene })),
  { ssr: false, loading: () => <div className="h-[480px] bg-surface1 rounded-xl animate-pulse" /> }
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

/* ─── PE Anatomy diagram (CSS/SVG) ─── */
function PEDiagram() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Activation input (left) */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-3 flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <span className="text-xs text-cyan-400 font-mono">activation</span>
        <div className="w-8 h-0.5 bg-cyan-400" />
        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-cyan-400" />
      </motion.div>

      {/* Psum input (top) */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pb-3 flex flex-col items-center gap-1"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <span className="text-xs text-amber-400 font-mono">psum_in</span>
        <div className="h-6 w-0.5 bg-amber-400" />
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-amber-400" />
      </motion.div>

      {/* PE box */}
      <motion.div
        className="relative w-48 h-48 mx-auto rounded-2xl border-2 border-blue-500/50 bg-blue-500/10 flex flex-col items-center justify-center gap-3"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="absolute top-2 left-3 text-[10px] font-mono text-blue-400/60">PE[i][j]</div>
        {/* Weight badge */}
        <div className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <span className="text-xs font-mono text-blue-400">weight (fixed)</span>
        </div>
        {/* MAC formula */}
        <div className="text-xs font-mono text-text-muted text-center leading-relaxed">
          <span className="text-cyan-400">act</span>
          <span className="text-text-muted"> × </span>
          <span className="text-blue-400">w</span>
          <span className="text-text-muted"> + </span>
          <span className="text-amber-400">psum</span>
        </div>
        <div className="text-[10px] text-text-muted/60 font-mono">= psum_out</div>
      </motion.div>

      {/* Psum output (bottom) */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-3 flex flex-col items-center gap-1"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-amber-400" />
        <div className="h-6 w-0.5 bg-amber-400" />
        <span className="text-xs text-amber-400 font-mono">psum_out</span>
      </motion.div>

      {/* Activation passthrough (right) */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-3 flex items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-cyan-400" />
        <div className="w-8 h-0.5 bg-cyan-400" />
        <span className="text-xs text-cyan-400 font-mono">→ next PE</span>
      </motion.div>
    </div>
  )
}

export default function ChipHall() {
  const t = useTranslations('chip')
  const lt = useLevelText('chip')
  const [arraySize, setArraySize] = useState(8)
  const [deepDive, setDeepDive] = useState(false)
  const utilization = makeUtilization(arraySize)

  return (
    <div className="bg-background min-h-screen relative">
      {/* Wafer grid background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `linear-gradient(rgba(63,63,70,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(63,63,70,0.04) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />

      {/* ── Section A: 도입 — 칩 내부로 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 rounded-full" style={{ backgroundColor: '#06B6D4' }} />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 3 — Inside the Chip</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
              {t('sectionA.heading')}
            </h1>
            <p className="text-text-muted text-xl max-w-2xl mx-auto mb-4">
              {t('sectionA.subtext')}
            </p>
            <p className="text-text-muted text-sm opacity-60">
              {arraySize}×{arraySize} = {arraySize * arraySize} <Term id="PE">PEs</Term>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Section B: PE 해부도 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
              {t('sectionB.heading')}
            </h2>
            <p className="text-text-muted text-center mb-16 max-w-lg mx-auto">
              {t('sectionB.subtext')}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="py-16 px-8">
              <PEDiagram />
            </div>
            <p className="text-center text-xs text-text-muted font-mono mt-4">
              psum_out = psum_in + weight × activation
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Section C: 3D Systolic Array ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-6xl w-full">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
              {t('title')}
            </h2>
            <p className="text-text-muted text-center max-w-2xl mx-auto mb-8 whitespace-pre-line">
              {lt('subtitle')}
            </p>
          </ScrollReveal>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 bg-surface1 border border-border rounded-full px-4 py-2">
              <span className="text-text-muted text-sm">{t('arraySizeLabel')}:</span>
              {ARRAY_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setArraySize(size)}
                  className={`px-3 py-1 rounded-full text-sm font-mono transition-all ${
                    arraySize === size
                      ? 'bg-accent-blue text-white'
                      : 'text-text-muted hover:text-text-primary'
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

      {/* ── Section D: 데이터 흐름 해설 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-5xl w-full">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
              <Term id="weightStationary">Weight-Stationary</Term> Data Flow
            </h2>
          </ScrollReveal>

          <div className="space-y-6 max-w-2xl mx-auto">
            {[
              { step: '1', label: t('sectionD.step1.title'), desc: t('sectionD.step1.desc'), color: '#3B82F6', icon: '■' },
              { step: '2', label: t('sectionD.step2.title'), desc: t('sectionD.step2.desc'), color: '#06B6D4', icon: '→' },
              { step: '3', label: t('sectionD.step3.title'), desc: t('sectionD.step3.desc'), color: '#F59E0B', icon: '↓' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border"
                      style={{ borderColor: item.color + '40', color: item.color }}>
                      {item.icon}
                    </div>
                    {i < 2 && <div className="w-px h-8 bg-border/40 mt-1" />}
                  </div>
                  <div className="pt-1">
                    <h4 className="font-semibold text-sm mb-1" style={{ color: item.color }}>{item.label}</h4>
                    <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

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
