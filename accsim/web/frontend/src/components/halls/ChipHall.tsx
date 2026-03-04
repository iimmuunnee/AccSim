'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import dynamic from 'next/dynamic'
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

export default function ChipHall() {
  const t = useTranslations('chip')
  const lt = useLevelText('chip')
  const [arraySize, setArraySize] = useState(8)
  const [deepDive, setDeepDive] = useState(false)
  const utilization = makeUtilization(arraySize)

  return (
    <div className="bg-background min-h-screen">
      <section className="hall-section flex items-center justify-center px-6">
        <div className="max-w-6xl w-full">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 rounded-full" style={{ backgroundColor: '#06B6D4' }} />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 3 — Inside the Chip</p>
            </div>
            <h1 className="text-5xl font-bold text-text-primary text-center mb-4">{t('title')}</h1>
            <p className="text-text-muted text-xl text-center max-w-2xl mx-auto mb-8 whitespace-pre-line">{lt('subtitle')}</p>
          </ScrollReveal>

          <div className="flex items-center justify-center gap-6 mb-8">
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

      <section className="hall-section flex items-center justify-center px-6">
        <div className="max-w-5xl w-full">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
              <Term id="weightStationary">Weight-Stationary</Term> Data Flow
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: t('dataFlow.activation'),
                color: '#06B6D4',
                icon: '→',
                desc: '입력 데이터가 좌→우로 흐릅니다. 각 행에서 순차적으로 PE에 주입됩니다.',
              },
              {
                label: t('dataFlow.psum'),
                color: '#F59E0B',
                icon: '↓',
                desc: '부분합(Partial Sum)이 상→하로 누적됩니다. 최하단 PE에서 최종 출력이 생성됩니다.',
              },
              {
                label: t('dataFlow.weight'),
                color: '#3B82F6',
                icon: '■',
                desc: '가중치는 PE에 고정(stationary)됩니다. 한 번 로드 후 여러 입력에 재사용합니다.',
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-surface1 border border-border rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}>
                    <div className="w-2 h-full rounded-full animate-[dotFlow_2s_linear_infinite]" style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                  </div>
                  <div className="text-3xl font-mono mb-3" style={{ color: item.color }}>{item.icon}</div>
                  <h3 className="font-semibold mb-2" style={{ color: item.color }}>{item.label}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {deepDive && (
            <ScrollReveal delay={0.3}>
              <div className="mt-8 bg-surface2 border border-border rounded-2xl p-6 font-mono text-sm">
                <p className="text-accent-amber mb-3">// Deep Dive: <Term id="PE">PE</Term> Computation</p>
                <p className="text-text-muted">C[row][col] = Σ A[row][k] × W[k][col]</p>
                <p className="text-text-muted mt-2">PE[i][j]: psum_in += activation[i] × weight[j]</p>
                <p className="text-data-green mt-2">Array {arraySize}×{arraySize} → {arraySize * arraySize} <Term id="PE">PEs</Term> in parallel</p>
              </div>
            </ScrollReveal>
          )}
          <NextHallButton currentHall="chip" />
        </div>
      </section>
    </div>
  )
}
