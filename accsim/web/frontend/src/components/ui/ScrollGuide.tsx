'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useSectionStore } from '@/stores/useSectionStore'

interface ScrollGuideProps {
  /** Hide when currentIndex exceeds this value (default: 0 = first section) */
  hideAfterIndex?: number
}

export default function ScrollGuide({ hideAfterIndex = 0 }: ScrollGuideProps) {
  const t = useTranslations('common')
  const currentIndex = useSectionStore((s) => s.currentIndex)
  const [timedOut, setTimedOut] = useState(false)

  // 5-second auto-fade
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  const visible = currentIndex <= hideAfterIndex && !timedOut

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-2 py-6 text-text-muted"
        >
          <span className="text-xs tracking-widest uppercase">{t('scrollGuide')}</span>
          <motion.svg
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
