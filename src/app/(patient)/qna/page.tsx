import { requirePatient } from '@/lib/supabase/admin'
import QnAClient from './QnAClient'

export default async function QnAPage() {
  const { supabase, patientId } = await requirePatient()

  const { data } = await supabase
    .from('qna')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  return <QnAClient initialItems={data ?? []} />
}
