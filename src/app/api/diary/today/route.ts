import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase
    .from('user_roles').select('patient_id').eq('id', user.id).single()
  if (!role?.patient_id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url = new URL(request.url)
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]

  const [diaryRes, prescRes] = await Promise.all([
    supabase.from('sleep_diary').select('*').eq('patient_id', role.patient_id).eq('diary_date', date).maybeSingle(),
    supabase.from('treatment_records').select('prescription').eq('patient_id', role.patient_id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  return NextResponse.json({
    diary: diaryRes.data,
    hasPrescription: !!prescRes.data?.prescription,
  })
}
