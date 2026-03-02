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
  { key: 'compiler',      x: 310, y: 20,  w: 180, h: 60, color: '#3B82F6' },
  { key: 'controller',    x: 310, y: 130, w: 180, h: 60, color: '#6366F1' },
  { key: 'systolicArray', x: 120, y: 250, w: 200, h: 70, color: '#8B5CF6' },
  { key: 'sram',          x: 480, y: 250, w: 180, h: 70, color: '#F59E0B' },
  { key: 'dram',          x: 480, y: 370, w: 180, h: 60, color: '#F97316' },
  { key: 'analysis',      x: 120, y: 370, w: 200, h: 60, color: '#10B981' },
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
      <section className="hall-section px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-6xl w-full mx-auto">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 7 — Architecture</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary text-center mb-4">{t('title')}</h1>
            <p className="text-text-muted text-base md:text-xl text-center max-w-2xl mx-auto mb-4 whitespace-pre-line">{t('subtitle')}</p>
            <p className="text-text-muted text-sm text-center mb-8 md:mb-12">{t('clickHint')}</p>
          </ScrollReveal>

          {/* SVG Diagram — Full Width */}
          <ScrollReveal>
            <div className="bg-surface1 border border-border rounded-2xl p-4 sm:p-6 mb-8 overflow-x-auto">
              <div className="min-w-[480px]">
              <svg viewBox="0 0 800 460" className="w-full">
                {/* Arrow lines */}
                {ARROWS.map(({ from, to }, i) => {
                  const fromNode = NODES.find(n => n.key === from)!
                  const toNode = NODES.find(n => n.key === to)!
                  const [x1, y1] = getCenter(fromNode)
                  const [x2, y2] = getCenter(toNode)
                  const isHighlighted = selected && (from === selected || to === selected)
                  return (
                    <g key={i}>
                      <line
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={isHighlighted ? '#FAFAFA' : '#3F3F46'}
                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                        strokeDasharray="6,4"
                        markerEnd="url(#arrow)"
                        className="transition-all duration-300"
                      >
                        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.5s" repeatCount="indefinite" />
                      </line>
                    </g>
                  )
                })}
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="7" refY="3.5" orient="auto">
                    <path d="M0,0 L0,7 L10,3.5 z" fill="#3F3F46" />
                  </marker>
                </defs>
                {/* Component nodes */}
                {NODES.map((node) => {
                  const isSelected = selected === node.key
                  const isDimmed = selected && !isSelected
                  return (
                  <g
                    key={node.key}
                    className="cursor-pointer"
                    onClick={() => setSelected(isSelected ? null : node.key)}
                    style={{ transform: `translate(${node.x + node.w / 2}px, ${node.y + node.h / 2}px)` }}
                  >
                    <rect
                      x={-node.w / 2} y={-node.h / 2} width={node.w} height={node.h}
                      rx="10"
                      fill={isSelected ? node.color : node.color + '20'}
                      stroke={node.color}
                      strokeWidth={isSelected ? 2.5 : 1}
                      opacity={isDimmed ? 0.4 : 1}
                      className="transition-all duration-200 hover:opacity-100"
                    />
                    <text
                      x={0} y={6}
                      textAnchor="middle"
                      fill={isSelected ? '#FAFAFA' : node.color}
                      fontSize="14"
                      fontWeight="600"
                      opacity={isDimmed ? 0.4 : 1}
                      className="transition-all duration-200"
                    >
                      {t(`components.${node.key}.name` as any)}
                    </text>
                  </g>
                )})}
              </svg>
              </div>
            </div>
          </ScrollReveal>

          {/* Detail panel */}
          <ScrollReveal>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.3 }}
                  className="bg-surface1 border rounded-2xl p-6 sm:p-8"
                  style={{ borderColor: selectedNode?.color + '60' }}
                >
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-xl sm:text-2xl"
                      style={{ backgroundColor: selectedNode?.color + '20', color: selectedNode?.color }}
                    >
                      ⚙
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: selectedNode?.color }}>
                        {t(`components.${selected}.name` as any)}
                      </h3>
                      <p className="text-text-muted text-sm sm:text-base leading-relaxed">
                        {t(`components.${selected}.desc` as any)}
                      </p>
                      <div className="mt-4 pt-3 border-t border-border">
                        <p className="text-xs text-text-muted font-mono">
                          accsim/{'>'}{selected === 'compiler' || selected === 'analysis' ? selected : 'core'}/
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-surface1 border border-border rounded-2xl p-6 flex items-center justify-center"
                >
                  <p className="text-text-muted text-center">{t('clickHint')}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </ScrollReveal>
          <NextHallButton currentHall="architecture" />
        </div>
      </section>
    </div>
  )
}
