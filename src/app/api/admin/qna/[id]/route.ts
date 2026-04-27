import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { error, supabase, user } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const { answer } = await request.json()
  if (!answer?.trim()) return NextResponse.json({ error: 'answer required' }, { status: 400 })

  const { data, error: dbErr } = await supabase
    .from('qna')
    .update({
      answer: answer.trim(),
      is_answered: true,
      answered_by: user?.id,
      answered_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json(data)
}
