import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase } = await requireAdmin()
  const { id } = await params

  const [patientRes, disorderRes] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).single(),
    supabase.from('sleep_disorders').select('*').eq('patient_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  if (patientRes.error) return NextResponse.json({ error: patientRes.error.message }, { status: 404 })
  return NextResponse.json({ patient: patientRes.data, disorder: disorderRes.data })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase } = await requireAdmin()
  const { id } = await params
  const body = await req.json()

  const { error: updErr } = await supabase
    .from('patients')
    .update({
      name: body.name,
      birth_date: body.birth_date || null,
      phone: body.phone || null,
    })
    .eq('id', id)

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  if (body.diagnosis) {
    const { data: existing } = await supabase
      .from('sleep_disorders')
      .select('id')
      .eq('patient_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('sleep_disorders')
        .update({
          diagnosis: body.diagnosis,
          severity: body.severity ?? null,
          onset_date: body.onset_date || null,
          notes: body.notes || null,
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('sleep_disorders').insert({
        patient_id: id,
        diagnosis: body.diagnosis,
        severity: body.severity ?? null,
        onset_date: body.onset_date || null,
        notes: body.notes || null,
      })
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase } = await requireAdmin()
  const { id } = await params

  const { error } = await supabase.from('patients').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
