'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
const QUESTIONS = [
  {
    key: 'q1',
    text: '잠들기 어려움',
    sub: '지난 2주 동안, 잠들기가 얼마나 어려웠습니까?',
  },
  {
    key: 'q2',
    text: '수면 유지 어려움',
    sub: '지난 2주 동안, 잠을 유지하기가 얼마나 어려웠습니까?',
  },
  {
    key: 'q3',
    text: '너무 일찍 깸',
    sub: '지난 2주 동안, 너무 일찍 깨어나는 문제가 얼마나 심했습니까?',
  },
  {
    key: 'q4',
    text: '수면 패턴 만족도',
    sub: '현재 수면 패턴에 얼마나 만족하십니까?',
    labels: ['매우 만족', '만족', '보통', '불만족', '매우 불만족'],
  },
  {
    key: 'q5',
    text: '수면 문제로 인한 일상 영향',
    sub: '수면 문제가 낮 시간 기능(피로, 집중력, 기억력 등)에 얼마나 영향을 미칩니까?',
  },
  {
    key: 'q6',
    text: '삶의 질 저하',
    sub: '수면 문제가 삶의 질을 얼마나 저하시킵니까?',
  },
  {
    key: 'q7',
    text: '수면 문제에 대한 걱정',
    sub: '현재 수면 문제에 대해 얼마나 걱정하십니까?',
  },
]

const DEFAULT_LABELS = ['전혀 없음', '약간', '보통', '심함', '매우 심함']

function getLevel(score: number) {
  if (score <= 7)  return { bg: 'bg-success/10',  text: 'text-success',  label: '정상' }
  if (score <= 14) return { bg: 'bg-warning/10',  text: 'text-warning',  label: '경미한 불면증' }
  if (score <= 21) return { bg: 'bg-caution/10',  text: 'text-caution',  label: '중등도 불면증' }
  return                   { bg: 'bg-danger/10',   text: 'text-danger',   label: '심각한 불면증' }
}

interface IsiRecord {
  id: string
  assessed_at: string
  total_score: number
}

type Answers = Record<string, number | null>

function formatDate(str: string) {
  return str.slice(0, 10).replace(/-/g, '.')
}

