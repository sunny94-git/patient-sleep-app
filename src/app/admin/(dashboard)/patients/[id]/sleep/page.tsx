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
  condition: number | null
  daytime_sleepiness: string | null
  nap_taken: boolean | null
  nap_duration_min: number | null
  dream: string | null
  caffeine: string | null
  alcohol: boolean | null
  memo: string | null
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
  sleep_onset_latency: string
  night_awakening_count: string
  daytime_sleepiness: string
  nap_taken: string
  nap_duration_min: string
  dream: string
  caffeine: string
  alcohol: string
  condition: string
  memo: string
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
  sleep_onset_latency: '',
  night_awakening_count: '',
  daytime_sleepiness: '',
  nap_taken: '',
  nap_duration_min: '',
  dream: '',
  caffeine: '',
  alcohol: '',
  condition: '',
  memo: '',
  total_sleep_min: '',
  deep_sleep_min: '',
  light_sleep_min: '',
  rem_sleep_min: '',
  sleep_quality: '',
  morning_fatigue: '',
  admin_note: '',
}

function rowToForm(r: DiaryRow): SleepForm {
  return {
    diary_date: r.diary_date,
    bedtime: r.bedtime ?? '',
    wake_time: r.wake_time ?? '',
    sleep_onset_latency: r.sleep_onset_latency ?? '',
    night_awakening_count: r.night_awakening_count ?? '',
    daytime_sleepiness: r.daytime_sleepiness ?? '',
    nap_taken: r.nap_taken === true ? 'true' : r.nap_taken === false ? 'false' : '',
    nap_duration_min: r.nap_duration_min != null ? String(r.nap_duration_min) : '',
    dream: r.dream ?? '',
    caffeine: r.caffeine ?? '',
    alcohol: r.alcohol === true ? 'true' : r.alcohol === false ? 'false' : '',
    condition: r.condition != null ? String(r.condition) : '',
    memo: r.memo ?? '',
    total_sleep_min: r.total_sleep_min != null ? String(r.total_sleep_min) : '',
    deep_sleep_min: r.deep_sleep_min != null ? String(r.deep_sleep_min) : '',
    light_sleep_min: r.light_sleep_min != null ? String(r.light_sleep_min) : '',
    rem_sleep_min: r.rem_sleep_min != null ? String(r.rem_sleep_min) : '',
    sleep_quality: r.sleep_quality != null ? String(r.sleep_quality) : '',
    morning_fatigue: r.morning_fatigue != null ? String(r.morning_fatigue) : '',
    admin_note: r.admin_note ?? '',
  }
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
    setEditingDate(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEdit = (row: DiaryRow) => {
    setEditingDate(row.diary_date)
    setForm(rowToForm(row))
    setError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingDate(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.diary_date) { setError('날짜를 선택해주세요.'); return }
    setError('')
    setSubmitting(true)

    const body = {
      diary_date: form.diary_date,
      bedtime: form.bedtime || null,
      wake_time: form.wake_time || null,
      sleep_onset_latency: form.sleep_onset_latency || null,
      night_awakening_count: form.night_awakening_count || null,
      daytime_sleepiness: form.daytime_sleepiness || null,
      nap_taken: form.nap_taken === 'true' ? true : form.nap_taken === 'false' ? false : null,
      nap_duration_min: form.nap_duration_min ? parseInt(form.nap_duration_min) : null,
      dream: form.dream || null,
      caffeine: form.caffeine || null,
      alcohol: form.alcohol === 'true' ? true : form.alcohol === 'false' ? false : null,
      condition: form.condition ? parseInt(form.condition) : null,
      memo: form.memo || null,
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
    setEditingDate(null)
    setForm(EMPTY_FORM)
    fetchData()
  }

  const isEditing = editingDate !== null

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
        <form onSubmit={handleSubmit} className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-text-primary">
            {isEditing ? `수면 데이터 수정 — ${formatDate(editingDate!)}` : '수면 데이터 입력'}
          </h2>

          <div>
            <label className="label">날짜 *</label>
            <input
              type="date"
              required
              value={form.diary_date}
              onChange={e => set('diary_date', e.target.value)}
              disabled={isEditing}
              className={`${inputCls} ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* 취침/기상 */}
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

          {/* 수면 잠들기·각성 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">잠드는 데 걸린 시간</label>
              <select value={form.sleep_onset_latency} onChange={e => set('sleep_onset_latency', e.target.value)} className={inputCls}>
                <option value="">선택</option>
                {['0~10분', '10~30분', '30~60분', '60분 이상'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">밤중 각성 횟수</label>
              <select value={form.night_awakening_count} onChange={e => set('night_awakening_count', e.target.value)} className={inputCls}>
                <option value="">선택</option>
                {['없음', '1회', '2회', '3회 이상'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* 수면 측정 데이터 */}
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

          {/* 주관적 평가 */}
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
            <div>
              <label className="label">낮 졸음</label>
              <select value={form.daytime_sleepiness} onChange={e => set('daytime_sleepiness', e.target.value)} className={inputCls}>
                <option value="">선택</option>
                {['없음', '약간', '심함'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">오늘 컨디션 (1–5)</label>
              <select value={form.condition} onChange={e => set('condition', e.target.value)} className={inputCls}>
                <option value="">선택</option>
                {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* 낮잠·꿈·카페인·음주 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">낮잠</label>
              <select value={form.nap_taken} onChange={e => set('nap_taken', e.target.value)} className={inputCls}>
                <option value="">선택</option>
                <option value="false">없음</option>
                <option value="true">있음</option>
              </select>
            </div>
            {form.nap_taken === 'true' && (
              <div>
                <label className="label">낮잠 시간 (분)</label>
                <input type="number" min="0" max="480" value={form.nap_duration_min} onChange={e => set('nap_duration_min', e.target.value)} placeholder="30" className={inputCls} />
              </div>
            )}
            <div>
              <label className="label">꿈</label>
              <select value={form.dream} onChange={e => set('dream', e.target.value)} className={inputCls}>
                <option value="">선택</option>
                {['없음', '기억 안남', '꿈꿈'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">카페인 섭취</label>
              <select value={form.caffeine} onChange={e => set('caffeine', e.target.value)} className={inputCls}>
                <option value="">선택</option>
                {['없음', '1잔', '2잔', '3잔 이상'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">음주</label>
              <select value={form.alcohol} onChange={e => set('alcohol', e.target.value)} className={inputCls}>
                <option value="">선택</option>
                <option value="false">없음</option>
                <option value="true">있음</option>
              </select>
            </div>
          </div>

          {/* 메모·원장 메모 */}
          <div>
            <label className="label">환자 메모</label>
            <textarea
              rows={2}
              value={form.memo}
              onChange={e => set('memo', e.target.value)}
              placeholder="환자가 입력한 메모"
              className={`${inputCls} resize-none`}
            />
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {submitting ? '저장 중...' : isEditing ? '수정 저장' : '저장'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
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
                <th className="text-right px-4 py-3 font-semibold text-text-secondary">깊은</th>
                <th className="text-right px-4 py-3 font-semibold text-text-secondary">REM</th>
                <th className="text-center px-4 py-3 font-semibold text-text-secondary">질</th>
                <th className="px-4 py-3" />
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
