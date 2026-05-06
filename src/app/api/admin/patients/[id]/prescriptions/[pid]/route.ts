import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

type Params = { params: Promise<{ id: string; pid: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { pid } = await params
  const body = await request.json()
  const { visit_date, prescription, treatment_notes } = body
  const updateData = { visit_date, prescription: prescription || null, treatment_notes: treatment_notes || null }

  const { data, error: dbErr } = await supabase
    .from('treatment_records')
    .update(updateData)
    .eq('id', pid)
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { pid } = await params
  const { error: dbErr } = await supabase.from('treatment_records').delete().eq('id', pid)
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
