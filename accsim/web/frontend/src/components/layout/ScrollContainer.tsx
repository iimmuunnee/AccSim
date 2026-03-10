'use client'

import { useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useSectionStore } from '@/stores/useSectionStore'

export default function ScrollContainer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const pathname = usePathname()

  const scrollToIndex = useCallback((index: number) => {
    const container = ref.current
    if (!container) return
    const sections = container.querySelectorAll<HTMLElement>('.hall-section')
    if (index < 0 || index >= sections.length) return
    sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // Reset scroll on pathname change
  useEffect(() => {
    window.scrollTo(0, 0)
    useSectionStore.getState().setCurrentIndex(0)
  }, [pathname])

  // Scroll progress tracking
  useEffect(() => {
    let rafId = 0
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const container = ref.current
        if (!container) return
        const sections = container.querySelectorAll<HTMLElement>('.hall-section')
        const idx = useSectionStore.getState().currentIndex
        const section = sections[idx]
        if (!section) return
        const rect = section.getBoundingClientRect()
        const scrollable = Math.max(section.offsetHeight - window.innerHeight, 1)
        const scrolled = Math.max(-rect.top, 0)
        const progress = Math.min(scrolled / scrollable, 1)
        useSectionStore.getState().setSectionProgress(progress)
        const isScrollable = section.offsetHeight > window.innerHeight + 50
        useSectionStore.getState().setIsSectionScrollable(isScrollable)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // IntersectionObserver for section visibility + MutationObserver for count
  useEffect(() => {
    const container = ref.current
    if (!container) return

    const updateCount = () => {
      const count = container.querySelectorAll('.hall-section').length
      useSectionStore.getState().setTotalSections(count)
    }
    updateCount()

    useSectionStore.getState().setScrollToIndexFn(scrollToIndex)

    // Track which section is most visible
    const visibilityMap = new Map<Element, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibilityMap.set(entry.target, entry.intersectionRatio)
        }

        // Find the section with highest visibility
        const sections = Array.from(container.querySelectorAll('.hall-section'))
        let maxRatio = 0
        let maxIdx = 0
        sections.forEach((section, i) => {
          const ratio = visibilityMap.get(section) ?? 0
          if (ratio > maxRatio) {
            maxRatio = ratio
            maxIdx = i
          }
        })

        if (maxRatio > 0) {
          useSectionStore.getState().setCurrentIndex(maxIdx)
          const activeSection = sections[maxIdx] as HTMLElement
          if (activeSection) {
            const isScrollable = activeSection.offsetHeight > window.innerHeight + 50
            useSectionStore.getState().setIsSectionScrollable(isScrollable)
          }
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0] }
    )

    const sections = container.querySelectorAll('.hall-section')
    sections.forEach((section) => observer.observe(section))

    // MutationObserver for dynamic children
    const mutationObserver = new MutationObserver(() => {
      updateCount()
      // Re-observe sections
      observer.disconnect()
      const newSections = container.querySelectorAll('.hall-section')
      newSections.forEach((section) => observer.observe(section))
    })
    mutationObserver.observe(container, { childList: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [scrollToIndex])

  return (
    <main ref={ref}>
      {children}
    </main>
  )
}
