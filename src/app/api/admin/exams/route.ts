import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('user_roles').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const adminUser = await requireAdmin(supabase)
  if (!adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { patient_id, exam_date, exam_type, result_data, summary } = await request.json()

  if (!patient_id || !exam_date || !exam_type) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  const { error } = await supabase.from('exam_results').insert({
    patient_id,
    exam_date,
    exam_type,
    result_data: result_data ?? {},
    summary: summary ?? null,
    created_by: adminUser.id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
