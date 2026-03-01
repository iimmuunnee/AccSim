import { useTranslations } from 'next-intl'
import { useKnowledgeLevel } from '@/stores/useKnowledgeLevel'

export function useLevelText(namespace: string) {
  const t = useTranslations(namespace)
  const { level } = useKnowledgeLevel()

  return (key: string, params?: Record<string, string>) => {
    if (level === 'intermediate') return t(key as any, params)
    const lvlKey = `${key}_${level}`
    try {
      const val = t(lvlKey as any, params)
      return val === lvlKey ? t(key as any, params) : val
    } catch {
      return t(key as any, params)
    }
  }
}
