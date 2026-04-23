import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('user_roles').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const adminUser = await requireAdmin(supabase)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    registration_number,
    name,
    birth_date,
    phone,
    diagnosis,
    severity,
    onset_date,
    notes,
    prescription,
    treatment_notes,
    visit_date,
    next_visit_date,
  } = body

  if (!registration_number || !name || !diagnosis) {
    return NextResponse.json({ error: '등록번호, 이름, 진단명은 필수입니다.' }, { status: 400 })
  }

  // 등록번호 중복 확인
  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('registration_number', registration_number)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: '이미 사용 중인 등록번호입니다.' }, { status: 409 })
  }

  // 환자 생성
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .insert({
      registration_number,
      name,
      birth_date: birth_date || null,
      phone: phone || null,
    })
    .select('id')
    .single()

  if (patientError || !patient) {
    return NextResponse.json({ error: patientError?.message ?? '환자 생성 실패' }, { status: 500 })
  }

  // 진단 정보 생성
  await supabase.from('sleep_disorders').insert({
    patient_id: patient.id,
    diagnosis,
    severity: severity || null,
    onset_date: onset_date || null,
    notes: notes || null,
  })

  // 처방 정보 생성 (있는 경우)
  if (prescription || visit_date) {
    await supabase.from('treatment_records').insert({
      patient_id: patient.id,
      prescription: prescription || null,
      treatment_notes: treatment_notes || null,
      visit_date: visit_date || null,
      next_visit_date: next_visit_date || null,
    })
  }

  return NextResponse.json({ id: patient.id })
}
