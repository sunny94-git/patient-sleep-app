import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase
    .from('user_roles').select('patient_id').eq('id', user.id).single()
  if (!role?.patient_id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const { med_type, timing, checked } = body as {
    med_type: 'herbal' | 'western'
    timing: 'morning' | 'lunch' | 'evening' | 'bedtime'
    checked: boolean
  }

  const column = `${med_type}_${timing}` as const
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('sleep_diary').select('id').eq('patient_id', role.patient_id).eq('diary_date', today).maybeSingle()

  if (existing) {
    await supabase.from('sleep_diary').update({ [column]: checked }).eq('id', existing.id)
  } else {
    await supabase.from('sleep_diary').insert({ patient_id: role.patient_id, diary_date: today, [column]: checked })
  }

  return NextResponse.json({ ok: true })
}
