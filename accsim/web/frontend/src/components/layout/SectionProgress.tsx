'use client'

import { useSectionStore } from '@/stores/useSectionStore'
import { motion } from 'framer-motion'

export default function SectionProgress() {
  const { currentIndex, totalSections, scrollToIndexFn } = useSectionStore()

  if (totalSections <= 1) return null

  return (
    <nav
      className="fixed right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1 sm:gap-1.5"
      aria-label="Section progress"
    >
      {/* Vertical connecting line */}
      <div className="absolute inset-y-0 w-px bg-white/[0.06]" />

      {Array.from({ length: totalSections }, (_, i) => {
        const isActive = i === currentIndex
        return (
          <button
            key={i}
            onClick={() => scrollToIndexFn?.(i)}
            className="relative z-10 p-1 group"
            aria-label={`Section ${i + 1}`}
            aria-current={isActive ? 'step' : undefined}
          >
            <motion.div
              className={`rounded-full ${isActive ? 'dot-glow' : ''}`}
              animate={{
                width: isActive ? 6 : 4,
                height: isActive ? 6 : 4,
                backgroundColor: isActive ? '#3B82F6' : 'rgba(161,161,170,0.4)',
                scale: isActive ? 1.3 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          </button>
        )
      })}
    </nav>
  )
}
