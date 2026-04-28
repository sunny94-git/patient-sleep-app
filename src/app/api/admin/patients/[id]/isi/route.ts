import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { data, error: dbErr } = await supabase
    .from('isi_assessments')
    .select('id, assessed_at, total_score, q1, q2, q3, q4, q5, q6, q7')
    .eq('patient_id', id)
    .order('assessed_at', { ascending: true })

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
