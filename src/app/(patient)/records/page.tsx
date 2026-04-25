import { requirePatient } from '@/lib/supabase/admin'
import RecordsClient from './RecordsClient'

export default async function RecordsPage() {
  const { supabase, patientId } = await requirePatient()

  const [treatmentsRes, examsRes, isiRes] = await Promise.all([
    supabase.from('treatment_records').select('*').eq('patient_id', patientId).order('visit_date', { ascending: false }),
    supabase.from('exam_results').select('id, exam_date, exam_type, summary').eq('patient_id', patientId).order('exam_date', { ascending: false }),
    supabase.from('isi_assessments').select('id, assessed_at, total_score').eq('patient_id', patientId).order('assessed_at', { ascending: false }),
  ])

  return (
    <RecordsClient
      treatments={treatmentsRes.data ?? []}
      exams={examsRes.data ?? []}
      isiHistory={isiRes.data ?? []}
    />
  )
}
