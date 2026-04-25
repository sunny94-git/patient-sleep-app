'use client'

import { useState } from 'react'
import { FileText, Microscope } from 'lucide-react'

interface Treatment {
  id: string
  visit_date: string | null
  prescription: string | null
  treatment_notes: string | null
  next_visit_date: string | null
}

interface Exam {
  id: string
  exam_date: string
  exam_type: string
  summary: string | null
  result_data: Record<string, unknown> | null
}

export default function PrescriptionClient({
  treatments,
  exams,
}: {
  treatments: Treatment[]
  exams: Exam[]
}) {
  const [tab, setTab] = useState<'prescription' | 'exam'>('prescription')

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-brand-500 px-5 pt-12 pb-6 text-white">
        <h1 className="text-xl font-bold">처방·검사</h1>
        <p className="text-sm text-blue-200 mt-1">처방 및 검사 결과 확인</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex bg-gray-200 rounded-xl p-1">
          {(['prescription', 'exam'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}>
              {t === 'prescription' ? '처방 기록' : '검사 결과'}
            </button>
          ))}
        </div>

        {tab === 'prescription' && (
          <div className="space-y-3">
            {treatments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">처방 기록이 없습니다.</p>
            ) : (
              treatments.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl shadow-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-brand-500" />
                    <span className="text-sm font-semibold text-gray-900">{t.visit_date ?? '—'}</span>
                    {t.next_visit_date && (
                      <span className="text-xs text-gray-400 ml-auto">다음 방문: {t.next_visit_date}</span>
                    )}
                  </div>
                  {t.prescription && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{t.prescription}</p>
                  )}
                  {t.treatment_notes && (
                    <p className="text-xs text-gray-500 border-t border-gray-100 pt-2 whitespace-pre-wrap">{t.treatment_notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'exam' && (
          <div className="space-y-3">
            {exams.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">검사 결과가 없습니다.</p>
            ) : (
              exams.map((e) => (
                <div key={e.id} className="bg-white rounded-2xl shadow-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Microscope size={15} className="text-brand-500" />
                    <span className="text-xs font-medium bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">{e.exam_type}</span>
                    <span className="text-sm font-semibold text-gray-900">{e.exam_date}</span>
                  </div>
                  {e.summary && <p className="text-sm text-gray-700">{e.summary}</p>}
                  {e.result_data && Object.keys(e.result_data).length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                      {Object.entries(e.result_data).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span className="text-gray-500">{k}</span>
                          <span className="font-medium text-gray-800">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
