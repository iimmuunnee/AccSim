'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { glossary } from '@/lib/glossary'
import { useKnowledgeLevel } from '@/stores/useKnowledgeLevel'

interface Props {
  id: string
  children: React.ReactNode
}

export default function Term({ id, children }: Props) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const params = useParams()
  const locale = (params.locale as string) || 'ko'
  const { level } = useKnowledgeLevel()

  const entry = glossary[id]
  if (!entry) return <>{children}</>

  const lang = locale === 'en' ? 'en' : 'ko'
  const def = entry.definition[level][lang]
  const analogy = level === 'beginner' && entry.analogy ? entry.analogy[lang] : null

  return (
    <span
      ref={ref}
      className="relative inline-block border-b border-dotted border-accent-blue/50 cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 bg-surface2 border border-border rounded-lg p-3 shadow-xl pointer-events-none"
          >
            <p className="text-xs font-semibold text-accent-blue mb-1">
              {entry.term[lang]}
            </p>
            <p className="text-xs text-text-muted leading-relaxed">{def}</p>
            {analogy && (
              <p className="text-xs text-accent-amber mt-2 leading-relaxed">
                {analogy}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
