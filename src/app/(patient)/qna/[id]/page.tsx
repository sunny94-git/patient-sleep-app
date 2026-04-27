'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface QnaDetail {
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

export default function QnaDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<QnaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/qna/${id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(d => { if (d) { setItem(d); setLoading(false) } })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !item) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-text-muted">문의를 찾을 수 없습니다.</p>
        <button onClick={() => router.back()} className="mt-4 text-brand-600 text-sm font-medium">
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-text-muted"
      >
        ← 목록으로
      </button>

      {/* 질문 */}
      <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-text-muted">{formatDate(item.created_at)}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            item.is_answered
              ? 'bg-success/10 text-success'
              : 'bg-warning/10 text-warning'
          }`}>
            {item.is_answered ? '답변완료' : '대기중'}
          </span>
        </div>
        <div className="bg-bg-secondary rounded-[6px] px-3 py-2 mb-1">
          <p className="text-xs text-text-muted mb-1">질문</p>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {item.question}
          </p>
        </div>
      </div>

      {/* 답변 */}
      {item.is_answered && item.answer ? (
        <div className="bg-brand-50 rounded-[--radius-md] border border-brand-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-brand-700">원장 답변</span>
            {item.answered_at && (
              <span className="text-xs text-brand-400">{formatDate(item.answered_at)}</span>
            )}
          </div>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {item.answer}
          </p>
        </div>
      ) : (
        <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-6 text-center">
          <p className="text-2xl mb-2">⏳</p>
          <p className="text-text-muted text-sm">아직 답변이 등록되지 않았습니다.</p>
          <p className="text-text-muted text-xs mt-1">영업일 기준 1–2일 내 답변드립니다.</p>
        </div>
      )}
    </div>
  )
}
