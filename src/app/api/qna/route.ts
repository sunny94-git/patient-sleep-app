import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('patient_id')
    .eq('id', user.id)
    .single()

  if (!userRole?.patient_id) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('qna')
    .select('id, question, answer, is_answered, answered_at, created_at')
    .eq('patient_id', userRole.patient_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('patient_id')
    .eq('id', user.id)
    .single()

  if (!userRole?.patient_id) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const body = await request.json()
  const question = (body.question as string)?.trim()

  if (!question || question.length === 0) {
    return NextResponse.json({ error: '질문 내용을 입력해주세요.' }, { status: 400 })
  }
  if (question.length > 1000) {
    return NextResponse.json({ error: '질문은 1000자 이내로 작성해주세요.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('qna')
    .insert({ patient_id: userRole.patient_id, question })
    .select('id, question, answer, is_answered, answered_at, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
