import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('patient_id').eq('id', user.id).single()
  if (!role?.patient_id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data } = await supabase
    .from('isi_assessments')
    .select('id, assessed_at, q1, q2, q3, q4, q5, q6, q7, total_score')
    .eq('patient_id', role.patient_id)
    .order('assessed_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('patient_id').eq('id', user.id).single()
  if (!role?.patient_id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const { q1, q2, q3, q4, q5, q6, q7 } = body
  const total_score = (q1 ?? 0) + (q2 ?? 0) + (q3 ?? 0) + (q4 ?? 0) + (q5 ?? 0) + (q6 ?? 0) + (q7 ?? 0)

  const { data, error } = await supabase
    .from('isi_assessments')
    .insert({ patient_id: role.patient_id, q1, q2, q3, q4, q5, q6, q7, total_score })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
