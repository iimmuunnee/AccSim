'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

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

  const isLevelPage = pathname.includes('/level')

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
              <Link
                href={`/${locale}/level`}
                title={t('hallNames.level')}
                className="group flex items-center gap-2 mb-3"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    isLevelPage
                      ? 'bg-accent-blue scale-150'
                      : 'bg-text-muted opacity-30 group-hover:opacity-60 group-hover:bg-accent-blue'
                  }`}
                />
                <span
                  className={`text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
                    isLevelPage ? 'text-accent-blue opacity-100' : 'text-text-muted'
                  }`}
                >
                  {t('hallNames.level')}
                </span>
              </Link>
            )}
            <Link
              href={href}
              title={t(`hallNames.${hall.key}`)}
              className="group flex items-center gap-2"
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-accent-blue scale-150'
                    : 'bg-text-muted opacity-40 group-hover:opacity-80 group-hover:bg-accent-blue'
                }`}
              />
              <span
                className={`text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
                  isActive ? 'text-accent-blue opacity-100' : 'text-text-muted'
                }`}
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
