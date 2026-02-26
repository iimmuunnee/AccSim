'use client'

interface Props {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  displayValue?: string
}

export default function Slider({ label, value, min, max, step = 1, onChange, displayValue }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-text-muted">{label}</label>
        <span className="text-sm font-mono text-accent-blue">
          {displayValue ?? value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-surface2 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-accent-blue
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-125"
        style={{
          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((value - min) / (max - min)) * 100}%, #27272A ${((value - min) / (max - min)) * 100}%, #27272A 100%)`,
        }}
      />
    </div>
  )
}
