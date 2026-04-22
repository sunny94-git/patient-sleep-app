import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

  const { data, error } = await supabase
    .from('isi_assessments')
    .select('id, assessed_at, q1, q2, q3, q4, q5, q6, q7, total_score')
    .eq('patient_id', userRole.patient_id)
    .order('assessed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ assessment: data })
}
