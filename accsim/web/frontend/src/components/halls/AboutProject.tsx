'use client'
import { useTranslations } from 'next-intl'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { motion } from 'framer-motion'

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
  simulator: '#3B82F6',
  backend: '#F59E0B',
  frontend: '#10B981',
}

export default function AboutProject() {
  const t = useTranslations('about')

  return (
    <div className="bg-background min-h-screen">
      <section className="hall-section flex items-center justify-center px-6">
        <div className="max-w-5xl w-full">
          <ScrollReveal>
            <p className="text-text-muted text-sm font-mono tracking-widest uppercase mb-4 text-center">Hall 9 — About</p>
            <h1 className="text-5xl font-bold text-text-primary text-center mb-4">{t('title')}</h1>
            <p className="text-text-muted text-xl text-center max-w-2xl mx-auto mb-16">{t('subtitle')}</p>
          </ScrollReveal>

          {/* Motivation */}
          <ScrollReveal>
            <div className="bg-surface1 border border-border rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-text-primary mb-4">{t('motivation.title')}</h2>
              <p className="text-text-muted leading-relaxed text-lg">{t('motivation.desc')}</p>
            </div>
          </ScrollReveal>

          {/* Why / How / Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {(['why', 'how', 'results'] as const).map((key, i) => (
              <ScrollReveal key={key} delay={i * 0.1}>
                <div className="bg-surface1 border border-border rounded-2xl p-6 h-full">
                  <h3 className="font-bold text-text-primary mb-3 text-lg">{t(`summary.${key}.title`)}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{t(`summary.${key}.desc`)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Tech Stack */}
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">{t('techStack.title')}</h2>
            <div className="flex gap-3 justify-center mb-4 flex-wrap text-xs">
              {Object.entries(CAT_COLOR).map(([cat, color]) => (
                <span key={cat} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-text-muted">{t(`techStack.${cat as any}`)}</span>
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {TECH_STACK.map((tech, i) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="bg-surface1 border rounded-xl p-3 text-center hover:scale-105 transition-transform cursor-default"
                  style={{ borderColor: CAT_COLOR[tech.cat] + '40' }}
                >
                  <div className="text-2xl mb-1">{tech.icon}</div>
                  <p className="text-xs text-text-muted">{tech.name}</p>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>

          {/* Links */}
          <ScrollReveal delay={0.3}>
            <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
              <a
                href="https://github.com/iimmuunnee/AccSim"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-surface1 border border-border text-text-primary hover:border-accent-blue hover:text-accent-blue transition-all duration-200 font-medium"
              >
                ★ GitHub
              </a>
              <a
                href="#"
                className="px-6 py-3 rounded-full bg-surface1 border border-border text-text-primary hover:border-accent-amber hover:text-accent-amber transition-all duration-200 font-medium"
              >
                📄 README
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
