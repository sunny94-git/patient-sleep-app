'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save } from 'lucide-react'
import Link from 'next/link'

const SEVERITY_OPTIONS = ['경미', '중등도', '심각']
const DIAGNOSIS_OPTIONS = ['불면증', '수면무호흥증', '기면병', '하지불안증후군', '렁수면행동장애', '기타']

export default function NewPatientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    registration_number: '',
    name: '',
    birth_date: '',
    phone: '',
    diagnosis: '',
    severity: '중등도',
    onset_date: '',
    notes: '',
    prescription: '',
    treatment_notes: '',
    visit_date: '',
    next_visit_date: '',
  })

  function set(key: keyof typeof form, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.registration_number.trim() || !form.name.trim() || !form.diagnosis.trim()) {
      setError('등록번호, 이름, 진단명은 필수입니다.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '저장에 실패했습니다.')
        return
      }
      router.push(`/admin/patients/${data.id}`)
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-brand-400 focus:bg-white placeholder:text-gray-400'
  const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/patients" className="text-gray-400 hover:text-gray-600">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">신규 환자 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl p-5 shadow-card space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">📋 기본 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>등록번호 <span className="text-red-500">*</span></label>
              <input className={inputCls} placeholder="P001" value={form.registration_number} onChange={(e) => set('registration_number', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>이름 <span className="text-red-500">*</span></label>
              <input className={inputCls} placeholder="홍길동" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>생년월일</label>
              <input type="date" className={inputCls} value={form.birth_date} onChange={(e) => set('birth_date', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>연락소</label>
              <input className={inputCls} placeholder="010-0000-0000" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-card space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">🩺 진단 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>진단명 <span className="text-red-500">*</span></label>
              <select className={inputCls} value={form.diagnosis} onChange={(e) => set('diagnosis', e.target.value)}>
                <option value="">선택하세요</option>
                {DIAGNOSIS_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>중증도</label>
              <div className="flex gap-3 mt-2">
                {SEVERITY_OPTIONS.map((s) => (
                  <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="severity" value={s} checked={form.severity === s} onChange={() => set('severity', s)} className="accent-brand-500" />
                    <span className="text-sm text-gray-700">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>발병일</label>
              <input type="date" className={inputCls} value={form.onset_date} onChange={(e) => set('onset_date', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>비고</label>
              <input className={inputCls} placeholder="특이사항" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-card space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">💊 처방 정보 (선택)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>처방명</label>
              <input className={inputCls} placeholder="가감귀비탕" value={form.prescription} onChange={(e) => set('prescription', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>진료 메모</label>
              <input className={inputCls} placeholder="복약 지시 사항" value={form.treatment_notes} onChange={(e) => set('treatment_notes', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>진료일</label>
              <input type="date" className={inputCls} value={form.visit_date} onChange={(e) => set('visit_date', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>다음 방문 예정일</label>
              <input type="date" className={inputCls} value={form.next_visit_date} onChange={(e) => set('next_visit_date', e.target.value)} />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-3">
          <Link href="/admin/patients" className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">취소</Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50">
            <Save size={15} />
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
