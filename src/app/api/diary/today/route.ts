import { NextResponse } from 'next/server'
import { requirePatient } from '@/lib/supabase/admin'

function getKSTDate() {
  const now = new Date()
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  return new Date(kstMs).toISOString().slice(0, 10)
}

export async function GET() {
  const { supabase, patientId } = await requirePatient()
  const today = getKSTDate()

  const { data, error } = await supabase
    .from('sleep_diary')
    .select('*')
    .eq('patient_id', patientId)
    .eq('diary_date', today)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ diary: data, date: today })
}
