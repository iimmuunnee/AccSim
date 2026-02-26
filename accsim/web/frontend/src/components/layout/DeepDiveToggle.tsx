'use client'
import { useTranslations } from 'next-intl'

interface Props {
  enabled: boolean
  onChange: (v: boolean) => void
}

export default function DeepDiveToggle({ enabled, onChange }: Props) {
  const t = useTranslations('common')
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 text-sm ${
        enabled
          ? 'border-accent-amber text-accent-amber bg-accent-amber/10'
          : 'border-border text-text-muted hover:border-accent-amber hover:text-accent-amber'
      }`}
    >
      <span className="w-4 h-4 flex items-center justify-center text-xs">
        {enabled ? '▼' : '▶'}
      </span>
      {t('deepDive')}
    </button>
  )
}
