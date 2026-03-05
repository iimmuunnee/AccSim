'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '@/components/ui/ScrollReveal'
import NextHallButton from '@/components/ui/NextHallButton'
import InfoPanel from '@/components/ui/InfoPanel'
import ScrollGuide from '@/components/ui/ScrollGuide'

type CKey = 'compiler' | 'controller' | 'systolicArray' | 'sram' | 'dram' | 'analysis'

interface Node { key: CKey; x: number; y: number; w: number; h: number; color: string; icon: string; path: string }

const NODES: Node[] = [
  { key: 'compiler',      x: 310, y: 20,  w: 180, h: 60, color: '#3B82F6', icon: '⚙', path: 'compiler/' },
  { key: 'controller',    x: 310, y: 130, w: 180, h: 60, color: '#6366F1', icon: '🎛', path: 'core/controller.py' },
  { key: 'systolicArray', x: 120, y: 250, w: 200, h: 70, color: '#8B5CF6', icon: '🔲', path: 'core/systolic_array.py' },
  { key: 'sram',          x: 480, y: 250, w: 180, h: 70, color: '#F59E0B', icon: '💾', path: 'core/memory.py' },
  { key: 'dram',          x: 480, y: 370, w: 180, h: 60, color: '#F97316', icon: '🗄', path: 'core/memory.py' },
  { key: 'analysis',      x: 120, y: 370, w: 200, h: 60, color: '#10B981', icon: '📊', path: 'analysis/' },
]

const ARROWS: { from: CKey; to: CKey; label?: string }[] = [
  { from: 'compiler',     to: 'controller',    label: 'instructions' },
  { from: 'controller',   to: 'systolicArray', label: 'dispatch' },
  { from: 'controller',   to: 'sram',          label: 'load/store' },
  { from: 'sram',         to: 'systolicArray',  label: 'weight/input' },
  { from: 'dram',         to: 'sram',           label: 'fill' },
  { from: 'systolicArray', to: 'analysis',      label: 'results' },
]

function center(n: Node): [number, number] { return [n.x + n.w / 2, n.y + n.h / 2] }

// PCB-style right-angle path (vertical then horizontal)
function pcbPath(fromN: Node, toN: Node): string {
  const [x1, y1] = center(fromN)
  const [x2, y2] = center(toN)
  const midY = (y1 + y2) / 2
  return `M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}`
}

