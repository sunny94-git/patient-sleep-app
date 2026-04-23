'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Moon,
  Sun,
  Sunset,
  Bell,
  BellOff,
  LogOut,
} from 'lucide-react'
import { logoutAction } from '@/app/login/actions'

interface TodayDiary {
  id: string
  herbal_morning: boolean | null
  herbal_lunch: boolean | null
  herbal_evening: boolean | null
  herbal_bedtime: boolean | null
  western_morning: boolean | null
  western_lunch: boolean | null
  western_evening: boolean | null
  western_bedtime: boolean | null
}

interface YesterdayDiary {
  bedtime?: string | null
  wake_time?: string | null
  sleep_quality?: number | null
}

interface HomeClientProps {
  patientName: string
  todayDiary: TodayDiary | null
  today: string
  hasPrescription: boolean
  yesterdayDiary: YesterdayDiary | null
  yesterdayEfficiency: number | null
  yesterdayEfficiencyLevel: string | null
  yesterdaySleepDuration: string | null
  pushEnabled: boolean
}

type MedType = 'herbal' | 'western'
type MedTiming = 'morning' | 'lunch' | 'evening' | 'bedtime'

const TIMING_LABEL: Record<MedTiming, string> = {
  morning: '아침',
  lunch: '점심',
  evening: '저녁',
  bedtime: '취침전',
}

function getGreeting(): { text: string; Icon: React.ElementType } {
  const hour = new Date().getHours()
  if (hour < 6) return { text: '좋은 밤이에요', Icon: Moon }
  if (hour < 12) return { text: '좋은 아침이에요', Icon: Sun }
  if (hour < 18) return { text: '좋은 오후예요', Icon: Sun }
  return { text: '좋은 저녁이에요', Icon: Sunset }
}

