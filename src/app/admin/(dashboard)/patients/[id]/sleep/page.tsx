'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface DiaryRow {
  id: string
  diary_date: string
  bedtime: string | null
  wake_time: string | null
  sleep_onset_latency: string | null
  night_awakening_count: string | null
  sleep_quality: number | null
  morning_fatigue: number | null
  total_sleep_min: number | null
  deep_sleep_min: number | null
  light_sleep_min: number | null
  rem_sleep_min: number | null
  admin_note: string | null
}

interface SleepForm {
  diary_date: string
  bedtime: string
  wake_time: string
  total_sleep_min: string
  deep_sleep_min: string
  light_sleep_min: string
  rem_sleep_min: string
  sleep_quality: string
  morning_fatigue: string
  admin_note: string
}

const EMPTY_FORM: SleepForm = {
  diary_date: '',
  bedtime: '',
  wake_time: '',
  total_sleep_min: '',
  deep_sleep_min: '',
  light_sleep_min: '',
  rem_sleep_min: '',
  sleep_quality: '',
  morning_fatigue: '',
  admin_note: '',
}

function formatDate(str: string) {
  return str.slice(0, 10).replace(/-/g, '.')
}

export default function AdminSleepPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [rows, setRows] = useState<DiaryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<SleepForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchData = () => {
    setLoading(true)
    fetch(`/api/admin/patients/${id}/sleep`)
      .then(r => r.json())
      .then(d => { setRows(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [id])

  const set = (k: keyof SleepForm, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.diary_date) { setError('날짜를 선택해주세요.'); return }
    setError('')
    setSubmitting(true)

    const body = {
      diary_date: form.diary_date,
      bedtime: form.bedtime || null,
      wake_time: form.wake_time || null,
      total_sleep_min: form.total_sleep_min ? parseInt(form.total_sleep_min) : null,
      deep_sleep_min: form.deep_sleep_min ? parseInt(form.deep_sleep_min) : null,
      light_sleep_min: form.light_sleep_min ? parseInt(form.light_sleep_min) : null,
      rem_sleep_min: form.rem_sleep_min ? parseInt(form.rem_sleep_min) : null,
      sleep_quality: form.sleep_quality ? parseInt(form.sleep_quality) : null,
      morning_fatigue: form.morning_fatigue ? parseInt(form.morning_fatigue) : null,
      admin_note: form.admin_note || null,
    }

    const res = await fetch(`/api/admin/patients/${id}/sleep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSubmitting(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? '오류가 발생했습니다.')
      return
    }
    setShowForm(false)
    setForm(EMPTY_FORM)
    fetchData()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary text-sm">← 환자 정보</button>
        <h1 className="text-2xl font-bold text-text-primary flex-1">수면 데이터 입력</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          {showForm ? '취소' : '+ 데이터 입력'}
        </button>
      </div>

      {/* 입력 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-text-primary">수면 데이터 입력</h2>

          <div>
            <label className="label">날짜 *</label>
            <input type="date" required value={form.diary_date} onChange={e => set('diary_date', e.target.value)} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">취침 시각</label>
              <input type="time" value={form.bedtime} onChange={e => set('bedtime', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="label">기상 시각</label>
              <input type="time" value={form.wake_time} onChange={e => set('wake_time', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">총 수면 (분)</label>
              <input type="number" min="0" max="1440" value={form.total_sleep_min} onChange={e => set('total_sleep_min', e.target.value)} placeholder="480" className={inputCls} />
            </div>
            <div>
              <label className="label">깊은 수면 (분)</label>
              <input type="number" min="0" max="600" value={form.deep_sleep_min} onChange={e => set('deep_sleep_min', e.target.value)} placeholder="90" className={inputCls} />
            </div>
            <div>
              <label className="label">얕은 수면 (분)</label>
              <input type="number" min="0" max="600" value={form.light_sleep_min} onChange={e => set('light_sleep_min', e.target.value)} placeholder="240" className={inputCls} />
            </div>
            <div>
              <label className="label">REM 수면 (분)</label>
              <input type="number" min="0" max="600" value={form.rem_sleep_min} onChange={e => set('rem_sleep_min', e.target.value)} placeholder="150" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">수면의 질 (1–5)</label>
              <select value={form.sleep_quality} onChange={e => set('sleep_quality', e.target.value)} className={inputCls}>
                <option value="">선택</option>
                {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">아침 피로도 (1–5)</label>
              <select value={form.morning_fatigue} onChange={e => set('morning_fatigue', e.target.value)} className={inputCls}>
                <option value="">선택</option>
                {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">원장 메모</label>
            <textarea
              rows={2}
              value={form.admin_note}
              onChange={e => set('admin_note', e.target.value)}
              placeholder="환자에게 표시되지 않는 내부 메모"
              className={`${inputCls} resize-none`}
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
        </form>
      )}

      {/* 데이터 목록 */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-10 text-center">
          <p className="text-4xl mb-2">🌙</p>
          <p className="text-text-muted">수면 데이터가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-secondary border-b border-bg-tertiary">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">날짜</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">취침</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">기상</th>
                <th className="text-right px-4 py-3 font-semibold text-text-secondary">총 수면</th>
                <th className="text-right px-4 py-3 font-semibold text-text-secondary">깊은</th>
                <th className="text-right px-4 py-3 font-semibold text-text-secondary">REM</th>
                <th className="text-center px-4 py-3 font-semibold text-text-secondary">질</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-tertiary">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-bg-secondary transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">{formatDate(r.diary_date)}</td>
                  <td className="px-4 py-3 text-text-secondary">{r.bedtime ?? '-'}</td>
                  <td className="px-4 py-3 text-text-secondary">{r.wake_time ?? '-'}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{r.total_sleep_min != null ? `${Math.floor(r.total_sleep_min / 60)}h ${r.total_sleep_min % 60}m` : '-'}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{r.deep_sleep_min != null ? `${r.deep_sleep_min}m` : '-'}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{r.rem_sleep_min != null ? `${r.rem_sleep_min}m` : '-'}</td>
                  <td className="px-4 py-3 text-center text-text-secondary">{r.sleep_quality ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-[--radius-sm] border border-bg-tertiary bg-bg-secondary text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-brand-400 text-sm'
