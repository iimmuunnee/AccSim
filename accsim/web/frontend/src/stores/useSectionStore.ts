import { create } from 'zustand'

interface SectionState {
  currentIndex: number
  prevIndex: number
  totalSections: number
  sectionProgress: number
  isSectionScrollable: boolean
  scrollToIndexFn: ((index: number) => void) | null
  setCurrentIndex: (index: number) => void
  setTotalSections: (total: number) => void
  setSectionProgress: (progress: number) => void
  setIsSectionScrollable: (v: boolean) => void
  setScrollToIndexFn: (fn: (index: number) => void) => void
}

export const useSectionStore = create<SectionState>((set, get) => ({
  currentIndex: 0,
  prevIndex: 0,
  totalSections: 0,
  sectionProgress: 0,
  isSectionScrollable: false,
  scrollToIndexFn: null,
  setCurrentIndex: (index: number) => {
    const prev = get().currentIndex
    if (prev !== index) set({ prevIndex: prev, currentIndex: index })
  },
  setTotalSections: (total: number) => set({ totalSections: total }),
  setSectionProgress: (progress: number) => {
    const quantized = Math.round(progress * 100) / 100
    if (get().sectionProgress !== quantized) set({ sectionProgress: quantized })
  },
  setIsSectionScrollable: (v: boolean) => {
    if (get().isSectionScrollable !== v) set({ isSectionScrollable: v })
  },
  setScrollToIndexFn: (fn: (index: number) => void) => set({ scrollToIndexFn: fn }),
}))
