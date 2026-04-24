import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('user_roles').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const [patientRes, disorderRes] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).single(),
    supabase.from('sleep_disorders').select('*').eq('patient_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  if (!patientRes.data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ patient: patientRes.data, disorder: disorderRes.data })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { name, birth_date, phone, diagnosis, severity, onset_date, notes } = body

  if (!name) return NextResponse.json({ error: '이름은 필수입니다.' }, { status: 400 })

  const { error: patientError } = await supabase
    .from('patients')
    .update({ name, birth_date: birth_date || null, phone: phone || null })
    .eq('id', id)

  if (patientError) return NextResponse.json({ error: patientError.message }, { status: 500 })

  // 진단 정보 upsert
  if (diagnosis) {
    const { data: existing } = await supabase
      .from('sleep_disorders')
      .select('id')
      .eq('patient_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      await supabase.from('sleep_disorders').update({
        diagnosis,
        severity: severity || null,
        onset_date: onset_date || null,
        notes: notes || null,
      }).eq('id', existing.id)
    } else {
      await supabase.from('sleep_disorders').insert({
        patient_id: id,
        diagnosis,
        severity: severity || null,
        onset_date: onset_date || null,
        notes: notes || null,
      })
    }
  }

  return NextResponse.json({ ok: true })
}
