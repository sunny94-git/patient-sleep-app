import { NextResponse } from 'next/server'
import { requirePatient } from '@/lib/supabase/admin'

export async function GET() {
  const { supabase, user } = await requirePatient()
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    settings: data ?? {
      id: user.id,
      push_enabled: true,
      diary_remind: true,
      med_alarm: true,
      qna_alarm: true,
    },
  })
}

export async function PUT(req: Request) {
  const { supabase, user } = await requirePatient()
  const body = await req.json()

  const { data, error } = await supabase
    .from('settings')
    .upsert({
      id: user.id,
      push_enabled: body.push_enabled ?? true,
      diary_remind: body.diary_remind ?? true,
      med_alarm: body.med_alarm ?? true,
      qna_alarm: body.qna_alarm ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}
