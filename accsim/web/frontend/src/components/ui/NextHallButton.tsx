'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { getNextHall, HALL_NUMBER } from '@/lib/hallSequence'
import { motion } from 'framer-motion'

interface Props {
  currentHall: string
}

export default function NextHallButton({ currentHall }: Props) {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('common')
  const nav = useTranslations('nav')

  const nextHall = getNextHall(currentHall)

  // Last hall — show "End Exhibition" button
  if (!nextHall) {
    return (
      <div className="flex justify-center py-12">
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
          <Link
            href={`/${locale}/intro`}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-accent-amber text-accent-amber hover:bg-accent-amber hover:text-white transition-all duration-200"
          >
            <span className="font-semibold">{t('exitExhibition')}</span>
          </Link>
        </motion.div>
      </div>
    )
  }

  if (nextHall === 'level') {
    // Skip 'level' as a next target since it's a selection page
    const afterLevel = getNextHall('level')
    if (!afterLevel) return null
    return (
      <div className="flex justify-center py-12">
        <motion.div whileHover={{ x: 6 }} transition={{ duration: 0.2 }}>
          <Link
            href={`/${locale}/${afterLevel}`}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-border text-text-muted hover:border-accent-blue hover:text-accent-blue transition-all duration-200"
          >
            <span className="text-sm font-mono">HALL {HALL_NUMBER[afterLevel]}</span>
            <span className="font-semibold">{nav(`hallNames.${afterLevel}` as any)}</span>
            <span className="text-xl">→</span>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex justify-center py-12">
      <motion.div whileHover={{ x: 6 }} transition={{ duration: 0.2 }}>
        <Link
          href={`/${locale}/${nextHall}`}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-border text-text-muted hover:border-accent-blue hover:text-accent-blue transition-all duration-200"
        >
          <span className="text-sm font-mono">HALL {HALL_NUMBER[nextHall]}</span>
          <span className="font-semibold">{nav(`hallNames.${nextHall}` as any)}</span>
          <span className="text-xl">→</span>
        </Link>
      </motion.div>
    </div>
  )
}
