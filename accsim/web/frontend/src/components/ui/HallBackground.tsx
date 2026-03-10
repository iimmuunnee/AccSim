'use client'

import { useRef, useEffect, useState } from 'react'

/** Hall별 테마 색상 → 미세한 radial glow */
const HALL_COLORS: Record<string, string> = {
  intro:        '59,130,246',   // blue
  accelerator:  '59,130,246',   // blue
  chip:         '6,182,212',    // cyan
  simulator:    '59,130,246',   // blue
  execution:    '99,102,241',   // indigo
  lab:          '245,158,11',   // amber
  architecture: '139,92,246',   // purple
  demo:         '245,158,11',   // amber (SolarX)
  about:        '59,130,246',   // blue
}

interface HallBackgroundProps {
  hall?: string
  /** Override glow opacity (0~1). Default varies by hall. */
  glowOpacity?: number
}

export default function HallBackground({ hall = 'intro', glowOpacity }: HallBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const rgb = HALL_COLORS[hall] || HALL_COLORS.intro
  const opacity = glowOpacity ?? 0.10

  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        background: visible
          ? `radial-gradient(ellipse at 30% 40%, rgba(${rgb},${opacity}), transparent 80%), radial-gradient(ellipse at 75% 70%, rgba(${rgb},${opacity * 0.5}), transparent 70%)`
          : 'transparent',
        transition: 'background 0.8s ease',
      }}
    />
  )
}
