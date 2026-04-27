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
    .select('assessed_at, total_score, q1, q2, q3, q4, q5, q6, q7')
    .eq('patient_id', role.patient_id)
    .order('assessed_at', { ascending: true })

  return NextResponse.json(data ?? [])
}
