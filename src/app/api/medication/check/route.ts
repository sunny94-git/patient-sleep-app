import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
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
  const { med_type, timing, checked } = body as {
    med_type: 'herbal' | 'western'
    timing: 'morning' | 'lunch' | 'evening' | 'bedtime'
    checked: boolean
  }

  if (!med_type || !timing || typeof checked !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // KST 기준 오늘 날짜
  const now = new Date()
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  const today = new Date(kstMs).toISOString().slice(0, 10)

  const column = `${med_type}_${timing}`

  const { error } = await supabase
    .from('sleep_diary')
    .update({ [column]: checked })
    .eq('patient_id', userRole.patient_id)
    .eq('diary_date', today)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
