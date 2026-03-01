import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import HallNav from '@/components/layout/HallNav'
import LangToggle from '@/components/layout/LangToggle'
import LevelIndicator from '@/components/layout/LevelIndicator'

const locales = ['ko', 'en']

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale)) notFound()

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="relative">
        <HallNav locale={locale} />
        <div className="fixed top-4 right-6 z-50 flex items-center gap-2">
          <LevelIndicator />
          <LangToggle locale={locale} />
        </div>
        <main>{children}</main>
      </div>
    </NextIntlClientProvider>
  )
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
