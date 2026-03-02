'use client'
import { useState, useRef, useEffect } from 'react'
import { useKnowledgeLevel, type KnowledgeLevel } from '@/stores/useKnowledgeLevel'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

const LEVEL_LABEL: Record<KnowledgeLevel, { ko: string; en: string; color: string }> = {
  beginner:     { ko: '일반인',  en: 'Beginner',     color: '#10B981' },
  intermediate: { ko: '관심자',  en: 'Intermediate',  color: '#3B82F6' },
  expert:       { ko: '전문가',  en: 'Expert',        color: '#8B5CF6' },
}

const LEVELS: KnowledgeLevel[] = ['beginner', 'intermediate', 'expert']

export default function LevelIndicator() {
  const { level, setLevel } = useKnowledgeLevel()
  const params = useParams()
  const locale = (params.locale as string) || 'ko'
  const lang = locale === 'en' ? 'en' : 'ko'
  const t = useTranslations('level')

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 외부 클릭 닫힘
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // ESC 키 닫힘
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const info = LEVEL_LABEL[level]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface1 border border-border hover:border-accent-blue/50 transition-all duration-200 text-xs cursor-pointer"
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: info.color }}
        />
        <span className="text-text-muted">{info[lang]}</span>
        <svg
          className={`w-3 h-3 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-60 bg-surface1 border border-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            {LEVELS.map((key) => {
              const item = LEVEL_LABEL[key]
              const isSelected = key === level
              return (
                <button
                  key={key}
                  onClick={() => { setLevel(key); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 cursor-pointer ${
                    isSelected ? 'bg-surface2' : 'hover:bg-surface2'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isSelected ? 'text-text-primary' : 'text-text-muted'}`}>
                        {item[lang]}
                      </span>
                      {isSelected && (
                        <span className="text-xs" style={{ color: item.color }}>&#10003;</span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted/70 mt-0.5 truncate">
                      {t(`${key}.desc`)}
                    </p>
                  </div>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
