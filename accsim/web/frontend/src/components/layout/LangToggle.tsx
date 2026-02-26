'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function LangToggle({ locale }: { locale: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('nav')

  const toggle = () => {
    const newLocale = locale === 'ko' ? 'en' : 'ko'
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 rounded-full border border-border text-text-muted text-sm font-mono hover:border-accent-blue hover:text-accent-blue transition-all duration-200"
    >
      {t('langToggle')}
    </button>
  )
}
