import { requireAdmin } from '@/lib/supabase/admin'
import PatientsClient from './PatientsClient'

function getKSTDate(offsetDays = 0): string {
  const now = new Date()
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  const kst = new Date(kstMs)
  kst.setDate(kst.getDate() + offsetDays)
  return kst.toISOString().slice(0, 10)
}

export default async function AdminPatientsPage() {
  const { supabase } = await requireAdmin()
  const today = getKSTDate(0)
  const fourteenDaysAgo = getKSTDate(-14)

  const [patientsRes, diaryRes, qnaRes, visitsRes] = await Promise.all([
    supabase.from('patients').select('id, name, registration_number, birth_date, phone').order('registration_number'),
    supabase
      .from('sleep_diary')
      .select('patient_id, diary_date')
      .gte('diary_date', fourteenDaysAgo)
      .order('diary_date', { ascending: false }),
    supabase.from('qna').select('patient_id').eq('is_answered', false),
    supabase
      .from('treatment_records')
      .select('patient_id, next_visit_date')
      .gte('next_visit_date', today)
      .order('next_visit_date'),
  ])

  const patients = patientsRes.data ?? []
  const diaries = diaryRes.data ?? []
  const unansweredQna = qnaRes.data ?? []
  const visits = visitsRes.data ?? []

  const latestDiaryMap = new Map<string, string>()
  for (const d of diaries) {
    if (!latestDiaryMap.has(d.patient_id)) latestDiaryMap.set(d.patient_id, d.diary_date)
  }

  const unansweredMap = new Map<string, number>()
  for (const q of unansweredQna) {
    unansweredMap.set(q.patient_id, (unansweredMap.get(q.patient_id) ?? 0) + 1)
  }

  const nextVisitMap = new Map<string, string>()
  for (const v of visits) {
    if (!nextVisitMap.has(v.patient_id)) nextVisitMap.set(v.patient_id, v.next_visit_date)
  }

  const patientRows = patients.map((p) => {
    const latestDiary = latestDiaryMap.get(p.id) ?? null
    const daysSince = latestDiary
      ? Math.floor((new Date(today).getTime() - new Date(latestDiary).getTime()) / 86400000)
      : 999
    return {
      id: p.id,
      registration_number: p.registration_number,
      name: p.name,
      birth_date: p.birth_date,
      phone: p.phone,
      latestDiary,
      daysSinceLastDiary: daysSince,
      unansweredQna: unansweredMap.get(p.id) ?? 0,
      nextVisitDate: nextVisitMap.get(p.id) ?? null,
    }
  })

  return <PatientsClient patients={patientRows} />
}
