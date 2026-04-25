import { requirePatient } from '@/lib/supabase/admin'
import DiaryCalendarClient from './DiaryCalendarClient'

export default async function DiaryPage() {
  const { supabase, patientId } = await requirePatient()

  const { data } = await supabase
    .from('sleep_diary')
    .select('id, diary_date, bedtime, wake_time, sleep_onset_latency, night_awakening_count, sleep_quality, condition, memo')
    .eq('patient_id', patientId)
    .order('diary_date', { ascending: false })
    .limit(90)

  return <DiaryCalendarClient patientId={patientId} initialDiaries={data ?? []} />
}