export default function ArchitectureHall() {
  const t = useTranslations('architecture')
  const [selected, setSelected] = useState<CKey | null>(null)
  const [hovered, setHovered] = useState<CKey | null>(null)

  const active = hovered || selected
  const activeNode = NODES.find(n => n.key === active)

  return (
    <div className="bg-background min-h-screen relative">
      {/* PCB grid background */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(16,185,129,0.06) 0.5px, transparent 0.5px)',
        backgroundSize: '20px 20px',
      }} />

      {/* ── Section A: 도입 ── */}
      <section className="hall-section flex items-center justify-center px-6 relative z-10">
        <div className="max-w-4xl w-full text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-0.5 h-6 rounded-full" style={{ backgroundColor: '#8B5CF6' }} />
              <p className="text-text-muted text-sm font-mono tracking-widest uppercase">Hall 7 — Architecture</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
              {t('title')}
            </h1>
            <p className="text-text-muted text-xl max-w-2xl mx-auto mb-6 whitespace-pre-line">
              {t('subtitle')}
            </p>
            <p className="text-text-muted text-sm">{t('clickHint')}</p>
          </ScrollReveal>
          <div className="mt-8">
            <ScrollGuide hideAfterIndex={0} />
          </div>
        </div>
      </section>

      {/* ── Section B: Interactive Diagram ── */}
      <section className="hall-section hall-section-alt px-4 sm:px-6 pt-8 pb-16 relative z-10">
        <div className="max-w-6xl w-full mx-auto">
          <ScrollReveal>
            <div className="bg-surface1 border border-border rounded-2xl p-4 sm:p-6 mb-6 overflow-x-auto">
              <div className="min-w-[480px]">
                <svg viewBox="0 0 800 460" className="w-full">
                  <defs>
                    <marker id="pcb-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill="#3F3F46" />
                    </marker>
                    <marker id="pcb-arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill="#FAFAFA" />
                    </marker>
                  </defs>

                  {/* PCB traces (arrows) */}
                  {ARROWS.map(({ from, to, label }, i) => {
                    const fromN = NODES.find(n => n.key === from)!
                    const toN = NODES.find(n => n.key === to)!
                    const isActive = active && (from === active || to === active)
                    const d = pcbPath(fromN, toN)
                    return (
                      <g key={i}>
                        <path
                          d={d}
                          fill="none"
                          stroke={isActive ? '#FAFAFA' : '#3F3F4680'}
                          strokeWidth={isActive ? 2.5 : 1.5}
                          strokeLinejoin="round"
                          markerEnd={isActive ? 'url(#pcb-arrow-active)' : 'url(#pcb-arrow)'}
                          className="transition-all duration-300"
                        >
                          <animate attributeName="stroke-dashoffset" from="20" to="0" dur="2s" repeatCount="indefinite" />
                        </path>
                        {/* Label on connection */}
                        {label && isActive && (() => {
                          const [x1, y1] = center(fromN)
                          const [x2, y2] = center(toN)
                          return (
                            <text x={(x1+x2)/2 + 8} y={(y1+y2)/2 - 6}
                              fill="#A1A1AA" fontSize="9" fontFamily="monospace">
                              {label}
                            </text>
                          )
                        })()}
                      </g>
                    )
                  })}

                  {/* Component nodes — IC chip style */}
                  {NODES.map((node, ni) => {
                    const isSelected = active === node.key
                    const isDimmed = active && !isSelected
                    return (
                      <g
                        key={node.key}
                        className="cursor-pointer"
                        onClick={() => setSelected(isSelected && !hovered ? null : node.key)}
                        onMouseEnter={() => setHovered(node.key)}
                        onMouseLeave={() => setHovered(null)}
                        style={{ transform: `translate(${node.x + node.w/2}px, ${node.y + node.h/2}px)` }}
                      >
                        {/* Glow effect */}
                        {isSelected && (
                          <rect
                            x={-node.w/2 - 3} y={-node.h/2 - 3}
                            width={node.w + 6} height={node.h + 6}
                            rx="14" fill="none"
                            stroke={node.color} strokeWidth="1" opacity="0.3"
                          />
                        )}
                        {/* Main rect */}
                        <rect
                          x={-node.w/2} y={-node.h/2} width={node.w} height={node.h}
                          rx="12"
                          fill={isSelected ? node.color + '25' : '#18181B'}
                          stroke={node.color}
                          strokeWidth={isSelected ? 2 : 1}
                          opacity={isDimmed ? 0.3 : 1}
                          className="transition-all duration-200"
                        />
                        {/* Icon + Name */}
                        <text x={0} y={-4} textAnchor="middle"
                          fill={node.color} fontSize="16" opacity={isDimmed ? 0.3 : 1}>
                          {node.icon}
                        </text>
                        <text x={0} y={16} textAnchor="middle"
                          fill={isSelected ? '#FAFAFA' : node.color}
                          fontSize="12" fontWeight="600"
                          opacity={isDimmed ? 0.3 : 1}
                          className="transition-all duration-200">
                          {t(`components.${node.key}.name` as any)}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          </ScrollReveal>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.25 }}
              >
                <InfoPanel variant="highlight">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div
                      className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-2xl border"
                      style={{ backgroundColor: activeNode?.color + '15', borderColor: activeNode?.color + '30' }}
                    >
                      {activeNode?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold mb-2" style={{ color: activeNode?.color }}>
                        {t(`components.${active}.name` as any)}
                      </h3>
                      <p className="text-text-muted text-sm leading-relaxed">
                        {t(`components.${active}.desc` as any)}
                      </p>
                      <div className="mt-4 pt-3 border-t border-border/50">
                        <p className="text-xs text-text-muted font-mono">
                          accsim/{activeNode?.path}
                        </p>
                      </div>
                    </div>
                  </div>
                </InfoPanel>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-surface1/50 border border-border/50 rounded-2xl p-6 flex items-center justify-center"
              >
                <p className="text-text-muted text-sm">{t('clickHint')}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <NextHallButton currentHall="architecture" />
        </div>
      </section>
    </div>
  )
}
