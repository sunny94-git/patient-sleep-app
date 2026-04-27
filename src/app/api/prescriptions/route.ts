import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('patient_id').eq('id', user.id).single()
  if (!role?.patient_id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data } = await supabase
    .from('treatment_records')
    .select('id, visit_date, prescription, treatment_notes, next_visit_date, created_at')
    .eq('patient_id', role.patient_id)
    .order('visit_date', { ascending: false })

  return NextResponse.json(data ?? [])
}
