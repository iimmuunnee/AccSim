'use client'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import ScrollReveal from '@/components/ui/ScrollReveal'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const IntroHero = dynamic(() => import('@/components/three/IntroHero').then(m => ({ default: m.IntroHero })), { ssr: false })

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (idx >= text.length) return
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, idx + 1))
      setIdx(i => i + 1)
    }, 50)
    return () => clearTimeout(t)
  }, [idx, text])
  return <span>{displayed}<span className="animate-pulse">|</span></span>
}

function CountUpNumber({ target, duration = 2000, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return <>{val.toLocaleString()}{suffix}</>
}

export default function IntroHall() {
  const t = useTranslations('intro')
  const nav = useTranslations('nav')
  const params = useParams()
  const locale = params.locale as string

  return (
    <div className="bg-background">
      {/* Section 1: Hero */}
      <section className="hall-section relative flex items-center justify-center overflow-hidden">
        <IntroHero />
        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="text-text-muted text-sm font-mono tracking-widest uppercase mb-4">
              Hall 1 — Intro
            </p>
            <h1 className="text-5xl md:text-7xl font-bold text-text-primary leading-tight mb-6">
              <TypewriterText text={t('hero.title')} />
            </h1>
            <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <Link
              href={`/${locale}/accelerator`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent-blue text-white font-semibold hover:bg-blue-600 transition-all duration-200 hover:scale-105"
            >
              {t('hero.cta')} →
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-text-muted">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Section 2: GPU Growth stats */}
      <section className="hall-section flex items-center justify-center px-6">
        <div className="max-w-5xl w-full">
          <ScrollReveal>
            <p className="text-text-muted text-sm font-mono tracking-widest uppercase mb-4 text-center">
              {t('stats.title')}
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              { value: 1000, suffix: 'x', label: t('stats.gpuGrowthDesc'), unit: t('stats.gpuGrowthUnit') },
              { value: 312, suffix: 'TFLOPS', label: 'H100 GPU 피크 연산량', unit: '' },
              { value: 8, suffix: 'x8', label: 'Systolic Array PE 격자 (기본)', unit: '' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="bg-surface1 border border-border rounded-2xl p-8 text-center">
                  <div className="text-5xl font-bold font-mono text-accent-blue mb-2">
                    <CountUpNumber target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-text-muted text-sm">{stat.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Matrix convergence explanation */}
      <section className="hall-section flex items-center justify-center px-6">
        <div className="max-w-4xl w-full">
          <ScrollReveal>
            <h2 className="text-4xl font-bold text-text-primary mb-6 text-center">{t('matrix.title')}</h2>
            <p className="text-text-muted text-lg text-center max-w-2xl mx-auto mb-12">{t('matrix.desc')}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="bg-surface1 border border-border rounded-2xl p-8 font-mono text-sm">
              <div className="flex items-center gap-8 justify-center flex-wrap">
                <div className="text-center">
                  <p className="text-text-muted text-xs mb-2">Activation (A)</p>
                  <div className="grid grid-cols-3 gap-1">
                    {Array(9).fill(0).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="w-10 h-10 bg-accent-blue/20 border border-accent-blue/40 rounded flex items-center justify-center text-accent-blue text-xs"
                      >
                        a
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="text-text-muted text-2xl">@</div>
                <div className="text-center">
                  <p className="text-text-muted text-xs mb-2">Weight (W)</p>
                  <div className="grid grid-cols-3 gap-1">
                    {Array(9).fill(0).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.45 + i * 0.05, duration: 0.3 }}
                        className="w-10 h-10 bg-accent-amber/20 border border-accent-amber/40 rounded flex items-center justify-center text-accent-amber text-xs"
                      >
                        w
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="text-text-muted text-2xl">=</div>
                <div className="text-center">
                  <p className="text-text-muted text-xs mb-2">Output (C)</p>
                  <div className="grid grid-cols-3 gap-1">
                    {Array(9).fill(0).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + i * 0.05, duration: 0.3 }}
                        className="w-10 h-10 bg-data-green/20 border border-data-green/40 rounded flex items-center justify-center text-data-green text-xs"
                      >
                        c
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Section 4: Systolic Array intro */}
      <section className="hall-section flex items-center justify-center px-6 bg-surface1/30">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-bold text-text-primary mb-6">{t('systolic.title')}</h2>
            <p className="text-text-muted text-lg mb-12 max-w-2xl mx-auto">{t('systolic.desc')}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href={`/${locale}/accelerator`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-accent-blue text-accent-blue font-semibold hover:bg-accent-blue hover:text-white transition-all duration-200"
            >
              {nav('hallNames.accelerator')} 보러 가기 →
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
