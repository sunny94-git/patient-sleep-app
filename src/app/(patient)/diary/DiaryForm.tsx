'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

interface DiaryEntry {
  id: string
  diary_date: string
  bedtime: string | null
  wake_time: string | null
  sleep_onset_latency: string | null
  night_awakening_count: string | null
  sleep_quality: number | null
  condition: number | null
  memo: string | null
}

const LATENCY_OPTIONS = ['0~10분', '10~30분', '30~60분', '60분 이상']
const AWAKENING_OPTIONS = ['없음', '1회', '2회', '3회 이상']

interface Props {
  date: string
  initial: DiaryEntry | null
  onSaved: (record: DiaryEntry) => void
  onCancel: () => void
}

export default function DiaryForm({ date, initial, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    bedtime: initial?.bedtime ?? '',
    wake_time: initial?.wake_time ?? '',
    sleep_onset_latency: initial?.sleep_onset_latency ?? '',
    night_awakening_count: initial?.night_awakening_count ?? '',
    sleep_quality: initial?.sleep_quality ?? null as number | null,
    condition: initial?.condition ?? null as number | null,
    memo: initial?.memo ?? '',
    nap_taken: false,
    alcohol: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const res = await fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, diary_date: date }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    onSaved(data.record)
  }

  const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">취침 시간</label>
          <input type="time" value={form.bedtime} onChange={(e) => set('bedtime', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">기상 시간</label>
          <input type="time" value={form.wake_time} onChange={(e) => set('wake_time', e.target.value)} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">잊들기까지 걸린 시간</label>
        <div className="flex flex-wrap gap-2">
          {LATENCY_OPTIONS.map((o) => (
            <button key={o} type="button"
              onClick={() => set('sleep_onset_latency', form.sleep_onset_latency === o ? '' : o)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${form.sleep_onset_latency === o ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">야간 각성 횟수</label>
        <div className="flex flex-wrap gap-2">
          {AWAKENING_OPTIONS.map((o) => (
            <button key={o} type="button"
              onClick={() => set('night_awakening_count', form.night_awakening_count === o ? '' : o)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${form.night_awakening_count === o ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">수면 만족도 (1~5)</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} type="button"
                onClick={() => set('sleep_quality', form.sleep_quality === v ? null : v)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${form.sleep_quality === v ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">오늘 콘디션 (1~5)</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <button key={v} type="button"
                onClick={() => set('condition', form.condition === v ? null : v)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${form.condition === v ? 'bg-brand-500 text-white border-brand-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">메모</label>
        <textarea value={form.memo} onChange={(e) => set('memo', e.target.value)} rows={2}
          className={`${inputCls} resize-none`} placeholder="자유롭게 기록하세요" />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">취소</button>
        <button onClick={handleSave} disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50">
          <Save size={14} />
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
