import { NextResponse } from 'next/server'
import { requirePatient } from '@/lib/supabase/admin'

export async function GET() {
  const { supabase, patientId } = await requirePatient()
  const { data, error } = await supabase
    .from('qna')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}

export async function POST(req: Request) {
  const { supabase, patientId } = await requirePatient()
  const body = await req.json()

  if (!body.question?.trim()) {
    return NextResponse.json({ error: '질문 내용을 입력해주세요.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('qna')
    .insert({
      patient_id: patientId,
      question: body.question.trim(),
      is_answered: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}
