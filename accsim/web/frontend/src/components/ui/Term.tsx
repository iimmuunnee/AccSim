'use client'
import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { glossary } from '@/lib/glossary'
import Nl2Br from './Nl2Br'
import { useKnowledgeLevel } from '@/stores/useKnowledgeLevel'

interface Props {
  id: string
  children: React.ReactNode
}

export default function Term({ id, children }: Props) {
  const [show, setShow] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  const params = useParams()
  const locale = (params.locale as string) || 'ko'
  const { level } = useKnowledgeLevel()

  const handleMouseEnter = useCallback(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect())
    }
    setShow(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setShow(false)
  }, [])

  const entry = glossary[id]
  if (!entry) return <>{children}</>

  const lang = locale === 'en' ? 'en' : 'ko'
  const def = entry.definition[level][lang]
  const analogy = level === 'beginner' && entry.analogy ? entry.analogy[lang] : null

  const tooltip = (
    <AnimatePresence>
      {show && rect && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            left: rect.left + rect.width / 2,
            top: rect.top - 8,
            transform: 'translateX(-50%) translateY(-100%)',
          }}
          className="z-[9999] w-72 bg-surface-tooltip border-2 border-border-tooltip rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.7)] pointer-events-none"
        >
          <p className="text-xs font-bold text-accent-blue mb-1.5 tracking-wide">
            {entry.term[lang]}
          </p>
          <p className="text-sm text-text-primary/90 leading-relaxed"><Nl2Br text={def} /></p>
          {analogy && (
            <p className="text-xs text-accent-amber mt-2.5 leading-relaxed italic">
              <Nl2Br text={analogy} />
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <span
      ref={ref}
      className="relative inline-block border-b border-dotted border-accent-blue/50 cursor-help"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </span>
  )
}
