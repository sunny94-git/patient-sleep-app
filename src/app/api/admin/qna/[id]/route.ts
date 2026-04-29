import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPushToPatient } from '@/lib/push'

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
    .select('id, patient_id')
    .single()

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  // 환자 qna_alarm 설정 확인 후 푸시 발송
  if (data?.patient_id) {
    const adminClient = createAdminClient()
    const { data: roleRow } = await adminClient
      .from('user_roles')
      .select('id')
      .eq('patient_id', data.patient_id)
      .single()

    if (roleRow?.id) {
      const { data: settings } = await adminClient
        .from('settings')
        .select('qna_alarm')
        .eq('id', roleRow.id)
        .single()

      if (settings?.qna_alarm) {
        await sendPushToPatient(adminClient, data.patient_id, {
          title: '수면클리닉',
          body: '문의에 답변이 등록됐습니다.',
          url: '/qna',
        })
      }
    }
  }

  return NextResponse.json(data)
}
