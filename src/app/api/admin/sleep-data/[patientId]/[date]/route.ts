import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ patientId: string; date: string }> }
) {
  const { supabase, user } = await requireAdmin()
  const { patientId, date } = await params
  const body = await req.json()

  const payload = {
    ...body,
    patient_id: patientId,
    diary_date: date,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('sleep_diary')
    .upsert(payload, { onConflict: 'patient_id,diary_date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}
