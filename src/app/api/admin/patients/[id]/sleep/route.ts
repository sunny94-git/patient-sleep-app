import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase
    .from('sleep_diary')
    .select('*')
    .eq('patient_id', id)
    .order('diary_date', { ascending: false })
    .limit(90)

  if (from) query = query.gte('diary_date', from)
  if (to) query = query.lte('diary_date', to)

  const { data } = await query
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request, { params }: Params) {
  const { error, supabase, user } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()

  const { data, error: dbErr } = await supabase
    .from('sleep_diary')
    .upsert(
      { ...body, patient_id: id, updated_by: user?.id },
      { onConflict: 'patient_id,diary_date' }
    )
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
