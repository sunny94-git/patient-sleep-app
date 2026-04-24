import { requireAdmin } from '@/lib/supabase/admin'
import { calcSleepEfficiency, getISISeverity } from '@/types'
import { WeeklyEfficiencyChart, IsiDistributionChart } from '@/components/admin/DashboardCharts'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

function getKSTDate(offsetDays = 0): string {
  const now = new Date()
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  const kst = new Date(kstMs)
  kst.setDate(kst.getDate() + offsetDays)
  return kst.toISOString().slice(0, 10)
}

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default async function DashboardPage() {
  const { supabase } = await requireAdmin()
  const today = getKSTDate(0)
  const sevenDaysAgo = getKSTDate(-7)

  const [patientsRes, diaryRes, qnaRes, isiRes] = await Promise.all([
    supabase.from('patients').select('id, name, birth_date, registration_number'),
    supabase
      .from('sleep_diary')
      .select('patient_id, diary_date, bedtime, wake_time, sleep_onset_latency, night_awakening_count')
      .gte('diary_date', sevenDaysAgo)
      .order('diary_date', { ascending: false }),
    supabase.from('qna').select('id', { count: 'exact' }).eq('is_answered', false),
    supabase
      .from('isi_assessments')
      .select('patient_id, total_score, assessed_at')
      .order('assessed_at', { ascending: false }),
  ])

  const patients = patientsRes.data ?? []
  const diaries = diaryRes.data ?? []
  const unansweredCount = qnaRes.count ?? 0
  const isiAll = isiRes.data ?? []

  const latestIsiByPatient = new Map<string, number>()
  for (const r of isiAll) {
    if (!latestIsiByPatient.has(r.patient_id) && r.total_score !== null) {
      latestIsiByPatient.set(r.patient_id, r.total_score)
    }
  }

  const isiHighRiskCount = [...latestIsiByPatient.values()].filter((s) => s >= 22).length

  const todayDiaryPatients = new Set(
    diaries.filter((d) => d.diary_date === today).map((d) => d.patient_id)
  )
  const todayActiveCount = todayDiaryPatients.size

  const dayEfficiencyMap = new Map<number, number[]>()
  for (const d of diaries) {
    const eff = calcSleepEfficiency(d)
    if (eff === null) continue
    const dayIdx = new Date(d.diary_date).getDay()
    if (!dayEfficiencyMap.has(dayIdx)) dayEfficiencyMap.set(dayIdx, [])
    dayEfficiencyMap.get(dayIdx)!.push(eff)
  }

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - 6 + i)
    return { date: d.toISOString().slice(0, 10), dayIdx: d.getDay() }
  })

  const weeklyEfficiencyData = last7Days.map(({ date, dayIdx }) => {
    const entries = diaries
      .filter((d) => d.diary_date === date)
      .map((d) => calcSleepEfficiency(d))
      .filter((e): e is number => e !== null)
    const avg = entries.length > 0
      ? Math.round(entries.reduce((a, b) => a + b, 0) / entries.length)
      : null
    return { day: DAY_LABELS[dayIdx], value: avg }
  })

  const isiCounts = { none: 0, mild: 0, moderate: 0, severe: 0 }
  for (const score of latestIsiByPatient.values()) {
    const s = getISISeverity(score)
    if (s === '없음') isiCounts.none++
    else if (s === '경미') isiCounts.mild++
    else if (s === '중등도') isiCounts.moderate++
    else isiCounts.severe++
  }

  const isiDistData = [
    { name: '정상 (0~7)', value: isiCounts.none, color: '#22C55E' },
    { name: '경도 (8~14)', value: isiCounts.mild, color: '#EAB308' },
    { name: '중등도 (15~21)', value: isiCounts.moderate, color: '#F97316' },
    { name: '고위험 (22~28)', value: isiCounts.severe, color: '#EF4444' },
  ]

  const patientDiaryMap = new Map<string, typeof diaries>()
  for (const d of diaries) {
    if (!patientDiaryMap.has(d.patient_id)) patientDiaryMap.set(d.patient_id, [])
    patientDiaryMap.get(d.patient_id)!.push(d)
  }

  const recentPatients = patients
    .filter((p) => patientDiaryMap.has(p.id))
    .map((p) => {
      const entries = patientDiaryMap.get(p.id) ?? []
      const latestDate = entries[0]?.diary_date ?? null
      const effs = entries.map((d) => calcSleepEfficiency(d)).filter((e): e is number => e !== null)
      const avgEff = effs.length > 0
        ? Math.round(effs.reduce((a, b) => a + b, 0) / effs.length)
        : null
      const isiScore = latestIsiByPatient.get(p.id) ?? null
      return { ...p, latestDate, avgEff, isiScore, age: calcAge(p.birth_date) }
    })
    .sort((a, b) => (b.latestDate ?? '').localeCompare(a.latestDate ?? ''))
    .slice(0, 8)

  const kpiCards = [
    { label: '염 환자수', value: patients.length, sub: '등록된 전체 환자' },
    { label: '오늘 활동', value: todayActiveCount, sub: '오늘 일지 작성 환자' },
    { label: '미답변 문의', value: unansweredCount, sub: '답변 대기 중인 Q&A' },
    { label: 'ISI 고위험', value: isiHighRiskCount, sub: 'ISI 22점 이상 환자' },
  ]

  return (
    <div className="p-6 space-y-5 w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, sub }) => (
          <div key={label} className="bg-brand-500 rounded-xl p-5 text-white min-w-0">
            <p className="text-sm font-medium text-blue-100 mb-2 whitespace-nowrap">{label}</p>
            <p className="text-4xl font-bold tabular-nums">{value}</p>
            <p className="text-xs text-blue-200 mt-1.5 whitespace-nowrap">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-xl p-5 shadow-card">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">주간 수면효율 (Weekly Sleep Efficiency)</h2>
          <WeeklyEfficiencyChart data={weeklyEfficiencyData} />
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-card">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">ISI 점수 분포</h2>
          <IsiDistributionChart data={isiDistData} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">최근 환자 목록</h2>
          <Link href="/admin/patients" className="text-xs text-brand-500 hover:underline">전체 보기 →</Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['이름', '나이', '최근 방문', '수면효율 (7일)', 'ISI 점수', '상태'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentPatients.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">최근 수면 일지 데이터가 없습니다.</td></tr>
            ) : (
              recentPatients.map((p) => {
                const isiLabel = p.isiScore !== null ? getISISeverity(p.isiScore) : null
                const statusColor = isiLabel === '없음' ? 'bg-green-100 text-green-700' : isiLabel === '경미' ? 'bg-yellow-100 text-yellow-700' : isiLabel === '중등도' ? 'bg-orange-100 text-orange-700' : isiLabel === '심각' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                const effColor = p.avgEff === null ? 'bg-gray-200' : p.avgEff >= 85 ? 'bg-green-500' : p.avgEff >= 70 ? 'bg-yellow-400' : 'bg-red-500'
                return (
                  <tr key={p.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-5 py-3"><Link href={`/admin/patients/${p.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-500">{p.name}</Link></td>
                    <td className="px-5 py-3 text-sm text-gray-600">{p.age !== null ? `${p.age}세` : '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{p.latestDate ?? '—'}</td>
                    <td className="px-5 py-3">
                      {p.avgEff !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${effColor}`} style={{ width: `${p.avgEff}%` }} /></div>
                          <span className="text-sm text-gray-700">{p.avgEff}%</span>
                        </div>
                      ) : <span className="text-gray-300 text-sm">—</span>}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">{p.isiScore !== null ? p.isiScore : '—'}</td>
                    <td className="px-5 py-3">{isiLabel ? <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>{isiLabel}</span> : <span className="text-gray-300 text-sm">—</span>}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
