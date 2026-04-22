import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getKSTDate(): string {
  const now = new Date()
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  return new Date(kstMs).toISOString().slice(0, 10)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('patient_id')
    .eq('id', user.id)
    .single()

  if (!userRole?.patient_id) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const body = await request.json()
  const today = getKSTDate()

  const { error } = await supabase.from('sleep_diary').insert({
    patient_id: userRole.patient_id,
    diary_date: body.diary_date ?? today,
    bedtime: body.bedtime,
    wake_time: body.wake_time,
    sleep_onset_latency: body.sleep_onset_latency,
    night_awakening_count: body.night_awakening_count,
    sleep_event_memo: body.sleep_event_memo || null,
    sleep_quality: body.sleep_quality,
    morning_fatigue: body.morning_fatigue,
    daytime_sleepiness: body.daytime_sleepiness,
    nap_taken: body.nap_taken ?? false,
    nap_duration_min: body.nap_duration_min ?? null,
    dream: body.dream,
    caffeine: body.caffeine,
    alcohol: body.alcohol ?? false,
    condition: body.condition,
    memo: body.memo || null,
    herbal_morning: body.herbal_morning ?? false,
    herbal_lunch: body.herbal_lunch ?? false,
    herbal_evening: body.herbal_evening ?? false,
    herbal_bedtime: body.herbal_bedtime ?? false,
    western_morning: body.western_morning ?? false,
    western_lunch: body.western_lunch ?? false,
    western_evening: body.western_evening ?? false,
    western_bedtime: body.western_bedtime ?? false,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '오늘 일지가 이미 존재합니다.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
