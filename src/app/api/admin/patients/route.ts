import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { data } = await supabase
    .from('patients')
    .select('id, registration_number, name, birth_date, phone, created_at')
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const { registration_number, name, birth_date, phone, password } = body

  if (!registration_number || !name || !password) {
    return NextResponse.json({ error: 'registration_number, name, password required' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const email = `${registration_number}@patient.local`

  const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

  const { data: patient, error: patErr } = await supabase
    .from('patients')
    .insert({ registration_number, name, birth_date: birth_date || null, phone: phone || null })
    .select()
    .single()

  if (patErr) {
    await adminClient.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: patErr.message }, { status: 500 })
  }

  const { error: roleErr } = await adminClient.from('user_roles').insert({ id: authUser.user.id, role: 'patient', patient_id: patient.id })
  if (roleErr) {
    await adminClient.auth.admin.deleteUser(authUser.user.id)
    await supabase.from('patients').delete().eq('id', patient.id)
    return NextResponse.json({ error: roleErr.message }, { status: 500 })
  }

  return NextResponse.json(patient, { status: 201 })
}
