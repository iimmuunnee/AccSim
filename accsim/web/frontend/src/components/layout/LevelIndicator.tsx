'use client'
import { useKnowledgeLevel, type KnowledgeLevel } from '@/stores/useKnowledgeLevel'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const LEVEL_LABEL: Record<KnowledgeLevel, { ko: string; en: string; color: string }> = {
  beginner: { ko: '일반인', en: 'Beginner', color: '#10B981' },
  intermediate: { ko: '관심자', en: 'Intermediate', color: '#3B82F6' },
  expert: { ko: '전문가', en: 'Expert', color: '#8B5CF6' },
}

export default function LevelIndicator() {
  const { level } = useKnowledgeLevel()
  const params = useParams()
  const locale = (params.locale as string) || 'ko'
  const lang = locale === 'en' ? 'en' : 'ko'

  const info = LEVEL_LABEL[level]

  return (
    <Link
      href={`/${locale}/level`}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface1 border border-border hover:border-accent-blue/50 transition-all duration-200 text-xs"
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: info.color }}
      />
      <span className="text-text-muted">{info[lang]}</span>
    </Link>
  )
}
