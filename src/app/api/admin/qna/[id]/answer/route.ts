import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await requireAdmin()
  const { id } = await params
  const body = await req.json()

  if (!body.answer?.trim()) {
    return NextResponse.json({ error: '답변을 입력해주세요.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('qna')
    .update({
      answer: body.answer.trim(),
      is_answered: true,
      answered_by: user.id,
      answered_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}
