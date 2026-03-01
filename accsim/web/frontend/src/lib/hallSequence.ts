export const HALL_SEQUENCE = [
  'intro',
  'level',
  'accelerator',
  'chip',
  'simulator',
  'execution',
  'lab',
  'architecture',
  'demo',
  'about',
] as const

export type HallKey = (typeof HALL_SEQUENCE)[number]

export function getNextHall(current: string): string | null {
  const idx = HALL_SEQUENCE.indexOf(current as HallKey)
  if (idx === -1 || idx >= HALL_SEQUENCE.length - 1) return null
  return HALL_SEQUENCE[idx + 1]
}

export function getPrevHall(current: string): string | null {
  const idx = HALL_SEQUENCE.indexOf(current as HallKey)
  if (idx <= 0) return null
  return HALL_SEQUENCE[idx - 1]
}
