// HALL 9
'use client'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import NextHallButton from '@/components/ui/NextHallButton'
import HallBackground from '@/components/ui/HallBackground'
import ScrollGuide from '@/components/ui/ScrollGuide'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useLocale } from 'next-intl'

const TECH_STACK = [
  { name: 'Python 3.11', icon: '🐍', cat: 'simulator', reason: 'High-precision numerical simulation' },
  { name: 'NumPy', icon: '🔢', cat: 'simulator', reason: 'np.float64 cycle-accurate computation' },
  { name: 'FastAPI', icon: '⚡', cat: 'backend', reason: 'Async API for real-time simulation' },
  { name: 'PyTorch', icon: '🔥', cat: 'simulator', reason: 'SolarX LSTM weight extraction' },
  { name: 'Next.js 14', icon: '▲', cat: 'frontend', reason: 'SSG + App Router + i18n' },
  { name: 'React 18', icon: '⚛', cat: 'frontend', reason: 'Interactive UI components' },
  { name: 'Three.js / R3F', icon: '🎮', cat: 'frontend', reason: '3D systolic array visualization' },
  { name: 'D3.js', icon: '📊', cat: 'frontend', reason: 'Roofline, heatmap, breakdown charts' },
  { name: 'Framer Motion', icon: '✨', cat: 'frontend', reason: 'Scroll-driven animations' },
  { name: 'Tailwind CSS', icon: '💨', cat: 'frontend', reason: 'Dark theme design system' },
  { name: 'TypeScript', icon: '📘', cat: 'frontend', reason: 'Type-safe development' },
  { name: 'next-intl', icon: '🌐', cat: 'frontend', reason: 'Korean/English localization' },
]

const CAT_LABELS: Record<string, { color: string; label: string }> = {
  frontend: { color: '#10B981', label: 'Frontend' },
  backend: { color: '#F59E0B', label: 'Backend' },
  simulator: { color: '#3B82F6', label: 'Simulator' },
}

/* ─── Count-up number ─── */
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) return
    const duration = 1500
    const start = performance.now()
    const step = () => {
      const elapsed = performance.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target])

  return (
    <motion.span
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true }}
      className="font-mono"
    >
      {val.toLocaleString()}{suffix}
    </motion.span>
  )
}

export default function AboutProject() {
  const t = useTranslations('about')
  const locale = useLocale()
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)

  return (
    <div className="bg-background min-h-screen relative">
      <HallBackground variant="dots" />

      {/* ── Section A: 프로젝트 요약 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 bg-accent-amber rounded-full" />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 9 — About</p>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-text-primary leading-tight mb-2">
              AccSim
            </h1>
            <p className="text-text-muted text-xl max-w-2xl mx-auto mb-12 whitespace-pre-line">
              {t('subtitle')}
            </p>
          </ScrollReveal>

          {/* 3 key stats — count-up */}
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
              {[
                { value: 9, suffix: '', label: t('stats.opcodes') },
                { value: 100, suffix: '%', label: t('stats.cycleAccurate') },
                { value: 6, suffix: '', label: t('stats.components') },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-accent-amber mb-2">
                    <CountUp target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-text-muted text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>

          {/* Why / How / Results cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['why', 'how', 'results'] as const).map((key, i) => (
              <ScrollReveal key={key} delay={i * 0.1}>
                <div className="bg-surface1 border border-border rounded-2xl p-6 h-full text-left">
                  <h3 className="font-bold text-text-primary mb-3">{t(`summary.${key}.title`)}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{t(`summary.${key}.desc`)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-8">
            <ScrollGuide hideAfterIndex={0} />
          </div>
        </div>
      </section>

      {/* ── Section B: Tech Stack — Behind the Scenes ── */}
      <section className="hall-section hall-section-alt flex items-center justify-center px-6 relative z-10">
        <div className="max-w-5xl w-full">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary text-center mb-4">
              {t('behindScenes')}
            </h2>
            <p className="text-text-muted text-center mb-12 max-w-lg mx-auto">
              {t('behindScenesDesc')}
            </p>
          </ScrollReveal>

          {/* Grouped by category */}
          <div className="space-y-6">
            {Object.entries(CAT_LABELS).map(([cat, { color, label }]) => (
              <ScrollReveal key={cat}>
                <div className="rounded-xl p-5 border" style={{ borderColor: color + '30', backgroundColor: color + '05' }}>
                  <p className="text-xs font-mono text-text-muted mb-4 uppercase tracking-wider" style={{ color }}>{label}</p>
                  <div className="flex flex-wrap gap-3">
                    {TECH_STACK.filter(t => t.cat === cat).map((tech, i) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        viewport={{ once: true }}
                        className="relative group bg-surface1 border rounded-xl p-2 sm:p-3 text-center hover:scale-105 transition-all cursor-default"
                        style={{ borderColor: color + '40' }}
                        onMouseEnter={() => setHoveredTech(tech.name)}
                        onMouseLeave={() => setHoveredTech(null)}
                      >
                        <div className="text-2xl mb-1">{tech.icon}</div>
                        <p className="text-xs text-text-muted">{tech.name}</p>
                        {/* Tooltip on hover */}
                        {hoveredTech === tech.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-surface2 border border-border rounded-lg px-3 py-1.5 text-[10px] text-text-muted whitespace-nowrap z-10"
                          >
                            {tech.reason}
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section C: 개발자 + 마무리 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-3xl w-full text-center">
          {/* Developer info — inline */}
          <ScrollReveal>
            <div className="bg-surface1 border border-border rounded-2xl p-5 sm:p-8 mb-12">
              <h3 className="text-2xl font-bold text-text-primary mb-6">{t('aboutMe.name')}</h3>
              <p className="text-text-muted text-sm mb-4">{t('aboutMe.school')}</p>
              <p className="text-text-muted text-sm leading-relaxed max-w-md mx-auto mb-6">
                {t('aboutMe.bio')}
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <a
                  href="https://github.com/iimmuunnee/AccSim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-full bg-surface2 border border-border text-text-primary hover:border-accent-blue hover:text-accent-blue transition-all duration-200 text-sm"
                >
                  GitHub
                </a>
                <a
                  href={`mailto:${t('aboutMe.email')}`}
                  className="px-5 py-2 rounded-full bg-surface2 border border-border text-text-primary hover:border-accent-amber hover:text-accent-amber transition-all duration-200 text-sm"
                >
                  {t('aboutMe.email')}
                </a>
              </div>
            </div>
          </ScrollReveal>

          {/* Closing message */}
          <ScrollReveal delay={0.2}>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              viewport={{ once: true }}
              className="text-text-muted text-lg mb-12"
            >
              {t('closingMessage')}
            </motion.p>
          </ScrollReveal>

          {/* Back to start */}
          <ScrollReveal delay={0.4}>
            <Link
              href={`/${locale}/intro`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-muted hover:text-text-primary hover:border-accent-blue transition-all duration-200"
            >
              <span>←</span> {t('backToStart')}
            </Link>
          </ScrollReveal>

          <NextHallButton currentHall="about" />
        </div>
      </section>
    </div>
  )
}
