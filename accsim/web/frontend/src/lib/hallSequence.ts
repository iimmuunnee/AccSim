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

export const HALL_NUMBER: Record<string, number> = {
  intro: 1,
  accelerator: 2,
  chip: 3,
  simulator: 4,
  execution: 5,
  lab: 6,
  architecture: 7,
  demo: 8,
  about: 9,
}

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
