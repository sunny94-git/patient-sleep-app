'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, MessageCircle, CheckCircle2, Clock, Send } from 'lucide-react'
import Link from 'next/link'

interface QnaItem {
  id: string
  question: string
  answer: string | null
  is_answered: boolean
  created_at: string
  answered_at: string | null
  patient_id: string
  patients: { name: string; registration_number: string } | null
}

export default function QnaPage() {
  const [items, setItems] = useState<QnaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'all' | 'pending' | 'answered'>('pending')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<QnaItem | null>(null)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ status, search })
    const res = await fetch(`/api/admin/qna?${params}`)
    const data = await res.json()
    setItems(data.items ?? [])
    setLoading(false)
  }, [status, search])

  useEffect(() => {
    const t = setTimeout(fetchItems, 300)
    return () => clearTimeout(t)
  }, [fetchItems])

  function selectItem(item: QnaItem) {
    setSelected(item)
    setAnswer(item.answer ?? '')
  }

  async function handleSubmit() {
    if (!selected || !answer.trim()) return
    setSubmitting(true)
    const method = selected.is_answered ? 'PUT' : 'PATCH'
    const res = await fetch(`/api/admin/qna/${selected.id}/answer`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    })
    if (res.ok) {
      setToast('답변이 등록되었습니다.')
      setSelected((prev) => (prev ? { ...prev, answer, is_answered: true } : null))
      setItems((prev) =>
        prev.map((i) => (i.id === selected.id ? { ...i, answer, is_answered: true } : i))
      )
      setTimeout(() => setToast(''), 3000)
    }
    setSubmitting(false)
  }

  const filterTabs = [
    { key: 'pending', label: '미답변 우선' },
    { key: 'all', label: '전체' },
    { key: 'answered', label: '답변 완료' },
  ] as const

  return (
    <div className="p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <MessageCircle size={20} className="text-brand-500" />
        <h1 className="text-xl font-bold text-gray-900">Q&A 관리</h1>
      </div>

      <div className="grid grid-cols-5 gap-4 h-[calc(100vh-140px)]">
        {/* 목록 패널 */}
        <div className="col-span-2 flex flex-col gap-3">
          {/* 검색 */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
              placeholder="환자명 또는 내용 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 필터 탭 */}
          <div className="flex gap-1.5">
            {filterTabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatus(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  status === key ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 목록 */}
          <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-card divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">불러오는 중...</div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                {status === 'pending'
                  ? '미답변 문의가 없습니다. 모든 문의에 답변이 완료되었습니다 ✅'
                  : '검색 결과가 없습니다.'}
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectItem(item)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                    selected?.id === item.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-900">
                      {item.patients?.name ?? '알 수 없음'}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      {item.is_answered ? (
                        <CheckCircle2 size={11} className="text-green-500" />
                      ) : (
                        <Clock size={11} className="text-yellow-500" />
                      )}
                      <span className={item.is_answered ? 'text-green-600' : 'text-yellow-600'}>
                        {item.is_answered ? '완료' : '미답변'}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{item.question}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 상세 + 답변 패널 */}
        <div className="col-span-3 flex flex-col bg-white rounded-xl shadow-card overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              좌측에서 문의를 선택해 주세요.
            </div>
          ) : (
            <>
              {/* 헤더 */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <Link
                    href={`/admin/patients/${selected.patient_id}`}
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    {selected.patients?.name ?? '알 수 없음'}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(selected.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    selected.is_answered
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {selected.is_answered ? '답변 완료' : '미답변'}
                </span>
              </div>

              {/* 질문 */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-2">Q</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.question}</p>
                </div>

                {selected.is_answered && selected.answer && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs font-medium text-blue-400 mb-2">A (기존 답변)</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.answer}</p>
                  </div>
                )}
              </div>

              {/* 답변 입력 */}
              <div className="p-4 border-t border-gray-100 space-y-3 shrink-0">
                <textarea
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 resize-none"
                  rows={4}
                  placeholder="답변을 입력하세요..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                {toast && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> {toast}
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !answer.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submitting ? '등록 중...' : selected.is_answered ? '답변 수정' : '답변 등록'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
