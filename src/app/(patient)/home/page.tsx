'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Moon, CheckCircle2, PencilLine, AlertCircle, ChevronRight, LogOut } from 'lucide-react'
import { calcSleepEfficiency, getSleepEfficiencyLevel } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface HomeSummary {
  patientName: string
  hasPrescription: boolean
  nextVisitDate: string | null
  todayDiary: {
    id: string
    sleep_quality?: number | null
    herbal_morning?: boolean; herbal_lunch?: boolean
    herbal_evening?: boolean; herbal_bedtime?: boolean
    western_morning?: boolean; western_lunch?: boolean
    western_evening?: boolean; western_bedtime?: boolean
  } | null
  yesterdaySummary: {
    bedtime?: string; wake_time?: string
    sleep_quality?: number; sleep_onset_latency?: string
    night_awakening_count?: string; total_sleep_min?: number
  } | null
}

const MED_TIMINGS = [
  { key: 'morning', label: '아침' },
  { key: 'lunch',   label: '점심' },
  { key: 'evening', label: '저녁' },
  { key: 'bedtime', label: '취침전' },
] as const

export default function HomePage() {
  const router = useRouter()
  const [summary, setSummary] = useState<HomeSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSummary = useCallback(async () => {
    const res = await fetch('/api/home/summary')
    if (res.status === 401) { router.push('/login'); return }
    setSummary(await res.json())
    setLoading(false)
  }, [router])

  useEffect(() => { fetchSummary() }, [fetchSummary])

  async function toggleMed(medType: 'herbal' | 'western', timing: string, current: boolean) {
    await fetch('/api/medication/check', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ med_type: medType, timing, checked: !current }),
    })
    fetchSummary()
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return '좋은 아침이에요'
    if (h < 18) return '좋은 오후예요'
    return '좋은 저녁이에요'
  }

  if (loading) return <HomeSkeleton />

  const d = summary!
  const diaryDone = d.todayDiary?.sleep_quality != null

  // 어제 수면 효율 계산
  let efficiency: number | null = null
  const ys = d.yesterdaySummary
  if (ys?.bedtime && ys?.wake_time) {
    efficiency = calcSleepEfficiency(ys.bedtime, ys.wake_time, ys.sleep_onset_latency ?? '0~10분', ys.night_awakening_count ?? '없음')
  }
  const effLevel = efficiency !== null ? getSleepEfficiencyLevel(efficiency) : null

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4">
      {/* 인사말 */}
      <div>
        <p className="text-sm text-[#718096]">{greeting()}</p>
        <h1 className="text-2xl font-bold text-[#1A202C] mt-0.5">
          {d.patientName}님 👋
        </h1>
      </div>

      {/* 오늘의 할 일 */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <h2 className="text-base font-semibold text-[#1A202C] mb-3">오늘의 할 일</h2>

        {/* 수면 일지 */}
        <button
          onClick={() => router.push('/diary')}
          className={`w-full flex items-center justify-between p-3 rounded-xl mb-2 transition-colors ${
            diaryDone
              ? 'bg-green-50 border border-green-200 hover:bg-green-100'
              : 'bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE]'
          }`}
        >
          <div className="flex items-center gap-3">
            {diaryDone
              ? <CheckCircle2 size={20} className="text-green-500 shrink-0" />
              : <Moon size={20} className="text-[#4A90D9] shrink-0" />}
            <span className={`text-sm font-medium ${diaryDone ? 'text-green-700' : 'text-[#4A90D9]'}`}>
              {diaryDone ? '수면 일지 작성 완료' : '수면 일지 작성하기'}
            </span>
          </div>
          {diaryDone
            ? <PencilLine size={15} className="text-green-500" />
            : <ChevronRight size={16} className="text-[#4A90D9]" />}
        </button>

        {/* 복약 체크 (처방 환자만) */}
        {d.hasPrescription && (
          <div className="flex flex-col gap-2 mt-3">
            {(['herbal', 'western'] as const).map(medType => (
              <div key={medType}>
                <p className="text-xs font-medium text-[#718096] mb-1.5">
                  💊 {medType === 'herbal' ? '한약' : '양약'}
                </p>
                <div className="flex gap-2">
                  {MED_TIMINGS.map(({ key, label }) => {
                    const fieldKey = `${medType}_${key}` as keyof typeof d.todayDiary
                    const checked = !!(d.todayDiary as Record<string, unknown> | null)?.[fieldKey]
                    return (
                      <button
                        key={key}
                        onClick={() => toggleMed(medType, key, checked)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                          checked
                            ? 'bg-[#4A90D9] text-white'
                            : 'bg-[#F1F5F9] text-[#718096] hover:bg-[#E2E8F0]'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 어제 수면 요약 */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <h2 className="text-base font-semibold text-[#1A202C] mb-3">어제 수면 요약</h2>
        {ys ? (
          <div className="flex flex-col gap-2">
            <SummaryRow label="수면 시간" value={
              ys.total_sleep_min
                ? `${Math.floor(ys.total_sleep_min / 60)}h ${ys.total_sleep_min % 60}m`
                : (ys.bedtime && ys.wake_time ? `${ys.bedtime} ~ ${ys.wake_time}` : '—')
            } />
            {efficiency !== null && effLevel && (
              <SummaryRow label="수면 효율" value={`${efficiency}%`} valueColor={effLevel.color} />
            )}
            {ys.sleep_quality && (
              <SummaryRow label="수면 만족도" value={'★'.repeat(ys.sleep_quality) + '☆'.repeat(5 - ys.sleep_quality)} />
            )}
          </div>
        ) : (
          <p className="text-sm text-[#A0AEC0]">어제 수면 일지가 없습니다.</p>
        )}
      </div>

      {/* 다음 방문일 */}
      {d.nextVisitDate && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-[#4A90D9] shrink-0" />
          <div>
            <p className="text-xs text-[#4A90D9] font-medium">다음 방문 예정일</p>
            <p className="text-sm font-semibold text-[#1A202C]">
              {new Date(d.nextVisitDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </p>
          </div>
        </div>
      )}

      {/* 로그아웃 */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 text-[#EF4444] text-sm font-medium rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
        로그아웃
      </button>
    </div>
  )
}

function SummaryRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-[#718096]">{label}</span>
      <span className="text-sm font-medium" style={valueColor ? { color: valueColor } : { color: '#1A202C' }}>
        {value}
      </span>
    </div>
  )
}

function HomeSkeleton() {
  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4 animate-pulse">
      <div>
        <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-7 w-40 bg-gray-200 rounded" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl p-4 h-28" />
      ))}
    </div>
  )
}
