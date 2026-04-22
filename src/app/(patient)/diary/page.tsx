import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DiaryForm from './DiaryForm'

function getKSTDate(): string {
  const now = new Date()
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  return new Date(kstMs).toISOString().slice(0, 10)
}

export default async function DiaryPage() {
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
  const today = getKSTDate()

  const [existingDiaryRes, prescriptionRes] = await Promise.all([
    supabase
      .from('sleep_diary')
      .select('*')
      .eq('patient_id', patientId)
      .eq('diary_date', today)
      .maybeSingle(),
    supabase
      .from('treatment_records')
      .select('id')
      .eq('patient_id', patientId)
      .limit(1),
  ])

  return (
    <DiaryForm
      patientId={patientId}
      today={today}
      existingDiary={existingDiaryRes.data}
      hasPrescription={(prescriptionRes.data?.length ?? 0) > 0}
    />
  )
}
