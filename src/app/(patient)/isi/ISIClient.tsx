'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { getISISeverity, type ISISeverity } from '@/types'

interface ISIRecord {
  id: string
  assessed_at: string
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  q5: number | null
  q6: number | null
  q7: number | null
  total_score: number | null
}

interface ISIClientProps {
  patientId: string
  history: ISIRecord[]
}

const ISI_QUESTIONS = [
  { key: 'q1' as const, text: '잠들기 어려움', sub: '지난 2주 동안 잠자리에 든 후 잠들기 어려웠던 정도' },
  { key: 'q2' as const, text: '수면 유지 어려움', sub: '수면 중 자주 깨거나 다시 잠들기 어려웠던 정도' },
  { key: 'q3' as const, text: '너무 일찍 깸', sub: '원하는 시간보다 일찍 깨어 다시 잠들지 못한 정도' },
  { key: 'q4' as const, text: '현재 수면 패턴 만족도', sub: '현재 수면 패턴에 얼마나 만족하십니까?' },
  { key: 'q5' as const, text: '낮 기능 저하', sub: '수면 문제가 낮 생활(피로, 집중력, 기분 등)에 미치는 영향' },
  { key: 'q6' as const, text: '수면 문제 인지', sub: '수면 문제가 있다는 것을 다른 사람이 얼마나 알고 있습니까?' },
  { key: 'q7' as const, text: '수면 문제에 대한 걱정', sub: '현재 수면 문제에 대해 얼마나 걱정하십니까?' },
]

const SCORE_LABELS: Record<number, string> = {
  0: '전혀 없음',
  1: '약간',
  2: '보통',
  3: '심함',
  4: '매우 심함',
}

const SEVERITY_STYLE: Record<ISISeverity, { badge: string; bar: string; text: string }> = {
  없음: { badge: 'badge-success', bar: 'bg-green-500', text: 'text-green-700' },
  경미: { badge: 'badge-warning', bar: 'bg-yellow-500', text: 'text-yellow-700' },
  중등도: { badge: 'badge-orange', bar: 'bg-orange-500', text: 'text-orange-700' },
  심각: { badge: 'badge-danger', bar: 'bg-red-500', text: 'text-red-700' },
}

type QuestionKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7'
type Answers = Record<QuestionKey, number | null>

const EMPTY_ANSWERS: Answers = {
  q1: null, q2: null, q3: null, q4: null, q5: null, q6: null, q7: null,
}

export default function ISIClient({ patientId, history }: ISIClientProps) {
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ total: number; severity: ISISeverity } | null>(null)
  const [localHistory, setLocalHistory] = useState(history)

  const chartData = useMemo(() =>
    [...localHistory].reverse().map((r) => ({
      date: r.assessed_at.slice(5, 10),
      score: r.total_score ?? 0,
    })),
    [localHistory]
  )

  const allAnswered = Object.values(answers).every((v) => v !== null)
  const totalPreview = allAnswered
    ? Object.values(answers).reduce((sum, v) => sum + (v ?? 0), 0)
    : null

  async function handleSubmit() {
    if (!allAnswered) {
      setError('모든 문항에 답해 주세요.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/isi/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '제출에 실패했습니다.')
      }
      const data = await res.json()
      const total = data.total_score as number
      const severity = getISISeverity(total)
      setResult({ total, severity })
      setLocalHistory((prev) => [
        { id: data.id, assessed_at: new Date().toISOString(), ...answers, total_score: total },
        ...prev,
      ])
      setAnswers(EMPTY_ANSWERS)
    } catch (e) {
      setError(e instanceof Error ? e.message : '제출에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-8 space-y-4">
      <h1 className="text-h2 text-gray-900">📋 불면증 자가진단 (ISI)</h1>

      {/* 결과 카드 */}
      {result && (
        <div className={`card border-2 ${SEVERITY_STYLE[result.severity].bar.replace('bg-', 'border-')}`}>
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">총점</p>
            <p className="text-4xl font-bold text-gray-900">{result.total}<span className="text-lg font-normal text-gray-400"> / 28</span></p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${SEVERITY_STYLE[result.severity].badge}`}>
              {result.severity} 불면증
            </span>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${SEVERITY_STYLE[result.severity].bar} transition-all`}
                style={{ width: `${(result.total / 28) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 입력 폼 */}
      <div className="card space-y-5">
        <p className="text-sm text-gray-500">
          지난 2주간의 수면을 기준으로 각 항목을 선택해 주세요.
        </p>

        {ISI_QUESTIONS.map((q, idx) => (
          <div key={q.key} className="space-y-2">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Q{idx + 1}. {q.text}
              </p>
              <p className="text-xs text-gray-500">{q.sub}</p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: score }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors leading-tight ${
                    answers[q.key] === score
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={SCORE_LABELS[score]}
                >
                  <span className="block text-sm font-bold">{score}</span>
                  <span className="block text-[10px] opacity-80">{SCORE_LABELS[score].split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {totalPreview !== null && (
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">예상 총점</span>
            <span className={`text-sm font-semibold ${SEVERITY_STYLE[getISISeverity(totalPreview)].text}`}>
              {totalPreview}점 · {getISISeverity(totalPreview)}
            </span>
          </div>
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !allAnswered}
          className="btn-primary w-full"
        >
          {loading ? '제출 중...' : '제출하기'}
        </button>
      </div>

      {/* 이력 그래프 */}
      {localHistory.length > 1 && (
        <section className="card space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">📈 점수 추이</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 28]} ticks={[0, 7, 14, 21, 28]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [v, 'ISI 점수']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <ReferenceLine y={21} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: '심각', position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }} />
              <ReferenceLine y={14} stroke="#f97316" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: '중등도', position: 'insideTopRight', fontSize: 9, fill: '#f97316' }} />
              <ReferenceLine y={7}  stroke="#eab308" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: '경미', position: 'insideTopRight', fontSize: 9, fill: '#eab308' }} />
              <Line type="monotone" dataKey="score" stroke="#4A90D9" strokeWidth={2.5}
                dot={{ r: 4, fill: '#4A90D9', stroke: 'white', strokeWidth: 1.5 }}
                activeDot={{ r: 6, stroke: '#4A90D9', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* 이력 목록 */}
      {localHistory.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">이전 결과</h2>
          <div className="space-y-2">
            {localHistory.slice(0, 10).map((rec) => {
              const score = rec.total_score ?? 0
              const severity = getISISeverity(score)
              const date = rec.assessed_at.slice(0, 10)
              return (
                <div key={rec.id} className="card flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{date}</p>
                    <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${SEVERITY_STYLE[severity].bar}`}
                        style={{ width: `${(score / 28) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{score}<span className="text-xs text-gray-400">/28</span></p>
                    <span className={`text-xs ${SEVERITY_STYLE[severity].badge} px-2 py-0.5 rounded-full`}>
                      {severity}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {localHistory.length === 0 && !result && (
        <p className="text-center text-sm text-gray-400 py-4">
          아직 자가진단 기록이 없어요.<br />위에서 바로 시작할 수 있어요.
        </p>
      )}
    </div>
  )
}