export default function HomeClient({
  patientName,
  todayDiary: initialDiary,
  today,
  hasPrescription,
  yesterdayDiary,
  yesterdayEfficiency,
  yesterdayEfficiencyLevel,
  yesterdaySleepDuration,
  pushEnabled: initialPushEnabled,
}: HomeClientProps) {
  const { text: greetingText, Icon: GreetingIcon } = getGreeting()

  const [diary, setDiary] = useState(initialDiary)
  const [medLoading, setMedLoading] = useState<string | null>(null)
  const [pushEnabled, setPushEnabled] = useState(initialPushEnabled)
  const [settingsLoading, setSettingsLoading] = useState(false)

  const diaryWritten = !!diary

  async function toggleMedication(medType: MedType, timing: MedTiming) {
    if (!diary) return
    const key = `${medType}_${timing}` as keyof TodayDiary
    const currentVal = diary[key] as boolean | null
    const loadKey = `${medType}_${timing}`
    setMedLoading(loadKey)
    try {
      const res = await fetch('/api/medication/check', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ med_type: medType, timing, checked: !currentVal }),
      })
      if (res.ok) {
        setDiary((prev) => (prev ? { ...prev, [key]: !currentVal } : prev))
      }
    } finally {
      setMedLoading(null)
    }
  }

  async function togglePushEnabled() {
    setSettingsLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ push_enabled: !pushEnabled }),
      })
      if (res.ok) setPushEnabled((prev) => !prev)
    } finally {
      setSettingsLoading(false)
    }
  }

  const efficiencyTextColor =
    yesterdayEfficiencyLevel === '정상'
      ? 'text-green-600'
      : yesterdayEfficiencyLevel === '주의'
        ? 'text-yellow-600'
        : 'text-red-600'

  const efficiencyBadgeClass =
    yesterdayEfficiencyLevel === '정상'
      ? 'badge-success'
      : yesterdayEfficiencyLevel === '주의'
        ? 'badge-warning'
        : 'badge-danger'

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* 인사 헤더 */}
      <div className="flex items-center gap-2">
        <GreetingIcon className="text-brand-500" size={22} />
        <h1 className="text-h2 text-gray-900 flex-1">
          {patientName}님, {greetingText}
        </h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </form>
      </div>

      {/* 오늘의 할 일 */}
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">📝 오늘의 할 일</h2>

        {/* 수면 일지 */}
        <div className="flex items-center justify-between min-h-[36px]">
          <div className="flex items-center gap-2">
            {diaryWritten ? (
              <CheckCircle2 className="text-brand-500 shrink-0" size={20} />
            ) : (
              <Circle className="text-gray-300 shrink-0" size={20} />
            )}
            <span
              className={`text-sm ${
                diaryWritten ? 'text-gray-500' : 'text-gray-800 font-medium'
              }`}
            >
              수면 일지 {diaryWritten ? '작성 완료' : '작성하기'}
            </span>
          </div>
          <Link
            href={diaryWritten ? `/diary?date=${today}` : '/diary'}
            className="flex items-center gap-0.5 text-xs font-medium text-brand-500 shrink-0"
          >
            {diaryWritten ? '수정하기' : '작성하기'} <ChevronRight size={14} />
          </Link>
        </div>

        {/* 복약 체크 - 처방 환자 + 일지 작성 완료 시 노출 */}
        {hasPrescription && diary && (
          <>
            {(['herbal', 'western'] as MedType[]).map((medType) => (
              <div key={medType} className="border-t border-gray-100 pt-3 space-y-2">
                <p className="text-xs font-medium text-gray-500">
                  💊 {medType === 'herbal' ? '한약' : '양약'}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {(['morning', 'lunch', 'evening', 'bedtime'] as MedTiming[]).map((timing) => {
                    const key = `${medType}_${timing}` as keyof TodayDiary
                    const checked = !!diary[key]
                    const isLoading = medLoading === `${medType}_${timing}`
                    return (
                      <button
                        key={timing}
                        onClick={() => toggleMedication(medType, timing)}
                        disabled={isLoading}
                        className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                          checked
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        } ${isLoading ? 'opacity-50' : ''}`}
                      >
                        {TIMING_LABEL[timing]}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {/* 처방은 있지만 일지 미작성 시 안내 */}
        {hasPrescription && !diary && (
          <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
            수면 일지를 먼저 작성하면 복약 체크를 할 수 있어요.
          </p>
        )}
      </section>

      {/* 어제 수면 요약 */}
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">📊 어제 수면 요약</h2>

        {yesterdayDiary ? (
          <div className="space-y-2.5">
            {yesterdaySleepDuration && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">수면 시간</span>
                <span className="text-sm font-medium text-gray-900">
                  {yesterdaySleepDuration}
                </span>
              </div>
            )}
            {yesterdayEfficiency !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">수면 효율</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${efficiencyTextColor}`}>
                    {yesterdayEfficiency}%
                  </span>
                  {yesterdayEfficiencyLevel && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${efficiencyBadgeClass}`}>
                      {yesterdayEfficiencyLevel}
                    </span>
                  )}
                </div>
              </div>
            )}
            {yesterdayDiary.sleep_quality != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">수면 만족도</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={`text-base leading-none ${
                        i <= (yesterdayDiary.sleep_quality ?? 0)
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">어제 수면 일지가 없어요.</p>
        )}
      </section>

      {/* 알림 설정 */}
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">⚙️ 알림 설정</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {pushEnabled ? (
              <Bell className="text-brand-500 shrink-0" size={16} />
            ) : (
              <BellOff className="text-gray-400 shrink-0" size={16} />
            )}
            <span className="text-sm text-gray-700">앱 알림 허용</span>
          </div>
          <button
            onClick={togglePushEnabled}
            disabled={settingsLoading}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              pushEnabled ? 'bg-brand-500' : 'bg-gray-200'
            } ${settingsLoading ? 'opacity-50' : ''}`}
            aria-label="알림 허용 토글"
            role="switch"
            aria-checked={pushEnabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                pushEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </section>
    </div>
  )
}
