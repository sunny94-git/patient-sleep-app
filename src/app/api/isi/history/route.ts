import { NextResponse } from 'next/server'
import { requirePatient } from '@/lib/supabase/admin'

export async function GET() {
  const { supabase, patientId } = await requirePatient()

  const { data, error } = await supabase
    .from('isi_assessments')
    .select('id, assessed_at, total_score')
    .eq('patient_id', patientId)
    .order('assessed_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}
