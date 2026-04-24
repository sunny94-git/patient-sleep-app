import { NextResponse } from 'next/server'
import { requirePatient } from '@/lib/supabase/admin'

export async function GET() {
  const { supabase, patientId } = await requirePatient()

  const { data, error } = await supabase
    .from('isi_assessments')
    .select('*')
    .eq('patient_id', patientId)
    .order('assessed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ assessment: data })
}
