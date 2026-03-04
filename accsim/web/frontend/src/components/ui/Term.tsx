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

  const updateRect = useCallback(() => {
    if (ref.current) setRect(ref.current.getBoundingClientRect())
  }, [])

  const handleMouseEnter = useCallback(() => { updateRect(); setShow(true) }, [updateRect])
  const handleMouseLeave = useCallback(() => { setShow(false) }, [])
  const handleFocus = useCallback(() => { updateRect(); setShow(true) }, [updateRect])
  const handleBlur = useCallback(() => { setShow(false) }, [])

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
      tabIndex={0}
      role="term"
      className={[
        // 레이아웃
        'relative inline-block cursor-pointer',
        // pill 배경 (기본: 은은 / hover: 진해짐)
        'rounded px-1 -mx-1',
        show ? 'bg-accent-blue/[0.16]' : 'bg-accent-blue/[0.08]',
        // 점선 밑줄 (기본: 보이는 dotted / hover: transparent → animated로 교체)
        'underline underline-offset-[3px] decoration-[1.5px]',
        show ? 'decoration-transparent' : 'decoration-dotted decoration-accent-blue/40',
        // 텍스트 컬러
        show ? 'text-accent-blue' : 'text-accent-blue/90',
        // 트랜지션 (color, background-color, text-decoration-color 포함)
        'transition-colors duration-200',
        // 포커스 링
        'outline-none focus-visible:ring-1 focus-visible:ring-accent-blue/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background',
      ].join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      {/* Animated underline: hover/focus 시 좌→우 그려짐 (점선 밑줄을 대체) */}
      <motion.span
        className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-accent-blue rounded-full origin-left"
        initial={false}
        animate={{ scaleX: show ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </span>
  )
}
