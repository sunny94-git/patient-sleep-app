'use client'

import { useState } from 'react'
import { getISISeverity } from '@/types'
import { CheckCircle2 } from 'lucide-react'

const QUESTIONS = [
  { q: '잊들기 어려움', labels: ['전혀 없음', '경미', '중등도', '심함', '매우 심함'] },
  { q: '잊 유지 어려움', labels: ['전혀 없음', '경미', '중등도', '심함', '매우 심함'] },
  { q: '너무 일직 깨', labels: ['전혀 없음', '경미', '중등도', '심함', '매우 심함'] },
  { q: '현재 수면 패턴 만족도', labels: ['매우 만족', '만족', '보통', '불만족', '매우 불만족'] },
  { q: '수면 문제로 인한 일상 지장', labels: ['전혀 없음', '조금', '어느 정도', '많이', '매우 많이'] },
  { q: '수면 문제의 눈에 띄는 정도', labels: ['전혀 없음', '조금', '어느 정도', '많이', '매우 많이'] },
  { q: '현재 수면 문제에 대한 걱정', labels: ['전혀 없음', '조금', '어느 정도', '많이', '매우 많이'] },
]

interface HistoryItem { id: string; assessed_at: string; total_score: number | null }
interface Assessment { total_score: number | null; assessed_at: string; q1: number | null; q2: number | null; q3: number | null; q4: number | null; q5: number | null; q6: number | null; q7: number | null }

export default function ISIClient({
  latestAssessment,
  history,
}: {
  latestAssessment: Assessment | null
  history: HistoryItem[]
}) {
  const [scores, setScores] = useState<(number | null)[]>(Array(7).fill(null))
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ total_score: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'form' | 'history'>('form')

  async function handleSubmit() {
    if (scores.some((s) => s === null)) {
      setError('모든 문항에 응답해주세요.')
      return
    }
    setSubmitting(true)
    setError(null)
    const res = await fetch('/api/isi/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q1: scores[0], q2: scores[1], q3: scores[2], q4: scores[3], q5: scores[4], q6: scores[5], q7: scores[6] }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSubmitting(false); return }
    setResult(data)
    setSubmitting(false)
  }

  const severity = result ? getISISeverity(result.total_score) : (latestAssessment?.total_score != null ? getISISeverity(latestAssessment.total_score) : null)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-brand-500 px-5 pt-12 pb-6 text-white">
        <h1 className="text-xl font-bold">ISI 불면증 평가</h1>
        <p className="text-sm text-blue-200 mt-1">불면증 심각도 지수 (7문항)</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex bg-gray-200 rounded-xl p-1">
          {(['form', 'history'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}>
              {t === 'form' ? '설문 작성' : '이전 기록'}
            </button>
          ))}
        </div>

        {tab === 'form' && (
          <>
            {result ? (
              <div className="bg-white rounded-2xl shadow-card p-6 text-center space-y-3">
                <CheckCircle2 size={40} className="text-green-500 mx-auto" />
                <p className="text-lg font-bold text-gray-900">성적: {result.total_score}점</p>
                <p className="text-sm text-gray-600">심각도: <span className="font-semibold">{severity}</span></p>
                <button onClick={() => { setResult(null); setScores(Array(7).fill(null)) }}
                  className="text-xs text-brand-500 hover:underline mt-2">다시 평가</button>
              </div>
            ) : (
              <div className="space-y-4">
                {latestAssessment && (
                  <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-xs text-blue-700">최근 평가</span>
                    <span className="text-sm font-semibold text-blue-800">
                      {latestAssessment.total_score}점 ({severity}) · {latestAssessment.assessed_at.slice(0, 10)}
                    </span>
                  </div>
                )}
                {QUESTIONS.map((q, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-card p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Q{i + 1}. {q.q}</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {q.labels.map((label, val) => (
                        <button key={val}
                          onClick={() => setScores((prev) => { const n = [...prev]; n[i] = val; return n })}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-colors ${scores[i] === val ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <span className={`text-sm font-bold ${scores[i] === val ? 'text-brand-600' : 'text-gray-700'}`}>{val}</span>
                          <span className="text-xs text-gray-400 leading-tight">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button onClick={handleSubmit} disabled={submitting}
                  className="w-full py-3 text-sm font-semibold text-white bg-brand-500 rounded-2xl hover:bg-brand-600 disabled:opacity-50 transition-colors">
                  {submitting ? '제출 중...' : '평가 제출'}
                </button>
              </div>
            )}
          </>
        )}

        {tab === 'history' && (
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">이전 평가 기록이 없습니다.</p>
            ) : (
              history.map((h) => {
                const s = h.total_score != null ? getISISeverity(h.total_score) : '없음'
                const color = s === '없음' ? 'text-green-600' : s === '경미' ? 'text-yellow-600' : s === '중등도' ? 'text-orange-500' : 'text-red-500'
                return (
                  <div key={h.id} className="bg-white rounded-xl shadow-card px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{h.assessed_at.slice(0, 10)}</span>
                    <span className={`text-sm font-semibold ${color}`}>{h.total_score}점 ({s})</span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
