import { NextResponse } from 'next/server'
import { requirePatient } from '@/lib/supabase/admin'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, patientId } = await requirePatient()
  const { id } = await params
  const body = await req.json()

  const { admin_note: _ignored, patient_id: _ignored2, ...updates } = body

  const { data, error } = await supabase
    .from('sleep_diary')
    .update(updates)
    .eq('id', id)
    .eq('patient_id', patientId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, patientId } = await requirePatient()
  const { id } = await params

  const { error } = await supabase
    .from('sleep_diary')
    .delete()
    .eq('id', id)
    .eq('patient_id', patientId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
