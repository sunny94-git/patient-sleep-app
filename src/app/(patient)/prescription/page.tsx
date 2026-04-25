import { requirePatient } from '@/lib/supabase/admin'
import PrescriptionClient from './PrescriptionClient'

export default async function PrescriptionPage() {
  const { supabase, patientId } = await requirePatient()

  const [treatmentsRes, examsRes] = await Promise.all([
    supabase.from('treatment_records').select('*').eq('patient_id', patientId).order('visit_date', { ascending: false }),
    supabase.from('exam_results').select('*').eq('patient_id', patientId).order('exam_date', { ascending: false }),
  ])

  return <PrescriptionClient treatments={treatmentsRes.data ?? []} exams={examsRes.data?.map(e => ({ ...e, result_data: e.result_data as Record<string, unknown> | null })) ?? []} />
}
