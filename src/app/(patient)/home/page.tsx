import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calcSleepEfficiency, getSleepEfficiencyLevel } from '@/types'
import HomeClient from './HomeClient'

function getKSTDate(offsetDays = 0): string {
  const now = new Date()
  // KST = UTC+9, compensate for server timezone
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  const kst = new Date(kstMs)
  kst.setDate(kst.getDate() + offsetDays)
  return kst.toISOString().slice(0, 10)
}

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (!user || authError) redirect('/login')

  const today = getKSTDate(0)
  const yesterday = getKSTDate(-1)

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('patient_id')
    .eq('id', user.id)
    .single()

  if (!userRole?.patient_id) redirect('/login')

  const patientId = userRole.patient_id

  const [patientRes, todayDiaryRes, yesterdayDiaryRes, prescriptionRes, settingsRes] =
    await Promise.all([
      supabase.from('patients').select('name').eq('id', patientId).single(),
      supabase
        .from('sleep_diary')
        .select(
          'id, herbal_morning, herbal_lunch, herbal_evening, herbal_bedtime, western_morning, western_lunch, western_evening, western_bedtime'
        )
        .eq('patient_id', patientId)
        .eq('diary_date', today)
        .maybeSingle(),
      supabase
        .from('sleep_diary')
        .select('bedtime, wake_time, sleep_onset_latency, night_awakening_count, sleep_quality')
        .eq('patient_id', patientId)
        .eq('diary_date', yesterday)
        .maybeSingle(),
      supabase
        .from('treatment_records')
        .select('id, next_visit_date')
        .eq('patient_id', patientId)
        .order('visit_date', { ascending: false })
        .limit(1),
      supabase
        .from('settings')
        .select('push_enabled, diary_remind, med_alarm, qna_alarm')
        .eq('id', user.id)
        .maybeSingle(),
    ])

  const patientName = patientRes.data?.name ?? '환자'
  const todayDiary = todayDiaryRes.data
  const yesterdayDiary = yesterdayDiaryRes.data
  const latestTreatment = prescriptionRes.data?.[0] ?? null
  const hasPrescription = !!latestTreatment
  const nextVisitDate = latestTreatment?.next_visit_date ?? null
  const pushEnabled = settingsRes.data?.push_enabled ?? false
  const diaryRemind = settingsRes.data?.diary_remind ?? false
  const medAlarm = settingsRes.data?.med_alarm ?? false
  const qnaAlarm = settingsRes.data?.qna_alarm ?? false

  let yesterdayEfficiency: number | null = null
  let yesterdayEfficiencyLevel: string | null = null
  let yesterdaySleepDuration: string | null = null

  if (yesterdayDiary) {
    yesterdayEfficiency = calcSleepEfficiency(yesterdayDiary)
    if (yesterdayEfficiency !== null) {
      yesterdayEfficiencyLevel = getSleepEfficiencyLevel(yesterdayEfficiency)
    }
    if (yesterdayDiary.bedtime && yesterdayDiary.wake_time) {
      const [bedH, bedM] = yesterdayDiary.bedtime.split(':').map(Number)
      const [wakeH, wakeM] = yesterdayDiary.wake_time.split(':').map(Number)
      let totalMin = wakeH * 60 + wakeM - (bedH * 60 + bedM)
      if (totalMin <= 0) totalMin += 24 * 60
      yesterdaySleepDuration = `${Math.floor(totalMin / 60)}시간 ${totalMin % 60}분`
    }
  }

  return (
    <HomeClient
      patientName={patientName}
      todayDiary={todayDiary}
      today={today}
      hasPrescription={hasPrescription}
      yesterdayDiary={yesterdayDiary ? {
        bedtime: yesterdayDiary.bedtime,
        wake_time: yesterdayDiary.wake_time,
        sleep_quality: yesterdayDiary.sleep_quality,
      } : null}
      yesterdayEfficiency={yesterdayEfficiency}
      yesterdayEfficiencyLevel={yesterdayEfficiencyLevel}
      yesterdaySleepDuration={yesterdaySleepDuration}
      nextVisitDate={nextVisitDate}
      pushEnabled={pushEnabled}
      diaryRemind={diaryRemind}
      medAlarm={medAlarm}
      qnaAlarm={qnaAlarm}
    />
  )
}
