'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface TreatmentRecord {
  id: string
  visit_date: string
  prescription: string | null
  treatment_notes: string | null
  next_visit_date: string | null
}

interface PrescriptionClientProps {
  records: TreatmentRecord[]
}

function parsePrescriptionName(text: string | null): string {
  if (!text) return '처방 내역'
  return text.split('\n')[0].trim() || '처방 내역'
}

export default function PrescriptionClient({ records }: PrescriptionClientProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  if (records.length === 0) {
    return (
      <div className="px-4 pt-6 pb-8">
        <h1 className="text-h2 text-gray-900 mb-4">💊 내 처방</h1>
        <div className="card text-center py-10">
          <p className="text-2xl mb-2">💊</p>
          <p className="text-sm text-gray-500 font-medium">현재 처방된 한약이 없습니다.</p>
          <p className="text-xs text-gray-400 mt-1">진료 후 처방 정보가 등록되면 여기에 표시돼요.</p>
        </div>
      </div>
    )
  }

  const current = records[0]
  const history = records.slice(1)

  function toggleOpen(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const isActive = (rec: TreatmentRecord) => {
    if (!rec.next_visit_date) return true
    return rec.next_visit_date >= new Date().toISOString().slice(0, 10)
  }

  return (
    <div className="px-4 pt-6 pb-8 space-y-5">
      <h1 className="text-h2 text-gray-900">💊 내 처방</h1>

      {/* 현재 처방 */}
      <section className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">현재 처방</p>
        <div className="card space-y-4">
          {/* 처방명 */}
          <div className="flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="text-base font-bold text-gray-900">
                {parsePrescriptionName(current.prescription)}
              </p>
              {isActive(current) && (
                <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full">
                  복약 중
                </span>
              )}
            </div>
          </div>

          {/* 복약 기간 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="text-base">🗓</span>
            <span className="font-medium text-gray-500 w-16 shrink-0">복약 기간</span>
            <span>
              {current.visit_date}
              {current.next_visit_date && ` ~ ${current.next_visit_date}`}
            </span>
          </div>

          {/* 복약 지시사항 */}
          {current.prescription && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-base">⏰</span>
                <span className="font-medium text-gray-500">복약 지시사항</span>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {current.prescription}
                </p>
              </div>
            </div>
          )}

          {/* 진료 메모 */}
          {current.treatment_notes && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-base">💬</span>
                <span className="font-medium text-gray-500">진료 메모</span>
              </div>
              <div className="bg-blue-50 rounded-xl px-3 py-2.5">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {current.treatment_notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 지난 처방 이력 */}
      {history.length > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">지난 처방 이력</p>
          <div className="space-y-2">
            {history.map((rec) => {
              const open = openIds.has(rec.id)
              const name = parsePrescriptionName(rec.prescription)
              return (
                <div key={rec.id} className="card">
                  <button
                    type="button"
                    onClick={() => toggleOpen(rec.id)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">📋</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{name}</p>
                        <p className="text-xs text-gray-400">
                          {rec.visit_date}
                          {rec.next_visit_date && ` ~ ${rec.next_visit_date}`}
                        </p>
                      </div>
                    </div>
                    {open
                      ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    }
                  </button>

                  {open && (
                    <div className="space-y-3 border-t border-gray-100 mt-3 pt-3">
                      {rec.prescription && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500">복약 지시사항</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {rec.prescription}
                          </p>
                        </div>
                      )}
                      {rec.treatment_notes && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500">진료 메모</p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                            {rec.treatment_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
