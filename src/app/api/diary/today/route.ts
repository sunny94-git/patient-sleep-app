import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getKSTDate(): string {
  const now = new Date()
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  return new Date(kstMs).toISOString().slice(0, 10)
}

export async function GET() {
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

  const today = getKSTDate()

  const { data, error } = await supabase
    .from('sleep_diary')
    .select('*')
    .eq('patient_id', userRole.patient_id)
    .eq('diary_date', today)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ diary: data, date: today })
}
