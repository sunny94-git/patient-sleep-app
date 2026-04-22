import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QnAClient from './QnAClient'

export default async function QnAPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (!user || authError) redirect('/login')

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('patient_id')
    .eq('id', user.id)
    .single()

  if (!userRole?.patient_id) redirect('/login')

  const { data: items } = await supabase
    .from('qna')
    .select('id, question, answer, is_answered, answered_at, created_at')
    .eq('patient_id', userRole.patient_id)
    .order('created_at', { ascending: false })

  return <QnAClient initialItems={items ?? []} />
}
