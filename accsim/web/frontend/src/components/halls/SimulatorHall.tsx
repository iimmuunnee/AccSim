// HALL 4 — Simulator Pipeline
'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import NextHallButton from '@/components/ui/NextHallButton'
import Term from '@/components/ui/Term'
import { useLevelText } from '@/hooks/useLevelText'
import HallBackground from '@/components/ui/HallBackground'
import InfoPanel from '@/components/ui/InfoPanel'
import ScrollGuide from '@/components/ui/ScrollGuide'

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

/* ─── Station card ─── */
function StationCard({ station, idx, activeStation, t, onSelect }: {
  station: typeof STATIONS[0]; idx: number; activeStation: number; t: any; onSelect: (idx: number) => void
}) {
  const isActive = activeStation === idx
  const isPast = activeStation > idx

  return (
    <motion.div
      className="flex flex-col items-center text-center cursor-pointer"
      onClick={() => onSelect(idx)}
      animate={isActive ? { scale: 1.03 } : { scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl mb-3 border-2 transition-all duration-300"
        style={{
          borderColor: (isActive || isPast) ? station.color : station.color + '30',
          backgroundColor: isActive ? station.color + '20' : 'rgba(24,24,27,0.6)',
          boxShadow: isActive ? `0 0 20px ${station.color}30` : 'none',
        }}
      >
        {station.icon}
      </div>
      <h4 className="font-semibold text-base mb-1" style={{ color: (isActive || isPast) ? station.color : '#A1A1AA' }}>
        {t(`stations.${station.key}.name` as any)}
      </h4>
      <p className="text-sm text-text-muted max-w-[10rem]">
        {t(`stations.${station.key}.desc` as any)}
      </p>
    </motion.div>
  )
}

export default function SimulatorHall() {
  const t = useTranslations('simulator')
  const lt = useLevelText('simulator')
  const [activeStation, setActiveStation] = useState(0)

  return (
    <div className="bg-background min-h-screen relative">
      <HallBackground hall="simulator" />

      {/* ── Section A: 도입 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 bg-accent-blue rounded-full" />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 4 — Simulator</p>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
              {t('sectionA.heading')}
            </h1>
            <p className="text-text-muted text-xl max-w-2xl mx-auto mb-12">
              {t('sectionA.subtext')}
            </p>
          </ScrollReveal>

          {/* 3 reason cards */}
          <ScrollReveal delay={0.2}>
            <InfoPanel className="max-w-lg mx-auto">
              <div className="flex flex-col items-center gap-8">
                {['reason1', 'reason2', 'reason3'].map((key, i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="flex items-center gap-5 w-full"
                  >
                    <div className="relative flex flex-col items-center shrink-0">
                      <div className="w-14 h-14 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue font-mono text-lg leading-none font-bold">
                        {i + 1}
                      </div>
                      {i < 2 && <div className="absolute top-full w-px h-8 bg-border/50 mt-1" />}
                    </div>
                    <div className="text-left">
                      <p className="text-base font-medium text-text-primary">{t(`sectionA.${key}.title` as any)}</p>
                      <p className="text-sm text-text-muted">{t(`sectionA.${key}.desc` as any)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </InfoPanel>
          </ScrollReveal>
          <div className="mt-8">
            <ScrollGuide hideAfterIndex={0} />
          </div>
        </div>
      </section>

      {/* ── Section B: 파이프라인 스테이션 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-6xl w-full">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
              {t('sectionB.heading')}
            </h2>
            <p className="text-text-muted text-center mb-8 max-w-lg mx-auto">
              {t('sectionB.subtext')}
            </p>
          </ScrollReveal>

          {/* Stations row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {STATIONS.map((station, i) => (
              <StationCard key={station.key} station={station} idx={i} activeStation={activeStation} t={t} onSelect={setActiveStation} />
            ))}
          </div>

          {/* Conveyor belt gauge */}
          <div className="relative h-10 mx-10 mb-8">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-surface2/50 rounded-full" />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 border-t border-dashed border-border/40" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-accent-blue/40 rounded-full"
              style={{
                width: `${((activeStation + 1) / STATIONS.length) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
            {[0, 1, 2].map(i => (
              <div key={i}
                className="absolute top-1/2 -translate-y-1/2 text-xl font-bold transition-colors duration-300"
                style={{
                  left: `${(i + 1) * 25}%`,
                  transform: 'translate(-50%, -50%)',
                  color: activeStation > i ? STATIONS[i + 1]?.color : 'rgba(161,161,170,0.5)',
                }}
              >
                →
              </div>
            ))}
          </div>

          {/* Active station detail */}
          <motion.div
            key={activeStation}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-surface1 border rounded-2xl p-8"
            style={{ borderColor: STATIONS[activeStation].color + '40' }}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: STATIONS[activeStation].color + '20' }}>
                {STATIONS[activeStation].icon}
              </div>
              <div>
                <h4 className="font-semibold text-lg" style={{ color: STATIONS[activeStation].color }}>
                  {t(`stations.${STATIONS[activeStation].key}.name` as any)}
                </h4>
                <p className="text-sm text-text-muted">
                  {STATIONS[activeStation].input} → {STATIONS[activeStation].output}
                </p>
              </div>
            </div>
            {activeStation > 0 && CODE_BLOCKS[activeStation - 1] && (
              <div className="bg-surface2 rounded-lg p-5 font-mono text-sm">
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

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-6">
            {activeStation > 0 && (
              <button
                onClick={() => setActiveStation(0)}
                className="text-sm text-text-muted hover:text-accent-blue transition-colors"
              >
                ↻ {t('sectionB.replay')}
              </button>
            )}
            {activeStation > 0 && (
              <button
                onClick={() => setActiveStation(s => s - 1)}
                className="px-4 py-2 rounded-lg border border-border/50 text-sm text-text-muted hover:text-text-primary hover:border-border transition-colors"
              >
                ← {t('sectionB.prev')}
              </button>
            )}
            {activeStation < STATIONS.length - 1 && (
              <button
                onClick={() => setActiveStation(s => s + 1)}
                className="px-4 py-2 rounded-lg border border-accent-blue/50 bg-accent-blue/10 text-sm text-accent-blue hover:bg-accent-blue/20 transition-colors"
              >
                {t('sectionB.next')} →
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Section C: 결론 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('sectionC.heading')}
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
              {t('sectionC.desc')}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="flex items-center justify-center gap-4 mb-12">
              {['Model', 'Compile', 'Simulate', 'Analyze'].map((label, i) => (
                <div key={label} className="flex items-center gap-4">
                  <span className="px-4 py-2 sm:px-6 sm:py-3 rounded-full border font-mono text-sm sm:text-base"
                    style={{ borderColor: STATIONS[i].color + '50', color: STATIONS[i].color }}>
                    {label}
                  </span>
                  {i < 3 && <span className="text-xl font-bold text-text-muted/50">→</span>}
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
