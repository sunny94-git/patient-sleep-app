import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('user_roles').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

type Params = { patientId: string; date: string }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { patientId, date } = await params

  const { data } = await supabase
    .from('sleep_diary')
    .select('total_sleep_min, deep_sleep_min, light_sleep_min, rem_sleep_min, admin_note')
    .eq('patient_id', patientId)
    .eq('diary_date', date)
    .maybeSingle()

  return NextResponse.json({ data })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { patientId, date } = await params
  const body = await request.json()

  const { error } = await supabase
    .from('sleep_diary')
    .upsert(
      { patient_id: patientId, diary_date: date, ...body },
      { onConflict: 'patient_id,diary_date' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
