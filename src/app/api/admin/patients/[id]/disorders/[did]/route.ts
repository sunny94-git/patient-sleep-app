import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

type Params = { params: Promise<{ id: string; did: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id, did } = await params
  const body = await request.json()
  const { diagnosis, severity, onset_date, notes } = body

  if (diagnosis !== undefined && !diagnosis?.trim()) {
    return NextResponse.json({ error: '진단명은 필수입니다.' }, { status: 400 })
  }

  const patch: Record<string, string | null> = {}
  if (diagnosis !== undefined) patch.diagnosis = diagnosis.trim()
  if (severity !== undefined) patch.severity = severity || null
  if (onset_date !== undefined) patch.onset_date = onset_date || null
  if (notes !== undefined) patch.notes = notes?.trim() || null

  const { data, error: dbErr } = await supabase
    .from('sleep_disorders')
    .update(patch)
    .eq('id', did)
    .eq('patient_id', id)
    .select('id, diagnosis, severity, onset_date, notes')
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id, did } = await params
  const { error: dbErr } = await supabase
    .from('sleep_disorders')
    .delete()
    .eq('id', did)
    .eq('patient_id', id)

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
