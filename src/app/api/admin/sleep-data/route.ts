import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('user_roles').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { patient_id, diary_date, total_sleep_min, deep_sleep_min, light_sleep_min, rem_sleep_min, admin_note } =
    await request.json()

  if (!patient_id || !diary_date) {
    return NextResponse.json({ error: '환자와 날짜는 필수입니다.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('sleep_diary')
    .upsert(
      { patient_id, diary_date, total_sleep_min, deep_sleep_min, light_sleep_min, rem_sleep_min, admin_note },
      { onConflict: 'patient_id,diary_date' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
