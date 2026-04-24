import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { supabase } = await requireAdmin()
  const url = new URL(req.url)
  const patientId = url.searchParams.get('patient_id')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  if (!patientId) {
    return NextResponse.json({ error: 'patient_id is required.' }, { status: 400 })
  }

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
