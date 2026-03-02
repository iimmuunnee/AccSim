'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import NextHallButton from '@/components/ui/NextHallButton'
import { motion, AnimatePresence } from 'framer-motion'

const TECH_STACK = [
  { name: 'Python 3.11', icon: '🐍', cat: 'simulator' },
  { name: 'NumPy', icon: '🔢', cat: 'simulator' },
  { name: 'FastAPI', icon: '⚡', cat: 'backend' },
  { name: 'PyTorch', icon: '🔥', cat: 'simulator' },
  { name: 'Next.js 14', icon: '▲', cat: 'frontend' },
  { name: 'React 18', icon: '⚛', cat: 'frontend' },
  { name: 'Three.js / R3F', icon: '🎮', cat: 'frontend' },
  { name: 'D3.js', icon: '📊', cat: 'frontend' },
  { name: 'Framer Motion', icon: '✨', cat: 'frontend' },
  { name: 'Tailwind CSS', icon: '💨', cat: 'frontend' },
  { name: 'TypeScript', icon: '📘', cat: 'frontend' },
  { name: 'next-intl', icon: '🌐', cat: 'frontend' },
]

const CAT_COLOR: Record<string, string> = {
  frontend: '#10B981',
  backend: '#F59E0B',
  simulator: '#3B82F6',
}

export default function AboutProject() {
  const t = useTranslations('about')
  const [showAboutMe, setShowAboutMe] = useState(false)

  return (
    <div className="bg-background min-h-screen">
      <section className="hall-section flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full">
          {/* Title */}
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 bg-accent-amber rounded-full" />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 9 — About</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary text-center mb-4">{t('title')}</h1>
            <p className="text-text-muted text-base md:text-xl text-center max-w-2xl mx-auto mb-8 whitespace-pre-line">{t('subtitle')}</p>
          </ScrollReveal>

          {/* Motivation */}
          <ScrollReveal>
            <div className="bg-surface1 border border-border rounded-2xl p-6 md:p-8 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">{t('motivation.title')}</h2>
              <p className="text-text-muted leading-relaxed text-base md:text-lg whitespace-pre-line">{t('motivation.desc')}</p>
            </div>
          </ScrollReveal>

          {/* Why / How / Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {(['why', 'how', 'results'] as const).map((key, i) => (
              <ScrollReveal key={key} delay={i * 0.1}>
                <div className="bg-surface1 border border-border rounded-2xl p-5 sm:p-6 h-full">
                  <h3 className="font-bold text-text-primary mb-3 text-base sm:text-lg">{t(`summary.${key}.title`)}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{t(`summary.${key}.desc`)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* ── Page 2: Tech Stack ── */}
      <section className="hall-section flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full">
          {/* Tech Stack */}
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6 text-center">{t('techStack.title')}</h2>
            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-start gap-3">
                {Object.entries(CAT_COLOR).map(([cat, color]) => (
                  <span key={cat} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-text-muted text-sm sm:text-base">{t(`techStack.${cat as any}`)}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4 mb-12">
              {Object.entries(CAT_COLOR).map(([cat, color]) => (
                <div key={cat} className="rounded-xl p-4 border" style={{ borderColor: color + '30', backgroundColor: color + '08' }}>
                  <p className="text-xs font-mono text-text-muted mb-3 uppercase tracking-wider" style={{ color }}>{cat}</p>
                  <div className="flex flex-wrap gap-3">
                    {TECH_STACK.filter(t => t.cat === cat).map((tech, i) => (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        className="bg-surface1 border rounded-xl p-3 text-center hover:scale-105 transition-transform cursor-default"
                        style={{ borderColor: color + '40' }}
                      >
                        <div className="text-2xl mb-1">{tech.icon}</div>
                        <p className="text-xs text-text-muted">{tech.name}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Links */}
          <ScrollReveal delay={0.3}>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="https://github.com/iimmuunnee/AccSim"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-surface1 border border-border text-text-primary hover:border-accent-blue hover:text-accent-blue transition-all duration-200 font-medium"
              >
                ★ GitHub
              </a>
              <button
                onClick={() => setShowAboutMe(true)}
                className="px-6 py-3 rounded-full bg-surface1 border border-border text-text-primary hover:border-accent-amber hover:text-accent-amber transition-all duration-200 font-medium"
              >
                👤 ABOUT ME
              </button>
            </div>
          </ScrollReveal>

          {/* About Me Modal */}
          <AnimatePresence>
            {showAboutMe && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                onClick={() => setShowAboutMe(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.15 }}
                  className="bg-surface1 border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4"
                  onClick={e => e.stopPropagation()}
                >
                  <h3 className="text-2xl font-bold text-text-primary mb-6">{t('aboutMe.name')}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted w-16">Email</span>
                      <span className="text-text-primary">{t('aboutMe.email')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted w-16">School</span>
                      <span className="text-text-primary">{t('aboutMe.school')}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-text-muted leading-relaxed">{t('aboutMe.bio')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAboutMe(false)}
                    className="mt-6 w-full py-2 rounded-xl border border-border text-text-muted hover:text-text-primary hover:border-accent-blue transition-all text-sm"
                  >
                    {t('close')}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <NextHallButton currentHall="about" />
        </div>
      </section>
    </div>
  )
}
