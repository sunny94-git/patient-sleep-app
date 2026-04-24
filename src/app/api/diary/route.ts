import { NextResponse } from 'next/server'
import { requirePatient } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { supabase, patientId } = await requirePatient()
  const url = new URL(req.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  let q = supabase
    .from('sleep_diary')
    .select('*')
    .eq('patient_id', patientId)
    .order('diary_date', { ascending: false })

  if (from) q = q.gte('diary_date', from)
  if (to) q = q.lte('diary_date', to)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(req: Request) {
  const { supabase, patientId } = await requirePatient()
  const body = await req.json()

  if (!body.diary_date) {
    return NextResponse.json({ error: '날짜가 필요합니다.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('sleep_diary')
    .upsert(
      { ...body, patient_id: patientId },
      { onConflict: 'patient_id,diary_date' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}
