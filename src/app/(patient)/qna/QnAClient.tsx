'use client'

import { useState } from 'react'
import { MessageCircle, CheckCircle2, Clock } from 'lucide-react'

interface QnARecord {
  id: string
  question: string
  answer: string | null
  is_answered: boolean
  answered_at: string | null
  created_at: string
}

interface QnAClientProps {
  initialItems: QnARecord[]
}

export default function QnAClient({ initialItems }: QnAClientProps) {
  const [items, setItems] = useState<QnARecord[]>(initialItems)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const MAX_LENGTH = 1000

  async function handleSubmit() {
    const trimmed = question.trim()
    if (!trimmed) {
      setError('질문 내용을 입력해주세요.')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '제출에 실패했습니다.')
      }
      const data = await res.json()
      setItems((prev) => [data, ...prev])
      setQuestion('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : '제출에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const answered = items.filter((i) => i.is_answered)
  const pending = items.filter((i) => !i.is_answered)

  return (
    <div className="px-4 pt-6 pb-8 space-y-5">
      <h1 className="text-h2 text-gray-900">💬 문의하기</h1>

      {/* 질문 입력 */}
      <div className="card space-y-3">
        <p className="text-sm font-semibold text-gray-700">새 질문 작성</p>
        <p className="text-xs text-gray-500">
          진료, 처방, 수면 관련 궁금한 점을 자유롭게 남겨주세요.<br />
          담당 의료진이 확인 후 답변해 드립니다.
        </p>
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              setError(null)
            }}
            placeholder="질문 내용을 입력해주세요..."
            rows={4}
            maxLength={MAX_LENGTH}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
          />
          <span className="absolute bottom-2 right-3 text-xs text-gray-400">
            {question.length}/{MAX_LENGTH}
          </span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2">
            <CheckCircle2 className="w-4 h-4" />
            질문이 접수되었습니다. 곧 답변해 드릴게요.
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || question.trim().length === 0}
          className="btn-primary w-full"
        >
          {loading ? '제출 중...' : '질문 제출하기'}
        </button>
      </div>

      {/* 답변 완료 */}
      {answered.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            답변 완료 ({answered.length})
          </h2>
          <div className="space-y-3">
            {answered.map((item) => (
              <QnAItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* 답변 대기 */}
      {pending.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-yellow-500" />
            답변 대기 ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((item) => (
              <QnAItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {items.length === 0 && !success && (
        <div className="text-center py-8 space-y-2">
          <MessageCircle className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-400">
            아직 문의 내역이 없어요.<br />
            궁금한 점이 있으면 언제든지 질문해 주세요.
          </p>
        </div>
      )}
    </div>
  )
}

function QnAItem({ item }: { item: QnARecord }) {
  const createdDate = item.created_at.slice(0, 10)
  const answeredDate = item.answered_at?.slice(0, 10)

  return (
    <div className="card space-y-2.5">
      {/* 질문 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-brand-600">Q</span>
          <span className="text-xs text-gray-400">{createdDate}</span>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
          {item.question}
        </p>
      </div>

      {/* 답변 */}
      {item.is_answered && item.answer ? (
        <div className="bg-green-50 rounded-xl px-3 py-2.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-green-700">A · 의료진 답변</span>
            {answeredDate && (
              <span className="text-xs text-gray-400">{answeredDate}</span>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {item.answer}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-yellow-600 bg-yellow-50 rounded-xl px-3 py-2">
          <Clock className="w-3.5 h-3.5" />
          답변 대기 중입니다.
        </div>
      )}
    </div>
  )
}
