'use client'

import { useEffect, useState } from 'react'

interface QnaItem {
  id: string
  question: string
  answer: string | null
  is_answered: boolean
  answered_at: string | null
  created_at: string
  patients: { name: string; registration_number: string } | null
}

function formatDate(str: string) {
  return str.slice(0, 10).replace(/-/g, '.')
}

export default function AdminQnaPage() {
  const [list, setList] = useState<QnaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'answered'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  const fetchData = () => {
    setLoading(true)
    fetch('/api/admin/qna')
      .then(r => r.json())
      .then(d => { setList(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const filtered = list.filter(q => {
    if (filter === 'unanswered') return !q.is_answered
    if (filter === 'answered') return q.is_answered
    return true
  })

  const handleAnswer = async (id: string) => {
    const answer = answers[id]?.trim()
    if (!answer) return
    setSubmitting(id)
    const res = await fetch(`/api/admin/qna/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    })
    setSubmitting(null)
    if (res.ok) {
      setAnswers(prev => ({ ...prev, [id]: '' }))
      setExpanded(null)
      fetchData()
    }
  }

  const unansweredCount = list.filter(q => !q.is_answered).length

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Q&A 관리</h1>
          {unansweredCount > 0 && (
            <p className="text-sm text-danger mt-1">미답변 {unansweredCount}건</p>
          )}
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-1 bg-bg-tertiary rounded-[--radius-sm] p-1 mb-5 w-fit">
        {(['all', 'unanswered', 'answered'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-[6px] text-sm font-medium transition-colors ${
              filter === f ? 'bg-bg-primary text-brand-600 shadow-[--shadow-card]' : 'text-text-muted'
            }`}
          >
            {f === 'all' ? '전체' : f === 'unanswered' ? '미답변' : '답변완료'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-12 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-text-muted">문의가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] overflow-hidden">
              {/* 문의 헤더 */}
              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="w-full px-5 py-4 text-left flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-text-primary">
                      {item.patients?.name ?? '알 수 없음'}
                    </span>
                    <span className="text-xs text-text-muted">
                      ({item.patients?.registration_number ?? '-'})
                    </span>
                    <span className="text-xs text-text-muted ml-auto">{formatDate(item.created_at)}</span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">{item.question}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.is_answered
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {item.is_answered ? '답변완료' : '미답변'}
                  </span>
                  <span className="text-text-muted">{expanded === item.id ? '▲' : '▼'}</span>
                </div>
              </button>

              {expanded === item.id && (
                <div className="px-5 pb-5 border-t border-bg-tertiary pt-4 space-y-4">
                  {/* 질문 전체 */}
                  <div className="bg-bg-secondary rounded-[--radius-sm] p-3">
                    <p className="text-xs text-text-muted mb-1">질문</p>
                    <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{item.question}</p>
                  </div>

                  {/* 기존 답변 */}
                  {item.is_answered && item.answer && (
                    <div className="bg-brand-50 border border-brand-200 rounded-[--radius-sm] p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-brand-700">등록된 답변</p>
                        {item.answered_at && (
                          <p className="text-xs text-brand-400">{formatDate(item.answered_at)}</p>
                        )}
                      </div>
                      <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{item.answer}</p>
                    </div>
                  )}

                  {/* 답변 입력 */}
                  {!item.is_answered && (
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">답변 작성</label>
                      <textarea
                        rows={4}
                        value={answers[item.id] ?? ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="환자에게 전달할 답변을 입력하세요."
                        className="w-full px-3 py-2 rounded-[--radius-sm] border border-bg-tertiary bg-bg-secondary text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-brand-400 text-sm resize-none leading-relaxed"
                      />
                      <button
                        onClick={() => handleAnswer(item.id)}
                        disabled={!answers[item.id]?.trim() || submitting === item.id}
                        className="mt-2 w-full py-2 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
                      >
                        {submitting === item.id ? '저장 중...' : '답변 등록'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
