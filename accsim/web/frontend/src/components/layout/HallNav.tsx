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
    <nav className="fixed left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {/* 수준 선택 버튼 — 맨 위 */}
      <button
        onClick={() => setLevel(LEVEL_CYCLE[level])}
        title={t('hallNames.level')}
        className="group flex items-center gap-2 mb-2 cursor-pointer"
      >
        <div
          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 group-hover:scale-150"
          style={{ backgroundColor: LEVEL_COLOR[level] }}
        />
        <span
          className="text-xs font-sans opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
          style={{ color: LEVEL_COLOR[level] }}
        >
          {t('hallNames.level')}
        </span>
      </button>

      {/* Hall 목록 */}
      {HALLS.map((hall) => {
        const href = `/${locale}/${hall.key}`
        const isActive = pathname === href || pathname.startsWith(href + '/')

        return (
          <Link
            key={hall.key}
            href={href}
            title={t(`hallNames.${hall.key}`)}
            className="group flex items-center gap-2"
          >
            {isActive ? (
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all duration-300"
                style={{
                  borderColor: LEVEL_COLOR[level] + '66',
                  backgroundColor: LEVEL_COLOR[level] + '1A',
                }}
              >
                <span
                  className="text-[10px] sm:text-xs font-semibold tracking-wider whitespace-nowrap"
                  style={{ color: LEVEL_COLOR[level] }}
                >
                  HALL {hall.label}
                </span>
              </div>
            ) : (
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 bg-text-muted opacity-40 group-hover:opacity-80" />
            )}
            <span
              className={`text-sm font-sans font-medium leading-none transition-opacity whitespace-nowrap ${
                isActive
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 text-text-muted'
              }`}
              style={isActive ? { color: LEVEL_COLOR[level] } : undefined}
            >
              {t(`hallNames.${hall.key}`)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
