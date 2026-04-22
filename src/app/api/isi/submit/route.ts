import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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
  const { q1, q2, q3, q4, q5, q6, q7 } = body as {
    q1: number; q2: number; q3: number; q4: number
    q5: number; q6: number; q7: number
  }

  if ([q1, q2, q3, q4, q5, q6, q7].some((v) => v == null || v < 0 || v > 4)) {
    return NextResponse.json({ error: '각 문항은 0~4 사이의 값이어야 합니다.' }, { status: 400 })
  }

  const total_score = q1 + q2 + q3 + q4 + q5 + q6 + q7

  const { data, error } = await supabase
    .from('isi_assessments')
    .insert({
      patient_id: userRole.patient_id,
      assessed_at: new Date().toISOString(),
      q1, q2, q3, q4, q5, q6, q7,
      total_score,
    })
    .select('id, total_score')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
