import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

type Params = { params: Promise<{ id: string; eid: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { eid } = await params
  const body = await request.json()
  const { exam_date, exam_type, result_data, summary } = body

  const { data, error: dbErr } = await supabase
    .from('exam_results')
    .update({ exam_date, exam_type, result_data, summary })
    .eq('id', eid)
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { eid } = await params

  const { error: dbErr } = await supabase
    .from('exam_results')
    .delete()
    .eq('id', eid)

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
