import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params

  const { error } = await supabase
    .from('sleep_diary')
    .delete()
    .eq('id', id)
    .eq('patient_id', userRole.patient_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params
  const body = await request.json()

  const { error } = await supabase
    .from('sleep_diary')
    .update({
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
    .eq('id', id)
    .eq('patient_id', userRole.patient_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
