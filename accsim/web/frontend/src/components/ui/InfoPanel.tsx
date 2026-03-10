'use client'

import { ReactNode } from 'react'

interface InfoPanelProps {
  children: ReactNode
  variant?: 'default' | 'highlight' | 'warning'
  className?: string
}

const VARIANTS = {
  default: {
    border: 'border-white/[0.08]',
    accent: '',
  },
  highlight: {
    border: 'border-white/[0.08] border-l-accent-blue border-l-2',
    accent: '',
  },
  warning: {
    border: 'border-amber-500/20 border-l-amber-500 border-l-2',
    accent: '',
  },
}

export default function InfoPanel({ children, variant = 'default', className = '' }: InfoPanelProps) {
  const v = VARIANTS[variant]
  return (
    <div
      className={`bg-white/[0.04] backdrop-blur-md border ${v.border} rounded-2xl p-6 shadow-lg ${className}`}
    >
      {children}
    </div>
  )
}
