import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecordsClient from './RecordsClient'

export default async function RecordsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (!user || authError) redirect('/login')

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('patient_id')
    .eq('id', user.id)
    .single()

  if (!userRole?.patient_id) redirect('/login')

  const patientId = userRole.patient_id

  const [{ data: diaries }, { data: exams }, { data: isiList }] = await Promise.all([
    supabase
      .from('sleep_diary')
      .select('id, diary_date, bedtime, wake_time, sleep_onset_latency, night_awakening_count, sleep_quality, condition, total_sleep_min, deep_sleep_min, light_sleep_min, rem_sleep_min')
      .eq('patient_id', patientId)
      .order('diary_date', { ascending: false })
      .limit(90),
    supabase
      .from('exam_results')
      .select('id, exam_date, exam_type, summary, result_data')
      .eq('patient_id', patientId)
      .order('exam_date', { ascending: false }),
    supabase
      .from('isi_assessments')
      .select('id, assessed_at, total_score')
      .eq('patient_id', patientId)
      .order('assessed_at', { ascending: false }),
  ])

  return (
    <RecordsClient
      diaries={diaries ?? []}
      exams={exams ?? []}
      isiList={isiList ?? []}
    />
  )
}
