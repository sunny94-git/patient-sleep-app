import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase
    .from('user_roles').select('patient_id').eq('id', user.id).single()
  if (!role?.patient_id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const { diary_date, ...rest } = body
  const today = new Date().toISOString().split('T')[0]
  const targetDate = diary_date || today

  // 미래 날짜 거부
  if (targetDate > today) {
    return NextResponse.json({ error: 'Future date not allowed' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('sleep_diary').select('id').eq('patient_id', role.patient_id).eq('diary_date', targetDate).maybeSingle()

  if (existing) {
    const { error } = await supabase.from('sleep_diary').update({ ...rest }).eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: existing.id })
  }

  const { data, error } = await supabase
    .from('sleep_diary')
    .insert({ ...rest, patient_id: role.patient_id, diary_date: targetDate })
    .select('id').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
