import { requireAdmin } from '@/lib/supabase/admin'
import { calcSleepEfficiency, getSleepEfficiencyLevel } from '@/types'
import { BookOpen, Pill, Calendar, MessageCircle, AlertTriangle, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

function getKSTDate(offsetDays = 0): string {
  const now = new Date()
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  const kst = new Date(kstMs)
  kst.setDate(kst.getDate() + offsetDays)
  return kst.toISOString().slice(0, 10)
}

function getWeekRange(): { start: string; end: string } {
  const todayStr = getKSTDate(0)
  const d = new Date(todayStr)
  const day = d.getDay()
  const start = new Date(d)
  start.setDate(d.getDate() - day)
  const end = new Date(d)
  end.setDate(d.getDate() + (6 - day))
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export default async function DashboardPage() {
  const { supabase } = await requireAdmin()
  const today = getKSTDate(0)
  const threeDaysAgo = getKSTDate(-3)
  const sevenDaysAgo = getKSTDate(-7)
  const fourteenDaysAgo = getKSTDate(-14)
  const { start: weekStart, end: weekEnd } = getWeekRange()

  const [patientsRes, diaryRes, qnaRes, visitsRes] = await Promise.all([
    supabase.from('patients').select('id, name, registration_number'),
    supabase
      .from('sleep_diary')
      .select('patient_id, diary_date, bedtime, wake_time, sleep_onset_latency, night_awakening_count')
      .gte('diary_date', fourteenDaysAgo)
      .order('diary_date', { ascending: false }),
    supabase.from('qna').select('id', { count: 'exact' }).eq('is_answered', false),
    supabase
      .from('treatment_records')
      .select('patient_id, next_visit_date, treatment_notes')
      .gte('next_visit_date', weekStart)
      .lte('next_visit_date', weekEnd)
      .order('next_visit_date'),
  ])

  const patients = patientsRes.data ?? []
  const diaries = diaryRes.data ?? []
  const unansweredCount = qnaRes.count ?? 0
  const visits = visitsRes.data ?? []

  // 환자별 최근 일지일 계산
  const latestDiaryByPatient = new Map<string, string>()
  for (const d of diaries) {
    if (!latestDiaryByPatient.has(d.patient_id)) {
      latestDiaryByPatient.set(d.patient_id, d.diary_date)
    }
  }

  // 최근 3일 일지 작성 환자
  const hasRecentDiary = new Set(
    diaries.filter((d) => d.diary_date >= threeDaysAgo).map((d) => d.patient_id)
  )
  const diaryMissingCount = patients.filter((p) => !hasRecentDiary.has(p.id)).length

  // 미활동 환자 (7일 이상 미작성)
  const inactivePatients = patients
    .map((p) => {
      const latest = latestDiaryByPatient.get(p.id) ?? null
      const daysSince = latest
        ? Math.floor((new Date(today).getTime() - new Date(latest).getTime()) / 86400000)
        : 999
      return { ...p, daysSince, latest }
    })
    .filter((p) => p.daysSince >= 7)
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, 8)

  // 이번 주 재방문 환자 이름 매핑
  const patientMap = new Map(patients.map((p) => [p.id, p]))

  // 수면 효율 저하 환자 (최근 7일)
  const diaryByPatient7d = new Map<string, typeof diaries>()
  for (const d of diaries) {
    if (d.diary_date < sevenDaysAgo) continue
    if (!diaryByPatient7d.has(d.patient_id)) diaryByPatient7d.set(d.patient_id, [])
    diaryByPatient7d.get(d.patient_id)!.push(d)
  }

  const lowEfficiencyPatients = patients
    .map((p) => {
      const entries = diaryByPatient7d.get(p.id) ?? []
      const efficiencies = entries
        .map((d) => calcSleepEfficiency(d))
        .filter((e): e is number => e !== null)
      if (efficiencies.length === 0) return null
      const avg = Math.round(efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length)
      return { ...p, avgEfficiency: avg, level: getSleepEfficiencyLevel(avg) }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null && p.avgEfficiency < 85)
    .sort((a, b) => a.avgEfficiency - b.avgEfficiency)
    .slice(0, 5)

  const kpiCards = [
    {
      icon: BookOpen,
      label: '일지 미작성 (3일)',
      value: diaryMissingCount,
      sub: `전체 ${patients.length}명 중`,
      color: diaryMissingCount > 0 ? 'text-orange-600' : 'text-green-600',
    },
    {
      icon: Calendar,
      label: '이번 주 재방문',
      value: visits.length,
      sub: `${weekStart} ~ ${weekEnd}`,
      color: 'text-blue-600',
    },
    {
      icon: MessageCircle,
      label: '미답변 Q&A',
      value: unansweredCount,
      sub: '답변 대기 중',
      color: unansweredCount > 0 ? 'text-red-600' : 'text-green-600',
    },
    {
      icon: Pill,
      label: '총 환자 수',
      value: patients.length,
      sub: '등록된 환자',
      color: 'text-brand-600',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">대시보드</h1>

      {/* KPI 카드 */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} className="text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">{label}</span>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 미활동 환자 알림 */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <AlertTriangle size={16} className="text-orange-500" />
            <h2 className="text-sm font-semibold text-gray-800">미활동 환자 알림</h2>
          </div>
          {inactivePatients.length === 0 ? (
            <p className="px-5 py-8 text-sm text-center text-gray-400">
              모든 환자가 정상적으로 기록 중입니다 ✅
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {inactivePatients.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/patients/${p.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          p.daysSince >= 14 ? 'bg-red-500' : 'bg-yellow-400'
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                      <span className="text-xs text-gray-400">#{p.registration_number}</span>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        p.daysSince >= 14 ? 'text-red-500' : 'text-yellow-600'
                      }`}
                    >
                      {p.daysSince === 999 ? '기록 없음' : `${p.daysSince}일 미작성`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          {/* 이번 주 재방문 예정 */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <Clock size={16} className="text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-800">이번 주 재방문 예정</h2>
            </div>
            {visits.length === 0 ? (
              <p className="px-5 py-6 text-sm text-center text-gray-400">
                이번 주 재방문 예정 환자가 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {visits.slice(0, 5).map((v, i) => {
                  const p = patientMap.get(v.patient_id)
                  return (
                    <li key={i}>
                      <Link
                        href={`/admin/patients/${v.patient_id}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {p?.name ?? '알 수 없음'}
                          </span>
                          {v.treatment_notes && (
                            <p className="text-xs text-gray-400 mt-0.5">{v.treatment_notes}</p>
                          )}
                        </div>
                        <span className="text-xs font-medium text-blue-600 shrink-0">
                          {v.next_visit_date}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* 수면 효율 저하 환자 */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-800">📉 수면 효율 저하 (최근 7일)</span>
            </div>
            {lowEfficiencyPatients.length === 0 ? (
              <p className="px-5 py-6 text-sm text-center text-gray-400">
                수면 효율이 낮은 환자가 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {lowEfficiencyPatients.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/patients/${p.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.level === '불량' ? 'bg-red-500' : 'bg-yellow-400'
                            }`}
                            style={{ width: `${p.avgEfficiency}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium w-10 text-right ${
                            p.level === '불량' ? 'text-red-500' : 'text-yellow-600'
                          }`}
                        >
                          {p.avgEfficiency}%
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* 환자 목록 바로가기 */}
      <Link
        href="/admin/patients"
        className="flex items-center justify-between bg-white rounded-xl px-5 py-4 shadow-card hover:shadow-card-hover transition-shadow"
      >
        <span className="text-sm font-medium text-gray-700">전체 환자 목록 보기</span>
        <ChevronRight size={16} className="text-gray-400" />
      </Link>
    </div>
  )
}
