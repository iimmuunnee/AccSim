'use client'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useKnowledgeLevel, type KnowledgeLevel } from '@/stores/useKnowledgeLevel'

const LEVELS: { key: KnowledgeLevel; icon: string; color: string }[] = [
  { key: 'beginner', icon: '🌱', color: '#10B981' },
  { key: 'intermediate', icon: '🔍', color: '#3B82F6' },
  { key: 'expert', icon: '⚙', color: '#8B5CF6' },
]

export default function LevelSelect() {
  const t = useTranslations('level')
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const { setLevel } = useKnowledgeLevel()

  const handleSelect = (level: KnowledgeLevel) => {
    setLevel(level)
    router.push(`/${locale}/accelerator`)
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            {t('title')}
          </h1>
          <p className="text-text-muted text-lg mb-16">{t('subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LEVELS.map((lvl, i) => (
            <motion.button
              key={lvl.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(lvl.key)}
              className="bg-surface1 border border-border rounded-2xl p-8 text-left hover:border-opacity-80 transition-all duration-300 cursor-pointer group"
              style={{ '--hover-color': lvl.color } as React.CSSProperties}
            >
              <div className="text-4xl mb-4">{lvl.icon}</div>
              <h3
                className="text-xl font-bold mb-2 transition-colors duration-200"
                style={{ color: lvl.color }}
              >
                {t(`${lvl.key}.name` as any)}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {t(`${lvl.key}.desc` as any)}
              </p>
              <div
                className="mt-6 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: lvl.color }}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
