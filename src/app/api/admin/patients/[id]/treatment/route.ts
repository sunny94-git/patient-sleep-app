import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await requireAdmin()
  const { id } = await params
  const body = await req.json()

  if (!body.visit_date) {
    return NextResponse.json({ error: '진료일을 입력해주세요.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('treatment_records')
    .insert({
      patient_id: id,
      visit_date: body.visit_date,
      prescription: body.prescription || null,
      treatment_notes: body.treatment_notes || null,
      next_visit_date: body.next_visit_date || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}
