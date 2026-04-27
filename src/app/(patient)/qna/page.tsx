'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface QnaItem {
  id: string
  question: string
  answer: string | null
  is_answered: boolean
  answered_at: string | null
  created_at: string
}

function formatDate(str: string) {
  return str.slice(0, 10).replace(/-/g, '.')
}

export default function QnaPage() {
  const router = useRouter()
  const [list, setList] = useState<QnaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'list' | 'write'>('list')
  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const fetchList = () => {
    setLoading(true)
    fetch('/api/qna')
      .then(r => r.json())
      .then(d => { setList(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleSubmit = async () => {
    if (!question.trim() || submitting) return
    setSubmitting(true)
    const res = await fetch('/api/qna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
    setSubmitting(false)
    if (res.ok) {
      setDone(true)
      setQuestion('')
      setTimeout(() => {
        setDone(false)
        setTab('list')
        fetchList()
      }, 1500)
    }
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-4">문의하기</h1>

      {/* 탭 */}
      <div className="flex gap-1 bg-bg-tertiary rounded-[--radius-sm] p-1 mb-6">
        {(['list', 'write'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-[6px] text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-bg-primary text-brand-600 shadow-[--shadow-card]'
                : 'text-text-muted'
            }`}
          >
            {t === 'list' ? '문의 내역' : '새 문의'}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : list.length === 0 ? (
            <div className="bg-bg-primary rounded-[--radius-md] p-8 text-center shadow-[--shadow-card]">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-text-muted mb-4">아직 문의 내역이 없습니다.</p>
              <button
                onClick={() => setTab('write')}
                className="px-4 py-2 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-medium"
              >
                첫 문의 작성하기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map(item => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/qna/${item.id}`)}
                  className="w-full bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-4 text-left hover:shadow-[--shadow-card-hover] transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-text-primary line-clamp-2 flex-1">
                      {item.question}
                    </p>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.is_answered
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {item.is_answered ? '답변완료' : '대기중'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">{formatDate(item.created_at)}</p>
                  {item.is_answered && item.answer && (
                    <p className="mt-2 text-xs text-text-secondary line-clamp-1 border-t border-bg-tertiary pt-2">
                      {item.answer}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'write' && (
        <div className="space-y-4">
          {done ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-3xl">
                ✓
              </div>
              <p className="text-lg font-semibold text-text-primary">문의가 접수되었습니다!</p>
              <p className="text-text-muted text-sm">원장님이 확인 후 답변드립니다.</p>
            </div>
          ) : (
            <>
              <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  문의 내용
                </label>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  maxLength={1000}
                  rows={8}
                  placeholder="궁금한 점이나 불편한 사항을 자유롭게 작성해주세요."
                  className="w-full resize-none text-sm text-text-primary placeholder:text-text-disabled focus:outline-none leading-relaxed"
                />
                <p className="text-right text-xs text-text-muted mt-1">{question.length} / 1000</p>
              </div>

              <div className="bg-brand-50 rounded-[--radius-sm] px-4 py-3 text-xs text-brand-700 leading-relaxed">
                문의는 영업일 기준 1–2일 내 답변드립니다. 긴급한 사항은 전화로 연락주세요.
              </div>

              <button
                onClick={handleSubmit}
                disabled={!question.trim() || submitting}
                className={`w-full py-3.5 rounded-[--radius-md] font-semibold text-base transition-colors ${
                  question.trim()
                    ? 'bg-brand-500 text-white active:bg-brand-700'
                    : 'bg-bg-tertiary text-text-disabled cursor-not-allowed'
                }`}
              >
                {submitting ? '제출 중...' : '문의 제출'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
