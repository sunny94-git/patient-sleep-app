import { requirePatient } from '@/lib/supabase/admin'
import HomeClient from './HomeClient'

function getKSTDate() {
  const now = new Date()
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  return new Date(kstMs).toISOString().slice(0, 10)
}

export default async function HomePage() {
  const { supabase, patientId } = await requirePatient()
  const today = getKSTDate()

  const [patientRes, todayDiaryRes, isiRes, treatmentRes, settingsRes] = await Promise.all([
    supabase.from('patients').select('id, name, registration_number').eq('id', patientId).single(),
    supabase.from('sleep_diary').select('diary_date').eq('patient_id', patientId).eq('diary_date', today).maybeSingle(),
    supabase.from('isi_assessments').select('total_score, assessed_at').eq('patient_id', patientId).order('assessed_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('treatment_records').select('next_visit_date').eq('patient_id', patientId).order('visit_date', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('settings').select('*').eq('id', patientId).maybeSingle(),
  ])

  return (
    <HomeClient
      patient={patientRes.data!}
      todayDiary={todayDiaryRes.data}
      latestIsi={isiRes.data}
      nextVisit={treatmentRes.data?.next_visit_date ?? null}
      settings={settingsRes.data ?? { push_enabled: true, diary_remind: true, med_alarm: true, qna_alarm: true }}
    />
  )
}
