'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import NextHallButton from '@/components/ui/NextHallButton'

type ComponentKey = 'compiler' | 'controller' | 'systolicArray' | 'sram' | 'dram' | 'analysis'

interface ComponentNode {
  key: ComponentKey
  x: number
  y: number
  w: number
  h: number
  color: string
}

const NODES: ComponentNode[] = [
  { key: 'compiler',      x: 340, y: 20,  w: 140, h: 50, color: '#3B82F6' },
  { key: 'controller',    x: 340, y: 110, w: 140, h: 50, color: '#6366F1' },
  { key: 'systolicArray', x: 200, y: 200, w: 160, h: 60, color: '#8B5CF6' },
  { key: 'sram',          x: 400, y: 200, w: 140, h: 60, color: '#F59E0B' },
  { key: 'dram',          x: 400, y: 300, w: 140, h: 50, color: '#F97316' },
  { key: 'analysis',      x: 200, y: 300, w: 160, h: 50, color: '#10B981' },
]

const ARROWS = [
  { from: 'compiler', to: 'controller' },
  { from: 'controller', to: 'systolicArray' },
  { from: 'controller', to: 'sram' },
  { from: 'sram', to: 'systolicArray' },
  { from: 'dram', to: 'sram' },
  { from: 'systolicArray', to: 'analysis' },
]

function getCenter(node: ComponentNode): [number, number] {
  return [node.x + node.w / 2, node.y + node.h / 2]
}

export default function ArchitectureHall() {
  const t = useTranslations('architecture')
  const [selected, setSelected] = useState<ComponentKey | null>(null)

  const selectedNode = NODES.find(n => n.key === selected)

  return (
    <div className="bg-background min-h-screen">
      <section className="hall-section flex items-center justify-center px-6">
        <div className="max-w-6xl w-full">
          <ScrollReveal>
            <p className="text-text-muted text-sm font-mono tracking-widest uppercase mb-4 text-center">Hall 7 — Architecture</p>
            <h1 className="text-5xl font-bold text-text-primary text-center mb-4">{t('title')}</h1>
            <p className="text-text-muted text-xl text-center max-w-2xl mx-auto mb-4">{t('subtitle')}</p>
            <p className="text-text-muted text-sm text-center mb-12">{t('clickHint')}</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* SVG Diagram */}
            <ScrollReveal direction="left">
              <div className="bg-surface1 border border-border rounded-2xl p-6">
                <svg viewBox="0 0 640 400" className="w-full" style={{ height: 400 }}>
                  {/* Arrow lines */}
                  {ARROWS.map(({ from, to }, i) => {
                    const fromNode = NODES.find(n => n.key === from)!
                    const toNode = NODES.find(n => n.key === to)!
                    const [x1, y1] = getCenter(fromNode)
                    const [x2, y2] = getCenter(toNode)
                    return (
                      <g key={i}>
                        <line
                          x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke="#3F3F46" strokeWidth="1.5" markerEnd="url(#arrow)"
                        />
                      </g>
                    )
                  })}
                  <defs>
                    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill="#3F3F46" />
                    </marker>
                  </defs>
                  {/* Component nodes */}
                  {NODES.map((node) => (
                    <g
                      key={node.key}
                      className="cursor-pointer"
                      onClick={() => setSelected(selected === node.key ? null : node.key)}
                    >
                      <rect
                        x={node.x} y={node.y} width={node.w} height={node.h}
                        rx="8"
                        fill={selected === node.key ? node.color : node.color + '20'}
                        stroke={node.color}
                        strokeWidth={selected === node.key ? 2 : 1}
                        className="transition-all duration-200"
                      />
                      <text
                        x={node.x + node.w / 2} y={node.y + node.h / 2 + 5}
                        textAnchor="middle"
                        fill={selected === node.key ? '#FAFAFA' : node.color}
                        fontSize="12"
                        fontWeight="600"
                      >
                        {t(`components.${node.key}.name` as any)}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </ScrollReveal>

            {/* Detail panel */}
            <ScrollReveal direction="right">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-surface1 border rounded-2xl p-8"
                    style={{ borderColor: selectedNode?.color + '60' }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-xl"
                      style={{ backgroundColor: selectedNode?.color + '20', color: selectedNode?.color }}
                    >
                      ⚙
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: selectedNode?.color }}>
                      {t(`components.${selected}.name` as any)}
                    </h3>
                    <p className="text-text-muted leading-relaxed">
                      {t(`components.${selected}.desc` as any)}
                    </p>
                    <div className="mt-6 pt-4 border-t border-border">
                      <p className="text-xs text-text-muted font-mono">
                        accsim/{'>'}{selected === 'compiler' || selected === 'analysis' ? selected : 'core'}/
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-surface1 border border-border rounded-2xl p-8 flex items-center justify-center h-64"
                  >
                    <p className="text-text-muted text-center">{t('clickHint')}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollReveal>
          </div>
          <NextHallButton currentHall="architecture" />
        </div>
      </section>
    </div>
  )
}
