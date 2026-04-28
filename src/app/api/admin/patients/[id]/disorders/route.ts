import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { data, error: dbErr } = await supabase
    .from('sleep_disorders')
    .select('id, diagnosis, severity, onset_date, notes')
    .eq('patient_id', id)
    .order('created_at', { ascending: false })

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { diagnosis, severity, onset_date, notes } = body

  if (!diagnosis?.trim()) {
    return NextResponse.json({ error: '진단명은 필수입니다.' }, { status: 400 })
  }

  const { data, error: dbErr } = await supabase
    .from('sleep_disorders')
    .insert({
      patient_id: id,
      diagnosis: diagnosis.trim(),
      severity: severity || null,
      onset_date: onset_date || null,
      notes: notes?.trim() || null,
    })
    .select('id, diagnosis, severity, onset_date, notes')
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
