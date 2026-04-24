import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await requireAdmin()
  const { id } = await params
  const body = await req.json()

  if (!body.exam_date || !body.exam_type) {
    return NextResponse.json({ error: '검사일과 검사 종류가 필요합니다.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('exam_results')
    .insert({
      patient_id: id,
      exam_date: body.exam_date,
      exam_type: body.exam_type,
      result_data: body.result_data ?? null,
      summary: body.summary || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}
