'use client'

import { useState } from 'react'
import { Send, ChevronDown, ChevronUp } from 'lucide-react'

interface QnAItem {
  id: string
  question: string
  answer: string | null
  is_answered: boolean
  created_at: string
}

export default function QnAClient({ initialItems }: { initialItems: QnAItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function handleSubmit() {
    if (!question.trim()) return
    setSubmitting(true)
    setError(null)
    const res = await fetch('/api/qna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSubmitting(false); return }
    setItems((prev) => [data.record, ...prev])
    setQuestion('')
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-brand-500 px-5 pt-12 pb-6 text-white">
        <h1 className="text-xl font-bold">문의하기</h1>
        <p className="text-sm text-blue-200 mt-1">의료진에게 문의하세요</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">새 문의</h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="궁금하신 내용을 입력해주세요"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={submitting || !question.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
            {submitting ? '전송 중...' : '문의 전송'}
          </button>
        </div>

        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">문의 내역이 없습니다.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="w-full flex items-start justify-between px-4 py-3 text-left"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.is_answered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.is_answered ? '답변 완료' : '답변 대기'}
                      </span>
                      <span className="text-xs text-gray-400">{item.created_at.slice(0, 10)}</span>
                    </div>
                    <p className="text-sm text-gray-800 truncate">{item.question}</p>
                  </div>
                  {expanded === item.id
                    ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" />
                    : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-1" />}
                </button>
                {expanded === item.id && (
                  <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-700">{item.question}</p>
                    {item.answer && (
                      <div className="bg-brand-50 rounded-xl px-3 py-2.5">
                        <p className="text-xs font-medium text-brand-700 mb-1">의료진 답변</p>
                        <p className="text-sm text-brand-800">{item.answer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
