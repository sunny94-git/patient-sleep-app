'use client'

import { useState } from 'react'
import { getISISeverity } from '@/types'

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
}

interface IsiHistory {
  id: string
  assessed_at: string
  total_score: number
}

export default function RecordsClient({
  treatments,
  exams,
  isiHistory,
}: {
  treatments: Treatment[]
  exams: Exam[]
  isiHistory: IsiHistory[]
}) {
  const [tab, setTab] = useState<'visit' | 'exam' | 'isi'>('visit')

  const TABS = [
    { key: 'visit', label: '방문 기록' },
    { key: 'exam', label: '검사 기록' },
    { key: 'isi', label: 'ISI 추이' },
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-brand-500 px-5 pt-12 pb-6 text-white">
        <h1 className="text-xl font-bold">진료 기록</h1>
        <p className="text-sm text-blue-200 mt-1">방문·검사·ISI 이력</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex bg-gray-200 rounded-xl p-1">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === key ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'visit' && (
          <div className="space-y-3">
            {treatments.length === 0
              ? <p className="text-sm text-gray-400 text-center py-10">방문 기록이 없습니다.</p>
              : treatments.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl shadow-card p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{t.visit_date ?? '—'}</span>
                    {t.next_visit_date && <span className="text-xs text-gray-400">다음: {t.next_visit_date}</span>}
                  </div>
                  {t.prescription && <p className="text-sm text-gray-700 whitespace-pre-wrap">{t.prescription}</p>}
                  {t.treatment_notes && <p className="text-xs text-gray-500 pt-1 border-t border-gray-100 whitespace-pre-wrap">{t.treatment_notes}</p>}
                </div>
              ))
            }
          </div>
        )}

        {tab === 'exam' && (
          <div className="space-y-3">
            {exams.length === 0
              ? <p className="text-sm text-gray-400 text-center py-10">검사 기록이 없습니다.</p>
              : exams.map((e) => (
                <div key={e.id} className="bg-white rounded-2xl shadow-card p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">{e.exam_type}</span>
                    <span className="text-sm font-semibold text-gray-900">{e.exam_date}</span>
                  </div>
                  {e.summary && <p className="text-sm text-gray-600">{e.summary}</p>}
                </div>
              ))
            }
          </div>
        )}

        {tab === 'isi' && (
          <div className="space-y-3">
            {isiHistory.length === 0
              ? <p className="text-sm text-gray-400 text-center py-10">ISI 기록이 없습니다.</p>
              : isiHistory.map((h) => {
                const s = getISISeverity(h.total_score)
                const color = s === '없음' ? 'text-green-600' : s === '경미' ? 'text-yellow-600' : s === '중등도' ? 'text-orange-500' : 'text-red-500'
                return (
                  <div key={h.id} className="bg-white rounded-2xl shadow-card px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{h.assessed_at.slice(0, 10)}</span>
                    <span className={`text-sm font-semibold ${color}`}>{h.total_score}점 ({s})</span>
                  </div>
                )
              })
            }
          </div>
        )}
      </div>
    </div>
  )
}
