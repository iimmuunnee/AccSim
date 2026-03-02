'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useKnowledgeLevel, type KnowledgeLevel } from '@/stores/useKnowledgeLevel'

const LEVEL_CYCLE: Record<KnowledgeLevel, KnowledgeLevel> = {
  beginner: 'intermediate',
  intermediate: 'expert',
  expert: 'beginner',
}

const LEVEL_COLOR: Record<KnowledgeLevel, string> = {
  beginner: '#10B981',
  intermediate: '#3B82F6',
  expert: '#8B5CF6',
}

const HALLS = [
  { key: 'intro', label: '1' },
  { key: 'accelerator', label: '2' },
  { key: 'chip', label: '3' },
  { key: 'simulator', label: '4' },
  { key: 'execution', label: '5' },
  { key: 'lab', label: '6' },
  { key: 'architecture', label: '7' },
  { key: 'demo', label: '8' },
  { key: 'about', label: '9' },
]

export default function HallNav({ locale }: { locale: string }) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const { level, setLevel } = useKnowledgeLevel()

  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {HALLS.map((hall, i) => {
        const href = `/${locale}/${hall.key}`
        const isActive = pathname === href || pathname.startsWith(href + '/')

        // Insert a separator dot before Hall 2 (for level page)
        const showLevelDot = i === 1

        return (
          <div key={hall.key}>
            {showLevelDot && (
              <button
                onClick={() => setLevel(LEVEL_CYCLE[level])}
                title={t('hallNames.level')}
                className="group flex items-center gap-2 mb-3 cursor-pointer"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover:scale-150"
                  style={{ backgroundColor: LEVEL_COLOR[level] }}
                />
                <span
                  className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-text-muted"
                >
                  {t('hallNames.level')}
                </span>
              </button>
            )}
            <Link
              href={href}
              title={t(`hallNames.${hall.key}`)}
              className="group flex items-center gap-2"
              style={{ '--level-color': LEVEL_COLOR[level] } as React.CSSProperties}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'scale-150'
                    : 'bg-text-muted opacity-40 group-hover:opacity-80 group-hover:[background-color:var(--level-color)]'
                }`}
                style={isActive ? { backgroundColor: LEVEL_COLOR[level] } : undefined}
              />
              <span
                className={`text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
                  isActive ? 'opacity-100' : 'text-text-muted group-hover:[color:var(--level-color)]'
                }`}
                style={isActive ? { color: LEVEL_COLOR[level] } : undefined}
              >
                {t(`hallNames.${hall.key}`)}
              </span>
            </Link>
          </div>
        )
      })}
    </nav>
  )
}
