import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import HallNav from '@/components/layout/HallNav'
import LangToggle from '@/components/layout/LangToggle'
import LevelIndicator from '@/components/layout/LevelIndicator'
import ScrollContainer from '@/components/layout/ScrollContainer'
import SectionProgress from '@/components/layout/SectionProgress'

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
        <div className="fixed top-3 right-3 sm:top-4 sm:right-6 z-50 flex items-center gap-1.5 sm:gap-2">
          <LevelIndicator />
          <LangToggle locale={locale} />
        </div>
        <SectionProgress />
        <ScrollContainer>{children}</ScrollContainer>
      </div>
    </NextIntlClientProvider>
  )
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
