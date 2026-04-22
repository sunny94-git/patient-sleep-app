'use client'

import { useState } from 'react'
import { calcSleepEfficiency, getSleepEfficiencyLevel, getISISeverity, type ISISeverity, type SleepEfficiencyLevel } from '@/types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DiaryRecord {
  id: string
  diary_date: string
  bedtime: string | null
  wake_time: string | null
  sleep_onset_latency: string | null
  night_awakening_count: string | null
  sleep_quality: number | null
  morning_fatigue: number | null
  total_sleep_min: number | null
}

interface ISIRecord {
  id: string
  assessed_at: string
  total_score: number | null
}

interface RecordsClientProps {
  diaries: DiaryRecord[]
  isiList: ISIRecord[]
}

const EFFICIENCY_STYLE: Record<SleepEfficiencyLevel, { badge: string; bar: string; text: string }> = {
  정상: { badge: 'badge-success', bar: 'bg-green-500', text: 'text-green-700' },
  주의: { badge: 'badge-warning', bar: 'bg-yellow-500', text: 'text-yellow-700' },
  불량: { badge: 'badge-danger', bar: 'bg-red-500', text: 'text-red-700' },
}

const SEVERITY_STYLE: Record<ISISeverity, { badge: string; bar: string; text: string }> = {
  없음: { badge: 'badge-success', bar: 'bg-green-500', text: 'text-green-700' },
  경미: { badge: 'badge-warning', bar: 'bg-yellow-500', text: 'text-yellow-700' },
  중등도: { badge: 'badge-orange', bar: 'bg-orange-500', text: 'text-orange-700' },
  심각: { badge: 'badge-danger', bar: 'bg-red-500', text: 'text-red-700' },
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

function calcDiaryEfficiency(diary: DiaryRecord): number | null {
  return calcSleepEfficiency({
    bedtime: diary.bedtime ?? undefined,
    wake_time: diary.wake_time ?? undefined,
    sleep_onset_latency: diary.sleep_onset_latency ?? undefined,
    night_awakening_count: diary.night_awakening_count ?? undefined,
  })
}

function calcDiaryDuration(diary: DiaryRecord): number | null {
  if (diary.total_sleep_min) return diary.total_sleep_min
  if (!diary.bedtime || !diary.wake_time) return null
  const [bH, bM] = diary.bedtime.split(':').map(Number)
  const [wH, wM] = diary.wake_time.split(':').map(Number)
  let total = (wH * 60 + wM) - (bH * 60 + bM)
  if (total <= 0) total += 24 * 60
  const latencyMap: Record<string, number> = { '0~10분': 5, '10~30분': 20, '30~60분': 45, '60분 이상': 75 }
  const awakeningMap: Record<string, number> = { '없음': 0, '1회': 15, '2회': 30, '3회 이상': 45 }
  const latency = diary.sleep_onset_latency ? (latencyMap[diary.sleep_onset_latency] ?? 0) : 0
  const awakening = diary.night_awakening_count ? (awakeningMap[diary.night_awakening_count] ?? 0) : 0
  return Math.max(0, total - latency - awakening)
}

export default function RecordsClient({ diaries, isiList }: RecordsClientProps) {
  const [tab, setTab] = useState<'sleep' | 'isi'>('sleep')

  // 수면 기록 통계 계산
  const diariesWithStats = diaries.map((d) => ({
    ...d,
    efficiency: calcDiaryEfficiency(d),
    durationMin: calcDiaryDuration(d),
  }))

  const withEfficiency = diariesWithStats.filter((d) => d.efficiency !== null)
  const withDuration = diariesWithStats.filter((d) => d.durationMin !== null)
  const withQuality = diariesWithStats.filter((d) => d.sleep_quality !== null)

  const avgEfficiency = withEfficiency.length
    ? Math.round(withEfficiency.reduce((s, d) => s + d.efficiency!, 0) / withEfficiency.length)
    : null
  const avgDuration = withDuration.length
    ? Math.round(withDuration.reduce((s, d) => s + d.durationMin!, 0) / withDuration.length)
    : null
  const avgQuality = withQuality.length
    ? (withQuality.reduce((s, d) => s + d.sleep_quality!, 0) / withQuality.length).toFixed(1)
    : null

  // 최근 7일 바 차트 데이터 (오늘~7일 전)
  const last7: Array<{ label: string; date: string; efficiency: number | null }> = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const record = diariesWithStats.find((r) => r.diary_date === dateStr)
    return {
      label: DAY_LABELS[d.getDay()],
      date: dateStr,
      efficiency: record?.efficiency ?? null,
    }
  })

  return (
    <div className="px-4 pt-6 pb-8 space-y-4">
      <h1 className="text-h2 text-gray-900">📈 기록</h1>

      {/* 탭 */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {([['sleep', '수면 기록'], ['isi', 'ISI 추이']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-gray-900 shadow-card' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'sleep' && (
        <SleepTab
          diaries={diariesWithStats}
          last7={last7}
          avgEfficiency={avgEfficiency}
          avgDuration={avgDuration}
          avgQuality={avgQuality}
          recordCount={diaries.length}
        />
      )}

      {tab === 'isi' && (
        <ISITab isiList={isiList} />
      )}
    </div>
  )
}

// ─── 수면 기록 탭 ────────────────────────────────────────────────────────────

interface SleepTabProps {
  diaries: Array<DiaryRecord & { efficiency: number | null; durationMin: number | null }>
  last7: Array<{ label: string; date: string; efficiency: number | null }>
  avgEfficiency: number | null
  avgDuration: number | null
  avgQuality: string | null
  recordCount: number
}

function SleepTab({ diaries, last7, avgEfficiency, avgDuration, avgQuality, recordCount }: SleepTabProps) {
  if (diaries.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-gray-400">아직 수면 기록이 없어요.<br />일지를 작성하면 여기에 기록이 쌓여요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 평균 통계 */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="평균 수면 효율" value={avgEfficiency !== null ? `${avgEfficiency}%` : '-'} sub={avgEfficiency !== null ? getSleepEfficiencyLevel(avgEfficiency) : ''} />
        <StatCard label="평균 수면 시간" value={avgDuration !== null ? formatDuration(avgDuration) : '-'} />
        <StatCard label="기록 일수" value={`${recordCount}일`} />
      </div>

      {/* 최근 7일 효율 바 차트 */}
      <div className="card space-y-3">
        <p className="text-sm font-semibold text-gray-700">최근 7일 수면 효율</p>
        <div className="flex items-end justify-between gap-1.5 h-24">
          {last7.map((day) => {
            const eff = day.efficiency
            const level = eff !== null ? getSleepEfficiencyLevel(eff) : null
            const barColor = level ? EFFICIENCY_STYLE[level].bar : 'bg-gray-200'
            const heightPct = eff !== null ? Math.max(4, eff) : 4
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400">
                  {eff !== null ? `${eff}%` : ''}
                </span>
                <div className="w-full flex items-end" style={{ height: '60px' }}>
                  <div
                    className={`w-full rounded-t-md ${barColor} transition-all`}
                    style={{ height: `${(heightPct / 100) * 60}px`, opacity: eff !== null ? 1 : 0.3 }}
                  />
                </div>
                <span className="text-[11px] font-medium text-gray-600">{day.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 일지 목록 */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">전체 기록</p>
        {diaries.map((d) => {
          const eff = d.efficiency
          const level = eff !== null ? getSleepEfficiencyLevel(eff) : null
          return (
            <div key={d.id} className="card flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{d.diary_date}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {d.durationMin !== null && (
                    <span className="text-xs text-gray-500">🕐 {formatDuration(d.durationMin)}</span>
                  )}
                  {d.sleep_quality !== null && (
                    <span className="text-xs text-gray-500">{'⭐'.repeat(d.sleep_quality)}</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 space-y-1">
                {eff !== null && level ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">{eff}%</p>
                    <span className={`text-xs ${EFFICIENCY_STYLE[level].badge} px-2 py-0.5 rounded-full`}>
                      {level}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">효율 없음</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card text-center space-y-1 px-2">
      <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
      <p className="text-base font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
  )
}

// ─── ISI 추이 탭 ──────────────────────────────────────────────────────────────

function ISITab({ isiList }: { isiList: ISIRecord[] }) {
  if (isiList.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-gray-400">아직 자가진단 기록이 없어요.<br />ISI 자가진단을 완료하면 여기에 기록이 쌓여요.</p>
      </div>
    )
  }

  const latest = isiList[0]
  const latestScore = latest.total_score ?? 0
  const latestSeverity = getISISeverity(latestScore)

  return (
    <div className="space-y-4">
      {/* 최근 점수 카드 */}
      <div className={`card border-2 ${SEVERITY_STYLE[latestSeverity].bar.replace('bg-', 'border-')}`}>
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">최근 ISI 점수</p>
          <p className="text-4xl font-bold text-gray-900">
            {latestScore}<span className="text-lg font-normal text-gray-400"> / 28</span>
          </p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${SEVERITY_STYLE[latestSeverity].badge}`}>
            {latestSeverity} 불면증
          </span>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
            <div
              className={`h-2 rounded-full ${SEVERITY_STYLE[latestSeverity].bar} transition-all`}
              style={{ width: `${(latestScore / 28) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">{latest.assessed_at.slice(0, 10)} 기준</p>
        </div>
      </div>

      {/* 점수 이력 */}
      {isiList.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">점수 이력</p>
          {isiList.map((item, idx) => {
            const score = item.total_score ?? 0
            const severity = getISISeverity(score)
            const prev = isiList[idx + 1]
            const prevScore = prev?.total_score ?? null
            const diff = prevScore !== null ? score - prevScore : null

            return (
              <div key={item.id} className="card flex items-center gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">{item.assessed_at.slice(0, 10)}</p>
                    <div className="flex items-center gap-1.5">
                      {diff !== null && (
                        <span className={`flex items-center gap-0.5 text-xs font-medium ${
                          diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-500' : 'text-gray-400'
                        }`}>
                          {diff < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : diff > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                          {diff !== 0 ? `${Math.abs(diff)}점` : '변동 없음'}
                        </span>
                      )}
                      <span className="text-base font-bold text-gray-900">{score}<span className="text-xs text-gray-400">/28</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${SEVERITY_STYLE[severity].bar}`}
                        style={{ width: `${(score / 28) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs ${SEVERITY_STYLE[severity].badge} px-2 py-0.5 rounded-full`}>
                      {severity}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
