import { requirePatient } from '@/lib/supabase/admin'
import ISIClient from './ISIClient'

export default async function ISIPage() {
  const { supabase, patientId } = await requirePatient()

  const [latestRes, historyRes] = await Promise.all([
    supabase.from('isi_assessments').select('*').eq('patient_id', patientId).order('assessed_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('isi_assessments').select('id, assessed_at, total_score').eq('patient_id', patientId).order('assessed_at', { ascending: false }),
  ])

  return <ISIClient latestAssessment={latestRes.data} history={historyRes.data ?? []} />
}
