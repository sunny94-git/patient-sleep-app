'use client'

import { useEffect, useState } from 'react'

interface Prescription {
  id: string
  visit_date: string | null
  prescription: string | null
  treatment_notes: string | null
  next_visit_date: string | null
  created_at: string
}

function formatDate(str: string | null) {
  if (!str) return '-'
  return str.slice(0, 10).replace(/-/g, '.')
}

export default function PrescriptionPage() {
  const [list, setList] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/prescriptions')
      .then(r => r.json())
      .then(d => { setList(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const latest = list[0] ?? null
  const past = list.slice(1)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-text-primary">처방 내역</h1>

      {!latest ? (
        <div className="bg-bg-primary rounded-[--radius-md] p-8 text-center shadow-[--shadow-card]">
          <p className="text-4xl mb-3">💊</p>
          <p className="text-text-muted">등록된 처방 내역이 없습니다.</p>
        </div>
      ) : (
        <>
          {/* 현재 처방 */}
          <section>
            <h2 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">현재 처방</h2>
            <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] overflow-hidden">
              <div className="bg-brand-500 px-4 py-3 flex items-center justify-between">
                <span className="text-white font-semibold">
                  {formatDate(latest.visit_date)} 방문
                </span>
                {latest.next_visit_date && (
                  <span className="text-blue-100 text-sm">
                    다음 방문: {formatDate(latest.next_visit_date)}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-3">
                {latest.prescription && (
                  <div>
                    <p className="text-xs text-text-muted mb-1 font-medium">처방</p>
                    <p className="text-text-primary whitespace-pre-wrap text-sm leading-relaxed">
                      {latest.prescription}
                    </p>
                  </div>
                )}
                {latest.treatment_notes && (
                  <div className="pt-3 border-t border-bg-tertiary">
                    <p className="text-xs text-text-muted mb-1 font-medium">원장 코멘트</p>
                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                      {latest.treatment_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 지난 처방 */}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-text-muted mb-2 uppercase tracking-wider">지난 처방</h2>
              <div className="space-y-2">
                {past.map(item => (
                  <div
                    key={item.id}
                    className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left"
                    >
                      <div>
                        <span className="font-medium text-text-primary">
                          {formatDate(item.visit_date)} 방문
                        </span>
                        {item.next_visit_date && (
                          <span className="ml-2 text-xs text-text-muted">
                            다음: {formatDate(item.next_visit_date)}
                          </span>
                        )}
                      </div>
                      <span className="text-text-muted text-lg leading-none">
                        {expanded === item.id ? '−' : '+'}
                      </span>
                    </button>

                    {expanded === item.id && (
                      <div className="px-4 pb-4 space-y-3 border-t border-bg-tertiary pt-3">
                        {item.prescription && (
                          <div>
                            <p className="text-xs text-text-muted mb-1 font-medium">처방</p>
                            <p className="text-text-primary whitespace-pre-wrap text-sm leading-relaxed">
                              {item.prescription}
                            </p>
                          </div>
                        )}
                        {item.treatment_notes && (
                          <div className="pt-2 border-t border-bg-tertiary">
                            <p className="text-xs text-text-muted mb-1 font-medium">원장 코멘트</p>
                            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                              {item.treatment_notes}
                            </p>
                          </div>
                        )}
                        {!item.prescription && !item.treatment_notes && (
                          <p className="text-text-muted text-sm">내용 없음</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
