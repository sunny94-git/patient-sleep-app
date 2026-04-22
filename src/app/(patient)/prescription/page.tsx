import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PrescriptionPage() {
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

  const patientId = userRole.patient_id

  const [{ data: records }, { data: exams }] = await Promise.all([
    supabase
      .from('treatment_records')
      .select('id, visit_date, prescription, treatment_notes, next_visit_date')
      .eq('patient_id', patientId)
      .order('visit_date', { ascending: false }),
    supabase
      .from('exam_results')
      .select('id, exam_date, exam_type, summary')
      .eq('patient_id', patientId)
      .order('exam_date', { ascending: false }),
  ])

  const EXAM_LABEL: Record<string, string> = {
    HRV: '심박변이도 (HRV)',
    InBody: '체성분 (InBody)',
    QEEG: '뇌파 (QEEG)',
  }

  return (
    <div className="px-4 pt-6 pb-8 space-y-4">
      <h1 className="text-h2 text-gray-900">💊 처방 및 진료 기록</h1>

      {/* 진료 기록 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">📋 진료 기록</h2>

        {(!records || records.length === 0) ? (
          <div className="card text-center py-6">
            <p className="text-sm text-gray-400">아직 진료 기록이 없어요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec) => (
              <div key={rec.id} className="card space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">
                    🗓 {rec.visit_date}
                  </p>
                  {rec.next_visit_date && (
                    <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      다음 방문: {rec.next_visit_date}
                    </span>
                  )}
                </div>

                {rec.prescription && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">처방</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {rec.prescription}
                    </p>
                  </div>
                )}

                {rec.treatment_notes && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">진료 메모</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {rec.treatment_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 검사 결과 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">🔬 검사 결과</h2>

        {(!exams || exams.length === 0) ? (
          <div className="card text-center py-6">
            <p className="text-sm text-gray-400">아직 검사 결과가 없어요.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exams.map((exam) => (
              <div key={exam.id} className="card space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                    {EXAM_LABEL[exam.exam_type] ?? exam.exam_type}
                  </span>
                  <p className="text-xs text-gray-400">{exam.exam_date}</p>
                </div>
                {exam.summary ? (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {exam.summary}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">결과 요약 없음</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
