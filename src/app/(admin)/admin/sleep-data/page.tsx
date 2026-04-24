import { requireAdmin } from '@/lib/supabase/admin'
import { calcSleepEfficiency } from '@/types'
import { Moon } from 'lucide-react'

export default async function SleepDataPage() {
  const { supabase } = await requireAdmin()

  const [patientsRes, diaryRes] = await Promise.all([
    supabase.from('patients').select('id, name, registration_number').order('name'),
    supabase
      .from('sleep_diary')
      .select('patient_id, diary_date, bedtime, wake_time, sleep_onset_latency, night_awakening_count, sleep_quality, condition')
      .order('diary_date', { ascending: false })
      .limit(500),
  ])

  const patients = patientsRes.data ?? []
  const diaries = diaryRes.data ?? []

  const patientMap = new Map(patients.map((p) => [p.id, p]))

  const rows = diaries.map((d) => {
    const p = patientMap.get(d.patient_id)
    const eff = calcSleepEfficiency(d)
    return { ...d, patientName: p?.name ?? '—', regNum: p?.registration_number ?? '—', efficiency: eff }
  })

  const effColor = (v: number | null) =>
    v === null ? 'text-gray-300' : v >= 85 ? 'text-green-600' : v >= 70 ? 'text-yellow-600' : 'text-red-500'

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Moon size={20} className="text-brand-500" />
        <h1 className="text-xl font-bold text-gray-900">수면 데이터</h1>
        <span className="text-sm text-gray-400">최근 500건</span>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {['환자', '날짜', '취침', '기상', '수면효율', '수면질', '콘디션'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  수면 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-gray-900">{r.patientName}</p>
                    <p className="text-xs text-gray-400">#{r.regNum}</p>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{r.diary_date}</td>
                  <td className="px-4 py-2.5 text-gray-600">{r.bedtime ?? '—'}</td>
                  <td className="px-4 py-2.5 text-gray-600">{r.wake_time ?? '—'}</td>
                  <td className={`px-4 py-2.5 font-semibold ${effColor(r.efficiency)}`}>
                    {r.efficiency !== null ? `${r.efficiency}%` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {r.sleep_quality ? `${r.sleep_quality}점` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {r.condition ? `${r.condition}점` : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
