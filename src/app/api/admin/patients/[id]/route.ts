import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/server'

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

export async function DELETE(_req: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const adminClient = createAdminClient()

  // auth user id 조회
  const { data: roleRow } = await adminClient
    .from('user_roles')
    .select('id')
    .eq('patient_id', id)
    .single()

  // patients 삭제 (FK cascade → sleep_disorders, sleep_diary 등 연쇄 삭제)
  const { error: delErr } = await supabase.from('patients').delete().eq('id', id)
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  // Auth 계정 삭제
  if (roleRow?.id) {
    await adminClient.auth.admin.deleteUser(roleRow.id)
  }

  return new NextResponse(null, { status: 204 })
}
