import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

const TYPE_MAP: Record<string, 'HRV' | 'InBody' | 'QEEG'> = {
  hrv: 'HRV',
  HRV: 'HRV',
  inbody: 'InBody',
  InBody: 'InBody',
  qeeg: 'QEEG',
  QEEG: 'QEEG',
}

export async function POST(req: Request) {
  const { supabase, user } = await requireAdmin()
  const body = await req.json()

  const exam_type = TYPE_MAP[body.exam_type]
  if (!body.patient_id || !body.exam_date || !exam_type) {
    return NextResponse.json({ error: '필수 입력이 누락되었습니다.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('exam_results')
    .insert({
      patient_id: body.patient_id,
      exam_date: body.exam_date,
      exam_type,
      result_data: body.result_data ?? null,
      summary: body.summary || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}
