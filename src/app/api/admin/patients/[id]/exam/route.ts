import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { data } = await supabase
    .from('exam_results')
    .select('id, exam_date, exam_type, result_data, summary, created_at')
    .eq('patient_id', id)
    .order('exam_date', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request, { params }: Params) {
  const { error, supabase, user } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { exam_date, exam_type, result_data, summary } = body

  if (!exam_date || !exam_type) {
    return NextResponse.json({ error: 'exam_date, exam_type required' }, { status: 400 })
  }

  const { data, error: dbErr } = await supabase
    .from('exam_results')
    .insert({ patient_id: id, exam_date, exam_type, result_data, summary, created_by: user?.id })
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
