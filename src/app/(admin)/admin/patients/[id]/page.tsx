import { requireAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import PatientDetailClient from './PatientDetailClient'

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { supabase } = await requireAdmin()
  const { id } = await params

  const [patientRes, diariesRes, treatmentsRes, examsRes, qnaRes] = await Promise.all([
    supabase.from('patients').select('*').eq('id', id).single(),
    supabase.from('sleep_diary').select('*').eq('patient_id', id).order('diary_date', { ascending: false }).limit(90),
    supabase.from('treatment_records').select('*').eq('patient_id', id).order('visit_date', { ascending: false }),
    supabase.from('exam_results').select('*').eq('patient_id', id).order('exam_date', { ascending: false }),
    supabase.from('qna').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
  ])

  if (!patientRes.data) redirect('/admin/patients')

  return (
    <PatientDetailClient
      patient={patientRes.data}
      diaries={diariesRes.data ?? []}
      treatments={treatmentsRes.data ?? []}
      exams={examsRes.data ?? []}
      qnaList={qnaRes.data ?? []}
    />
  )
}
