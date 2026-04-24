import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ patients: data ?? [] })
}

export async function POST(req: Request) {
  const { supabase } = await requireAdmin()
  const body = await req.json()

  if (!body.name?.trim() || !body.registration_number?.trim()) {
    return NextResponse.json({ error: '이름과 등록번호는 필수입니다.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      name: body.name.trim(),
      registration_number: body.registration_number.trim(),
      birth_date: body.birth_date || null,
      phone: body.phone || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.diagnosis) {
    await supabase.from('sleep_disorders').insert({
      patient_id: data.id,
      diagnosis: body.diagnosis,
      severity: body.severity ?? null,
      onset_date: body.onset_date || null,
      notes: body.notes || null,
    })
  }

  return NextResponse.json({ patient: data })
}
