'use client'
import { useTranslations } from 'next-intl'
import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import NextHallButton from '@/components/ui/NextHallButton'
import Term from '@/components/ui/Term'
import { useLevelText } from '@/hooks/useLevelText'

const STATIONS = [
  { key: 'model',    color: '#8B5CF6', icon: '📦', input: 'LSTM params',   output: 'Weight matrices' },
  { key: 'compiler', color: '#3B82F6', icon: '⚙',  input: 'Weight matrices', output: 'ISA instructions' },
  { key: 'simulator',color: '#F59E0B', icon: '🔬', input: 'Instructions',  output: 'Execution log' },
  { key: 'analysis', color: '#10B981', icon: '📊', input: 'Execution log', output: 'Metrics' },
]

const CODE_BLOCKS = [
  `compiler = LSTMCompiler(config)\ninstructions = compiler.compile(model)\n# → [LOAD_WEIGHT, MATMUL, ...]`,
  `controller.load_program(instructions)\ncontroller.run()\n# → cycle-accurate execution`,
  `metrics = compute_metrics(trace)\n# utilization: 73.4%\n# total_cycles: 12,480`,
]

/* ─── Conveyor data packet ─── */
function DataPacket({ active, color }: { active: boolean; color: string }) {
  return (
    <motion.div
      className="w-4 h-4 rounded-sm"
      style={{ backgroundColor: active ? color : 'transparent', border: active ? `1px solid ${color}80` : 'none' }}
      animate={active ? { opacity: [0.5, 1, 0.5] } : { opacity: 0 }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  )
}

/* ─── Station card ─── */
function StationCard({ station, idx, activeStation, t }: {
  station: typeof STATIONS[0]; idx: number; activeStation: number; t: any
}) {
  const isActive = activeStation === idx
  const isPast = activeStation > idx

  return (
    <motion.div
      className="flex flex-col items-center text-center"
      animate={isActive ? { scale: 1.03 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-3 border-2 transition-all duration-300"
        style={{
          borderColor: (isActive || isPast) ? station.color : station.color + '30',
          backgroundColor: isActive ? station.color + '20' : 'rgba(24,24,27,0.6)',
          boxShadow: isActive ? `0 0 20px ${station.color}30` : 'none',
        }}
      >
        {station.icon}
      </div>
      <h4 className="font-semibold text-sm mb-1" style={{ color: (isActive || isPast) ? station.color : '#A1A1AA' }}>
        {t(`stations.${station.key}.name` as any)}
      </h4>
      <p className="text-[10px] text-text-muted max-w-[120px]">
        {t(`stations.${station.key}.desc` as any)}
      </p>
    </motion.div>
  )
}

export default function SimulatorHall() {
  const t = useTranslations('simulator')
  const lt = useLevelText('simulator')
  const [activeStation, setActiveStation] = useState(-1)
  const conveyorRef = useRef<HTMLDivElement>(null)
  const conveyorInView = useInView(conveyorRef, { once: true, margin: '-20%' })

  // Auto-play conveyor animation
  useEffect(() => {
    if (!conveyorInView) return
    setActiveStation(0)
    let s = 0
    const iv = setInterval(() => {
      if (++s >= STATIONS.length) { clearInterval(iv); return }
      setActiveStation(s)
    }, 1500)
    return () => clearInterval(iv)
  }, [conveyorInView])

  return (
    <div className="bg-background min-h-screen relative">
      {/* Hatch pattern background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg, transparent, transparent 23px,
          rgba(63,63,70,0.03) 23px, rgba(63,63,70,0.03) 24px
        )`,
      }} />

      {/* ── Section A: 도입 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 bg-accent-blue rounded-full" />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 4 — Simulator</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
              {t('sectionA.heading')}
            </h1>
            <p className="text-text-muted text-xl max-w-2xl mx-auto mb-16">
              {t('sectionA.subtext')}
            </p>
          </ScrollReveal>

          {/* 3 reason cards — vertical timeline style */}
          <ScrollReveal delay={0.2}>
            <div className="flex flex-col items-center gap-6">
              {['reason1', 'reason2', 'reason3'].map((key, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="flex items-center gap-4 max-w-md w-full"
                >
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue font-mono text-sm font-bold">
                      {i + 1}
                    </div>
                    {i < 2 && <div className="w-px h-6 bg-border/50 mt-1" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-text-primary">{t(`sectionA.${key}.title` as any)}</p>
                    <p className="text-xs text-text-muted">{t(`sectionA.${key}.desc` as any)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Section B: 컨베이어 벨트 파이프라인 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-6xl w-full">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
              {t('sectionB.heading')}
            </h2>
            <p className="text-text-muted text-center mb-14 max-w-lg mx-auto">
              {t('sectionB.subtext')}
            </p>
          </ScrollReveal>

          {/* Conveyor belt */}
          <div ref={conveyorRef} className="relative">
            {/* Stations row */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {STATIONS.map((station, i) => (
                <ScrollReveal key={station.key} delay={i * 0.1}>
                  <StationCard station={station} idx={i} activeStation={activeStation} t={t} />
                </ScrollReveal>
              ))}
            </div>

            {/* Conveyor belt line with packets */}
            <div className="relative h-8 mx-10">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-surface2/50 rounded-full" />
              {/* Dashed conveyor line */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 border-t border-dashed border-border/40" />
              {/* Progress bar */}
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent-blue/40 rounded-full"
                animate={{ width: activeStation < 0 ? '0%' : `${((activeStation + 1) / STATIONS.length) * 100}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Arrow markers */}
              {[0, 1, 2].map(i => (
                <div key={i}
                  className="absolute top-1/2 -translate-y-1/2 text-text-muted/30 text-xs"
                  style={{ left: `${(i + 1) * 25}%`, transform: 'translate(-50%, -50%)' }}
                >
                  →
                </div>
              ))}
            </div>

            {/* Active station detail */}
            {activeStation >= 0 && (
              <motion.div
                key={activeStation}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-8 bg-surface1 border rounded-2xl p-6"
                style={{ borderColor: STATIONS[activeStation].color + '40' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: STATIONS[activeStation].color + '20' }}>
                    {STATIONS[activeStation].icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm" style={{ color: STATIONS[activeStation].color }}>
                      {t(`stations.${STATIONS[activeStation].key}.name` as any)}
                    </h4>
                    <p className="text-xs text-text-muted">
                      {STATIONS[activeStation].input} → {STATIONS[activeStation].output}
                    </p>
                  </div>
                </div>
                {activeStation > 0 && CODE_BLOCKS[activeStation - 1] && (
                  <div className="bg-surface2 rounded-lg p-4 font-mono text-xs">
                    {CODE_BLOCKS[activeStation - 1].split('\n').map((line, li) => (
                      <div key={li}>
                        {line.startsWith('#') ? (
                          <span className="text-text-muted">{line}</span>
                        ) : line.includes('=') ? (
                          <>
                            <span className="text-accent-blue">{line.split('=')[0]}=</span>
                            <span className="text-data-green">{line.split('=').slice(1).join('=')}</span>
                          </>
                        ) : (
                          <span className="text-data-green">{line}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Replay */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => { setActiveStation(-1); setTimeout(() => setActiveStation(0), 50) }}
                className="text-sm text-text-muted hover:text-accent-blue transition-colors flex items-center gap-2"
              >
                <span className="text-base">↻</span> {t('sectionB.replay')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section C: 결론 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('sectionC.heading')}
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
              {t('sectionC.desc')}
            </p>
          </ScrollReveal>

          {/* Mini pipeline summary */}
          <ScrollReveal delay={0.2}>
            <div className="flex items-center justify-center gap-3 text-sm mb-16">
              {['Model', 'Compile', 'Simulate', 'Analyze'].map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-full border font-mono text-xs"
                    style={{ borderColor: STATIONS[i].color + '50', color: STATIONS[i].color }}>
                    {label}
                  </span>
                  {i < 3 && <span className="text-text-muted/40">→</span>}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <NextHallButton currentHall="simulator" />
        </div>
      </section>
    </div>
  )
}
