import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: Promise<{ type: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await supabase.from('user_roles').select('patient_id').eq('id', user.id).single()
  if (!role?.patient_id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { type } = await params
  const examType = type.toUpperCase() as 'HRV' | 'InBody' | 'QEEG'

  const { data } = await supabase
    .from('exam_results')
    .select('id, exam_date, exam_type, result_data, summary')
    .eq('patient_id', role.patient_id)
    .eq('exam_type', examType)
    .order('exam_date', { ascending: false })

  return NextResponse.json(data ?? [])
}
