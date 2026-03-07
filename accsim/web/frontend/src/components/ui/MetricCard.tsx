'use client'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface Props {
  title: string
  value: string | number
  unit?: string
  subtitle?: string
  variant?: 'default' | 'good' | 'bad' | 'amber'
  delay?: number
}

export default function MetricCard({ title, value, unit, subtitle, variant = 'default', delay = 0 }: Props) {
  const accentColor = {
    default: 'text-accent-blue',
    good: 'text-data-green',
    bad: 'text-data-red',
    amber: 'text-accent-amber',
  }[variant]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-surface1 border border-border rounded-xl p-6"
    >
      <p className="text-text-muted text-sm font-medium mb-2 text-center">{title}</p>
      <div className="flex items-end justify-center gap-1">
        <span className={clsx('text-3xl font-bold font-mono', accentColor)}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-text-muted text-sm mb-1">{unit}</span>}
      </div>
      {subtitle && <p className="text-text-muted text-xs mt-2 text-center">{subtitle}</p>}
    </motion.div>
  )
}
