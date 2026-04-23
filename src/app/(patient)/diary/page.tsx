import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DiaryForm from './DiaryForm'
import DiaryCalendarClient from './DiaryCalendarClient'

function getKSTDate(): string {
  const now = new Date()
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  return new Date(kstMs).toISOString().slice(0, 10)
}

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
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
  const { date } = await searchParams

  if (!date) {
    const { data: diaryRows } = await supabase
      .from('sleep_diary')
      .select('diary_date')
      .eq('patient_id', patientId)
      .order('diary_date', { ascending: false })

    const diaryDates = diaryRows?.map((r) => r.diary_date as string) ?? []
    return <DiaryCalendarClient diaryDates={diaryDates} today={today} />
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today) {
    redirect('/diary')
  }

  const [existingDiaryRes, prescriptionRes] = await Promise.all([
    supabase
      .from('sleep_diary')
      .select('*')
      .eq('patient_id', patientId)
      .eq('diary_date', date)
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
      today={date}
      existingDiary={existingDiaryRes.data}
      hasPrescription={(prescriptionRes.data?.length ?? 0) > 0}
    />
  )
}
