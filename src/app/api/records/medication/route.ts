import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('patient_id').eq('id', user.id).single()
  if (!role?.patient_id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const days = Number(searchParams.get('days') ?? 30)
  const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]

  const { data } = await supabase
    .from('sleep_diary')
    .select(`
      diary_date,
      herbal_morning, herbal_lunch, herbal_evening, herbal_bedtime,
      western_morning, western_lunch, western_evening, western_bedtime
    `)
    .eq('patient_id', role.patient_id)
    .gte('diary_date', from)
    .order('diary_date', { ascending: false })

  return NextResponse.json(data ?? [])
}
