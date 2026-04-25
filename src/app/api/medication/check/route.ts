import { NextResponse } from 'next/server'
import { requirePatient } from '@/lib/supabase/admin'

function getKSTDate() {
  const now = new Date()
  const kstMs = now.getTime() + (9 * 60 + now.getTimezoneOffset()) * 60 * 1000
  return new Date(kstMs).toISOString().slice(0, 10)
}

const VALID_TIMINGS = ['morning', 'lunch', 'evening', 'bedtime'] as const
const VALID_KINDS = ['herbal', 'western'] as const

export async function POST(req: Request) {
  const { supabase, patientId } = await requirePatient()
  const { kind, timing, checked, date } = await req.json()

  if (!VALID_KINDS.includes(kind) || !VALID_TIMINGS.includes(timing)) {
    return NextResponse.json({ error: 'Invalid kind or timing.' }, { status: 400 })
  }

  const diary_date = date || getKSTDate()
  const column = `${kind}_${timing}` as const

  const { data: existing } = await supabase
    .from('sleep_diary')
    .select('id')
    .eq('patient_id', patientId)
    .eq('diary_date', diary_date)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = existing
    ? await supabase
        .from('sleep_diary')
        .update({ [column]: checked } as any)
        .eq('id', existing.id)
        .select()
        .single()
    : await supabase
        .from('sleep_diary')
        .insert({
          patient_id: patientId,
          diary_date,
          nap_taken: false,
          alcohol: false,
          [column]: checked,
        } as any)
        .select()
        .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}
