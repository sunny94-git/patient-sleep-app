'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface DiaryRow {
  id: string
  diary_date: string
  bedtime: string | null
  wake_time: string | null
  total_sleep_min: number | null
  deep_sleep_min: number | null
  light_sleep_min: number | null
  rem_sleep_min: number | null
}

interface SleepForm {
  diary_date: string
  bedtime: string
  wake_time: string
  total_sleep_h: string
  total_sleep_m: string
  deep_sleep_h: string
  deep_sleep_m: string
  light_sleep_h: string
  light_sleep_m: string
  rem_sleep_h: string
  rem_sleep_m: string
}

const EMPTY_FORM: SleepForm = {
  diary_date: '',
  bedtime: '', wake_time: '',
  total_sleep_h: '', total_sleep_m: '',
  deep_sleep_h: '',  deep_sleep_m: '',
  light_sleep_h: '', light_sleep_m: '',
  rem_sleep_h: '',   rem_sleep_m: '',
}

function minsToHM(mins: number | null): [string, string] {
  if (mins == null) return ['', '']
  return [String(Math.floor(mins / 60)), String(mins % 60)]
}

function hmToMins(h: string, m: string): number | null {
  if (h === '' && m === '') return null
  return (parseInt(h) || 0) * 60 + (parseInt(m) || 0)
}

function rowToForm(r: DiaryRow): SleepForm {
  const [th, tm] = minsToHM(r.total_sleep_min)
  const [dh, dm] = minsToHM(r.deep_sleep_min)
  const [lh, lm] = minsToHM(r.light_sleep_min)
  const [rh, rm] = minsToHM(r.rem_sleep_min)
  return {
    diary_date: r.diary_date,
    bedtime: r.bedtime ?? '', wake_time: r.wake_time ?? '',
    total_sleep_h: th, total_sleep_m: tm,
    deep_sleep_h: dh,  deep_sleep_m: dm,
    light_sleep_h: lh, light_sleep_m: lm,
    rem_sleep_h: rh,   rem_sleep_m: rm,
  }
}

function fmtDate(str: string) { return str.slice(0, 10).replace(/-/g, '.') }

function fmtMins(mins: number | null) {
  if (mins == null) return '-'
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function AdminSleepPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [rows, setRows] = useState<DiaryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDate, setEditingDate] = useState<string | null>(null)
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

  const openNew = () => {
    setEditingDate(null); setForm(EMPTY_FORM); setError(''); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const openEdit = (row: DiaryRow) => {
    setEditingDate(row.diary_date); setForm(rowToForm(row)); setError(''); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleCancel = () => { setShowForm(false); setEditingDate(null); setForm(EMPTY_FORM); setError('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.diary_date) { setError('날짜를 선택해주세요.'); return }
    setError(''); setSubmitting(true)

    const body = {
      diary_date: form.diary_date,
      bedtime: form.bedtime || null,
      wake_time: form.wake_time || null,
      total_sleep_min: hmToMins(form.total_sleep_h, form.total_sleep_m),
      deep_sleep_min:  hmToMins(form.deep_sleep_h,  form.deep_sleep_m),
      light_sleep_min: hmToMins(form.light_sleep_h, form.light_sleep_m),
      rem_sleep_min:   hmToMins(form.rem_sleep_h,   form.rem_sleep_m),
    }

    const res = await fetch(`/api/admin/patients/${id}/sleep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSubmitting(false)
    if (!res.ok) { const d = await res.json(); setError(d.error ?? '오류가 발생했습니다.'); return }
    setShowForm(false); setEditingDate(null); setForm(EMPTY_FORM); fetchData()
  }

  const isEditing = editingDate !== null

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary text-sm">← 환자 정보</button>
        <h1 className="text-2xl font-bold text-text-primary flex-1">수면 데이터 입력</h1>
        <button
          onClick={showForm ? handleCancel : openNew}
          className="px-4 py-2 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          {showForm ? '취소' : '+ 데이터 입력'}
        </button>
      </div>

      {/* 입력/수정 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-5 mb-6 space-y-5">
          <h2 className="font-semibold text-text-primary">
            {isEditing ? `수면 데이터 수정 — ${fmtDate(editingDate!)}` : '수면 데이터 입력'}
          </h2>

          {/* 날짜 */}
          <div>
            <label className="label">날짜 *</label>
            <input
              type="date" required value={form.diary_date}
              onChange={e => set('diary_date', e.target.value)}
              disabled={isEditing}
              className={`${inputCls} ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* 취침 · 기상 */}
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

          {/* 수면 시간 (시/분 분리 입력) */}
          {(
            [
              { label: '총 수면', hKey: 'total_sleep_h', mKey: 'total_sleep_m' },
              { label: '깊은 수면', hKey: 'deep_sleep_h', mKey: 'deep_sleep_m' },
              { label: '얕은 수면', hKey: 'light_sleep_h', mKey: 'light_sleep_m' },
              { label: 'REM 수면', hKey: 'rem_sleep_h', mKey: 'rem_sleep_m' },
            ] as { label: string; hKey: keyof SleepForm; mKey: keyof SleepForm }[]
          ).map(({ label, hKey, mKey }) => (
            <div key={hKey}>
              <label className="label">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="0" max="23" placeholder="0"
                  value={form[hKey]} onChange={e => set(hKey, e.target.value)}
                  className={`${inputCls} w-20 text-center`}
                />
                <span className="text-text-secondary text-sm font-medium">시</span>
                <input
                  type="number" min="0" max="59" placeholder="0"
                  value={form[mKey]} onChange={e => set(mKey, e.target.value)}
                  className={`${inputCls} w-20 text-center`}
                />
                <span className="text-text-secondary text-sm font-medium">분</span>
              </div>
            </div>
          ))}

          {error && <p className="text-danger text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit" disabled={submitting}
              className="flex-1 py-2.5 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {submitting ? '저장 중...' : isEditing ? '수정 저장' : '저장'}
            </button>
            <button
              type="button" onClick={handleCancel}
              className="px-5 py-2.5 bg-bg-secondary text-text-secondary rounded-[--radius-sm] text-sm font-medium hover:bg-bg-tertiary transition-colors"
            >
              취소
            </button>
          </div>
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
                <th className="text-right px-4 py-3 font-semibold text-text-secondary">깊은 수면</th>
                <th className="text-right px-4 py-3 font-semibold text-text-secondary">얕은 수면</th>
                <th className="text-right px-4 py-3 font-semibold text-text-secondary">REM</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-tertiary">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-bg-secondary transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">{fmtDate(r.diary_date)}</td>
                  <td className="px-4 py-3 text-text-secondary">{r.bedtime ?? '-'}</td>
                  <td className="px-4 py-3 text-text-secondary">{r.wake_time ?? '-'}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{fmtMins(r.total_sleep_min)}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{fmtMins(r.deep_sleep_min)}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{fmtMins(r.light_sleep_min)}</td>
                  <td className="px-4 py-3 text-right text-text-secondary">{fmtMins(r.rem_sleep_min)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(r)}
                      className="text-brand-500 hover:text-brand-700 text-xs font-medium px-2 py-1 rounded hover:bg-bg-secondary transition-colors"
                    >
                      수정
                    </button>
                  </td>
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
