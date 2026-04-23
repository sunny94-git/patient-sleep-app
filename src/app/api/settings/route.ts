import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_FIELDS = ['push_enabled', 'diary_remind', 'med_alarm', 'qna_alarm'] as const
type SettingsField = (typeof ALLOWED_FIELDS)[number]

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('settings')
    .select('push_enabled, diary_remind, med_alarm, qna_alarm')
    .eq('id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(
    data ?? { push_enabled: false, diary_remind: false, med_alarm: false, qna_alarm: false }
  )
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as Partial<Record<SettingsField, boolean>>

  const updates: Partial<Record<SettingsField, boolean>> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      if (typeof body[field] !== 'boolean') {
        return NextResponse.json({ error: `Invalid value for ${field}` }, { status: 400 })
      }
      updates[field] = body[field]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
  }

  const { error } = await supabase
    .from('settings')
    .upsert({ id: user.id, ...updates })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
