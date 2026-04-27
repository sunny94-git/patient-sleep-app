import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('patient_id').eq('id', user.id).single()
  if (!role?.patient_id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') ?? '30d'
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
  const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]

  const { data } = await supabase
    .from('sleep_diary')
    .select('diary_date, bedtime, wake_time, sleep_quality, morning_fatigue, condition, total_sleep_min, deep_sleep_min, light_sleep_min, rem_sleep_min, sleep_onset_latency, night_awakening_count')
    .eq('patient_id', role.patient_id)
    .gte('diary_date', from)
    .order('diary_date', { ascending: true })

  return NextResponse.json(data ?? [])
}
