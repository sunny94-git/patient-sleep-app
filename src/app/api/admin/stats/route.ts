import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { calcSleepEfficiency } from '@/lib/utils'

export async function GET() {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const [
    { count: totalPatients },
    { count: diaryToday },
    { count: diaryWeek },
    { count: unansweredQna },
    { data: allPatients },
    { data: recentDiaries },
  ] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }),
    supabase.from('sleep_diary').select('id', { count: 'exact', head: true }).eq('diary_date', today),
    supabase.from('sleep_diary').select('id', { count: 'exact', head: true }).gte('diary_date', weekAgo),
    supabase.from('qna').select('id', { count: 'exact', head: true }).eq('is_answered', false),
    supabase.from('patients').select('id, name, registration_number').order('name'),
    supabase.from('sleep_diary')
      .select('patient_id, diary_date, bedtime, wake_time, sleep_onset_latency, night_awakening_count')
      .gte('diary_date', weekAgo)
      .order('diary_date', { ascending: false }),
  ])

  // 미활동 환자 (최근 7일 일지 없음)
  const activeIds = new Set(recentDiaries?.map(d => d.patient_id) ?? [])
  const inactivePatients = (allPatients ?? []).filter(p => !activeIds.has(p.id))

  // 수면 효율 저하 환자 (최근 7일 평균 < 85%)
  const effMap = new Map<string, number[]>()
  for (const d of recentDiaries ?? []) {
    if (!d.bedtime || !d.wake_time) continue
    try {
      const eff = calcSleepEfficiency(
        d.bedtime,
        d.wake_time,
        d.sleep_onset_latency ?? '0~10분',
        d.night_awakening_count ?? '없음',
      )
      if (!effMap.has(d.patient_id)) effMap.set(d.patient_id, [])
      effMap.get(d.patient_id)!.push(eff)
    } catch {}
  }

  const lowEfficiencyPatients = (allPatients ?? []).filter(p => {
    const effs = effMap.get(p.id)
    if (!effs?.length) return false
    const avg = effs.reduce((a, b) => a + b, 0) / effs.length
    return avg < 85
  }).map(p => ({
    ...p,
    avgEfficiency: Math.round(
      (effMap.get(p.id)!.reduce((a, b) => a + b, 0) / effMap.get(p.id)!.length)
    ),
  }))

  return NextResponse.json({
    totalPatients,
    diaryToday,
    diaryWeek,
    unansweredQna,
    inactivePatients: inactivePatients.slice(0, 10),
    inactiveCount: inactivePatients.length,
    lowEfficiencyPatients: lowEfficiencyPatients.slice(0, 10),
    lowEfficiencyCount: lowEfficiencyPatients.length,
  })
}
