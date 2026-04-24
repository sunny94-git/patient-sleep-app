import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase } = await requireAdmin()
  const { id } = await params
  const body = await req.json()

  const { data, error } = await supabase
    .from('treatment_records')
    .update({
      visit_date: body.visit_date || null,
      prescription: body.prescription || null,
      treatment_notes: body.treatment_notes || null,
      next_visit_date: body.next_visit_date || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase } = await requireAdmin()
  const { id } = await params

  const { error } = await supabase.from('treatment_records').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
