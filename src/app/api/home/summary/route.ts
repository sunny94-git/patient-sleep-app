import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase
    .from('user_roles')
    .select('patient_id')
    .eq('id', user.id)
    .single()

  if (!role?.patient_id) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

  const patientId = role.patient_id
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const [patientRes, todayDiaryRes, yesterdayDiaryRes, prescriptionRes] =
    await Promise.all([
      supabase.from('patients').select('name').eq('id', patientId).single(),
      supabase.from('sleep_diary').select('id, sleep_quality, herbal_morning, herbal_lunch, herbal_evening, herbal_bedtime, western_morning, western_lunch, western_evening, western_bedtime').eq('patient_id', patientId).eq('diary_date', today).maybeSingle(),
      supabase.from('sleep_diary').select('bedtime, wake_time, sleep_quality, sleep_onset_latency, night_awakening_count, total_sleep_min').eq('patient_id', patientId).eq('diary_date', yesterday).maybeSingle(),
      supabase.from('treatment_records').select('id, prescription, next_visit_date').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ])

  return NextResponse.json({
    patientName: patientRes.data?.name ?? '',
    hasPrescription: !!prescriptionRes.data?.prescription,
    nextVisitDate: prescriptionRes.data?.next_visit_date ?? null,
    todayDiary: todayDiaryRes.data ?? null,
    yesterdaySummary: yesterdayDiaryRes.data ?? null,
  })
}
