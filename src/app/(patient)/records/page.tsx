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

  const [{ data: diaries }, { data: isiList }] = await Promise.all([
    supabase
      .from('sleep_diary')
      .select('id, diary_date, bedtime, wake_time, sleep_onset_latency, night_awakening_count, sleep_quality, morning_fatigue, total_sleep_min')
      .eq('patient_id', patientId)
      .order('diary_date', { ascending: false })
      .limit(28),
    supabase
      .from('isi_assessments')
      .select('id, assessed_at, total_score')
      .eq('patient_id', patientId)
      .order('assessed_at', { ascending: false })
      .limit(10),
  ])

  return <RecordsClient diaries={diaries ?? []} isiList={isiList ?? []} />
}
