import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { data } = await supabase
    .from('treatment_records')
    .select('id, visit_date, prescription, treatment_notes, next_visit_date, created_at')
    .eq('patient_id', id)
    .order('visit_date', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request, { params }: Params) {
  const { error, supabase, user } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { visit_date, prescription, treatment_notes } = body

  const { data, error: dbErr } = await supabase
    .from('treatment_records')
    .insert({ patient_id: id, visit_date, prescription: prescription || null, treatment_notes: treatment_notes || null, created_by: user?.id })
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
