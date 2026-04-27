import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 수면 효율 계산 (%) */
export function calcSleepEfficiency(
  bedtime: string,          // "23:30"
  wakeTime: string,         // "06:00"
  onsetLatency: string,     // "10~30분"
  awakeningCount: string,   // "1회"
): number {
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)

  let bedMinutes = bh * 60 + bm
  let wakeMinutes = wh * 60 + wm
  if (wakeMinutes <= bedMinutes) wakeMinutes += 24 * 60

  const timeInBed = wakeMinutes - bedMinutes

  const latencyMap: Record<string, number> = {
    '0~10분': 5, '10~30분': 20, '30~60분': 45, '60분 이상': 75,
  }
  const awakeMap: Record<string, number> = {
    '없음': 0, '1회': 20, '2회': 40, '3회 이상': 60,
  }

  const latency = latencyMap[onsetLatency] ?? 0
  const awake = awakeMap[awakeningCount] ?? 0
  const actualSleep = Math.max(0, timeInBed - latency - awake)

  return Math.round((actualSleep / timeInBed) * 100)
}

/** ISI 단계 반환 */
export function getIsiLevel(score: number) {
  if (score <= 7)  return { label: '없음',  color: 'text-green-600',  bg: 'bg-green-50' }
  if (score <= 14) return { label: '경미',  color: 'text-yellow-600', bg: 'bg-yellow-50' }
  if (score <= 21) return { label: '중등도', color: 'text-orange-600', bg: 'bg-orange-50' }
  return             { label: '심각',  color: 'text-red-600',    bg: 'bg-red-50' }
}

/** 수면 효율 단계 반환 */
export function getSleepEfficiencyLevel(pct: number) {
  if (pct >= 85) return { label: '정상', color: '#22C55E' }
  if (pct >= 70) return { label: '주의', color: '#EAB308' }
  return           { label: '불량', color: '#EF4444' }
}
