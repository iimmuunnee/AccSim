'use client'
import { useTranslations } from 'next-intl'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import ScrollReveal from '@/components/ui/ScrollReveal'

const STEPS = [
  {
    number: '01',
    color: '#3B82F6',
    code: `# 모델 → 타일 → 명령어
tiler = MatMulTiler(array_size=8)
plan = tiler.tile(M=256, K=8, N=1)
prog = LSTMCompiler().compile(model)
# → 9개 ISA 명령어`,
  },
  {
    number: '02',
    color: '#F59E0B',
    code: `# 사이클 정확도 실행
controller = Controller(config)
stats = controller.execute_program(prog)
# cycle 0: LOAD_WEIGHT W_ih
# cycle 100: MATMUL W_ih @ x_t
# cycle 4100: MATMUL W_hh @ h_t`,
  },
  {
    number: '03',
    color: '#10B981',
    code: `# 성능 분석 결과
metrics = compute_metrics(trace, config)
# PE 활용률: 73.4%
# 총 사이클: 12,480
# 달성 GOPS: 58.72`,
  },
]

function StepCard({ step, index, stepT }: { step: typeof STEPS[0]; index: number; stepT: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
    >
      {/* Text side */}
      <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl font-bold font-mono" style={{ color: step.color }}>{step.number}</span>
          <div className="w-px h-12 bg-border" />
          <h3 className="text-xl font-semibold text-text-primary">{stepT[index].title}</h3>
        </div>
        <p className="text-text-muted leading-relaxed">{stepT[index].desc}</p>
      </div>
      {/* Code side */}
      <div className={`bg-surface2 border rounded-xl p-6 font-mono text-sm ${index % 2 === 1 ? 'lg:order-1' : ''}`}
           style={{ borderColor: step.color + '40' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: step.color }} />
          <span className="text-xs text-text-muted">AccSim Pipeline — Step {step.number}</span>
        </div>
        <pre className="text-data-green whitespace-pre-wrap text-xs leading-relaxed">{step.code}</pre>
      </div>
    </motion.div>
  )
}

export default function SimulatorHall() {
  const t = useTranslations('simulator')

  const stepData = [0, 1, 2].map(i => ({
    title: t(`steps.${i}.title` as any),
    desc: t(`steps.${i}.desc` as any),
  }))

  return (
    <div className="bg-background min-h-screen">
      <section className="hall-section flex items-center justify-center px-6">
        <div className="max-w-5xl w-full">
          <ScrollReveal>
            <p className="text-text-muted text-sm font-mono tracking-widest uppercase mb-4 text-center">Hall 4 — Simulator</p>
            <h1 className="text-5xl font-bold text-text-primary text-center mb-4">{t('title')}</h1>
            <p className="text-text-muted text-xl text-center max-w-2xl mx-auto mb-4">{t('subtitle')}</p>
          </ScrollReveal>

          {/* Why simulator */}
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
              {[
                { icon: '🚫', title: '실제 칩 없음', desc: '테이프아웃 전 성능 검증이 불가능' },
                { icon: '💰', title: '비용 절감', desc: '시뮬레이션으로 설계 결함 조기 발견' },
                { icon: '⚡', title: 'SW Co-design', desc: '컴파일러·HW 동시 최적화 가능' },
              ].map((item, i) => (
                <div key={i} className="bg-surface1 border border-border rounded-xl p-5 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold text-text-primary mb-1">{item.title}</h4>
                  <p className="text-text-muted text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 3-step pipeline */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto space-y-24">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary text-center mb-4">3단계 파이프라인</h2>
            <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
              <span className="px-3 py-1 rounded-full bg-surface1 border border-border">Model</span>
              <span>→</span>
              <span className="px-3 py-1 rounded-full bg-surface1 border border-border">Compiler</span>
              <span>→</span>
              <span className="px-3 py-1 rounded-full bg-surface1 border border-border">Simulator</span>
              <span>→</span>
              <span className="px-3 py-1 rounded-full bg-surface1 border border-border">Analysis</span>
            </div>
          </ScrollReveal>
          {STEPS.map((step, i) => (
            <StepCard key={i} step={step} index={i} stepT={stepData} />
          ))}
        </div>
      </section>
    </div>
  )
}
