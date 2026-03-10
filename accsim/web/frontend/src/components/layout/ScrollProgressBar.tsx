'use client'

import { useSectionStore } from '@/stores/useSectionStore'

export default function ScrollProgressBar() {
  const progress = useSectionStore((s) => s.sectionProgress)
  const isScrollable = useSectionStore((s) => s.isSectionScrollable)

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none"
      style={{
        opacity: isScrollable ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        className="h-full bg-[#3B82F6] origin-left"
        style={{
          transform: `scaleX(${progress})`,
          boxShadow: '0 0 6px rgba(59,130,246,0.6), 0 0 12px rgba(59,130,246,0.3)',
          transition: 'transform 0.1s linear',
        }}
      />
    </div>
  )
}