export default function IsiPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'form' | 'history'>('form')
  const [answers, setAnswers] = useState<Answers>(
    Object.fromEntries(QUESTIONS.map(q => [q.key, null]))
  )
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [history, setHistory] = useState<IsiRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const fetchHistory = () => {
    setHistoryLoading(true)
    fetch('/api/isi')
      .then(r => r.json())
      .then(d => { setHistory(d); setHistoryLoading(false) })
      .catch(() => setHistoryLoading(false))
  }

  useEffect(() => {
    if (tab === 'history') fetchHistory()
  }, [tab])

  const totalScore = Object.values(answers).reduce<number>(
    (acc, v) => acc + (v ?? 0), 0
  )
  const allAnswered = Object.values(answers).every(v => v !== null)

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return
    setSubmitting(true)
    const res = await fetch('/api/isi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    })
    setSubmitting(false)
    if (res.ok) {
      setDone(true)
      setTimeout(() => {
        setDone(false)
        setTab('history')
        setAnswers(Object.fromEntries(QUESTIONS.map(q => [q.key, null])))
        fetchHistory()
      }, 1800)
    }
  }

  const latest = history[0]
  const chartData = [...history].reverse().map(r => ({
    date: formatDate(r.assessed_at),
    score: r.total_score,
  }))

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-4">불면증 자가진단 (ISI)</h1>

      {/* 탭 */}
      <div className="flex gap-1 bg-bg-tertiary rounded-[--radius-sm] p-1 mb-6">
        {(['form', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-[6px] text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-bg-primary text-brand-600 shadow-[--shadow-card]'
                : 'text-text-muted'
            }`}
          >
            {t === 'form' ? '자가진단 하기' : '검사 이력'}
          </button>
        ))}
      </div>

      {tab === 'form' && (
        <div className="space-y-4">
          {done ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-3xl">
                ✓
              </div>
              <p className="text-lg font-semibold text-text-primary">제출 완료!</p>
              <p className="text-text-muted text-sm">총점: {totalScore}점</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-text-muted leading-relaxed">
                지난 2주를 기준으로 각 문항에 답해주세요. 0~4점 척도로 답합니다.
              </p>

              {QUESTIONS.map((q, idx) => {
                const labels = q.labels ?? DEFAULT_LABELS
                return (
                  <div key={q.key} className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-4">
                    <p className="text-xs text-text-muted mb-0.5">문항 {idx + 1}</p>
                    <p className="font-semibold text-text-primary mb-1">{q.text}</p>
                    <p className="text-sm text-text-secondary mb-3">{q.sub}</p>
                    <div className="grid grid-cols-5 gap-1">
                      {labels.map((label, val) => (
                        <button
                          key={val}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.key]: val }))}
                          className={`flex flex-col items-center py-2 px-1 rounded-[6px] border transition-colors text-center ${
                            answers[q.key] === val
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-bg-tertiary text-text-muted hover:border-brand-300'
                          }`}
                        >
                          <span className="text-base font-bold">{val}</span>
                          <span className="text-[10px] leading-tight mt-0.5">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* 점수 미리보기 */}
              <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">현재 총점</p>
                  <p className="text-2xl font-bold text-text-primary">{totalScore}<span className="text-sm font-normal text-text-muted"> / 28</span></p>
                </div>
                {allAnswered && (() => { const lv = getLevel(totalScore); return (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${lv.bg} ${lv.text}`}>
                    {lv.label}
                  </div>
                )})()}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className={`w-full py-3.5 rounded-[--radius-md] font-semibold text-base transition-colors ${
                  allAnswered
                    ? 'bg-brand-500 text-white active:bg-brand-700'
                    : 'bg-bg-tertiary text-text-disabled cursor-not-allowed'
                }`}
              >
                {submitting ? '제출 중...' : allAnswered ? '제출하기' : `${Object.values(answers).filter(v => v === null).length}개 문항 남음`}
              </button>
            </>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {historyLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="bg-bg-primary rounded-[--radius-md] p-8 text-center shadow-[--shadow-card]">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-text-muted">검사 이력이 없습니다.</p>
              <button
                onClick={() => setTab('form')}
                className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-medium"
              >
                자가진단 하기
              </button>
            </div>
          ) : (
            <>
              {/* 최신 점수 */}
              {latest && (
                <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-4">
                  <p className="text-xs text-text-muted mb-1">최근 검사 ({formatDate(latest.assessed_at)})</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-text-primary">{latest.total_score}</span>
                    <span className="text-text-muted">/ 28점</span>
                    {(() => { const lv = getLevel(latest.total_score); return (
                      <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${lv.bg} ${lv.text}`}>
                        {lv.label}
                      </span>
                    )})()}
                  </div>
                </div>
              )}

              {/* 추이 차트 */}
              {chartData.length >= 2 && (
                <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-4">
                  <p className="text-sm font-medium text-text-secondary mb-3">점수 추이</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#718096' }} />
                      <YAxis domain={[0, 28]} tick={{ fontSize: 10, fill: '#718096' }} />
                      <Tooltip
                        formatter={(v) => [`${v}점`, 'ISI 점수']}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                      />
                      <ReferenceLine y={7}  stroke="#22C55E" strokeDasharray="4 4" label={{ value: '7', fontSize: 10, fill: '#22C55E' }} />
                      <ReferenceLine y={14} stroke="#EAB308" strokeDasharray="4 4" label={{ value: '14', fontSize: 10, fill: '#EAB308' }} />
                      <ReferenceLine y={21} stroke="#EF4444" strokeDasharray="4 4" label={{ value: '21', fontSize: 10, fill: '#EF4444' }} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#4A90D9"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#4A90D9' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-success inline-block" /> 정상(≤7)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-warning inline-block" /> 경미(≤14)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-caution inline-block" /> 중등도(≤21)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-danger inline-block" /> 심각(&gt;21)</span>
                  </div>
                </div>
              )}

              {/* 이력 목록 */}
              <div className="space-y-2">
                {history.map(r => {
                  const lv = getLevel(r.total_score)
                  return (
                    <div key={r.id} className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text-primary">{formatDate(r.assessed_at)}</p>
                        <p className="text-sm text-text-muted">{r.total_score}점</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${lv.bg} ${lv.text}`}>
                        {lv.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
