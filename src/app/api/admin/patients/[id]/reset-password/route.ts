import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { password } = body

  if (!password || password.length < 6) {
    return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  // patients.id → user_roles → auth user id 조회
  const { data: roleRow, error: roleErr } = await adminClient
    .from('user_roles')
    .select('id')
    .eq('patient_id', id)
    .single()

  if (roleErr || !roleRow) {
    return NextResponse.json({ error: '해당 환자의 계정을 찾을 수 없습니다.' }, { status: 404 })
  }

  const { error: updateErr } = await adminClient.auth.admin.updateUserById(roleRow.id, { password })
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
