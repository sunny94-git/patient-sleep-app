import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { data, error: dbErr } = await supabase
    .from('patients')
    .select(`
      id, registration_number, name, birth_date, phone, created_at,
      sleep_disorders ( id, diagnosis, severity, onset_date, notes ),
      treatment_records ( id, visit_date, prescription, treatment_notes, next_visit_date, created_at )
    `)
    .eq('id', id)
    .single()

  if (dbErr || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { name, birth_date, phone } = body

  const { data, error: dbErr } = await supabase
    .from('patients')
    .update({ name, birth_date: birth_date || null, phone: phone || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}
