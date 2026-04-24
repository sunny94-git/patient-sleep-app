import { NextResponse } from 'next/server'
import { requirePatient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { supabase, patientId } = await requirePatient()
  const body = await req.json()

  const scores = [body.q1, body.q2, body.q3, body.q4, body.q5, body.q6, body.q7]
  if (scores.some((s) => typeof s !== 'number' || s < 0 || s > 4)) {
    return NextResponse.json({ error: '모든 문항에 응답해주세요 (0~4).' }, { status: 400 })
  }

  const total_score = scores.reduce((a, b) => a + b, 0)

  const { data, error } = await supabase
    .from('isi_assessments')
    .insert({
      patient_id: patientId,
      assessed_at: new Date().toISOString(),
      q1: body.q1, q2: body.q2, q3: body.q3, q4: body.q4,
      q5: body.q5, q6: body.q6, q7: body.q7,
      total_score,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ assessment: data, total_score })
}
