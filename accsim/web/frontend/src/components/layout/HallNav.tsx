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

  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
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
        )
      })}
    </nav>
  )
}
