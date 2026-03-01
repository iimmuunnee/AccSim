import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type KnowledgeLevel = 'beginner' | 'intermediate' | 'expert'

interface State {
  level: KnowledgeLevel
  setLevel: (level: KnowledgeLevel) => void
}

export const useKnowledgeLevel = create<State>()(
  persist(
    (set) => ({
      level: 'intermediate',
      setLevel: (level) => set({ level }),
    }),
    { name: 'accsim-knowledge-level' }
  )
)
