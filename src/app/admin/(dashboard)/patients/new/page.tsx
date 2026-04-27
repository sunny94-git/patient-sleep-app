'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPatientPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    registration_number: '',
    name: '',
    birth_date: '',
    phone: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/admin/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setSubmitting(false)

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? '오류가 발생했습니다.')
      return
    }

    const patient = await res.json()
    router.push(`/admin/patients/${patient.id}`)
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary text-sm">
          ← 목록
        </button>
        <h1 className="text-2xl font-bold text-text-primary">환자 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-6 space-y-5">
        <Field label="이름 *" required>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
            placeholder="홍길동"
            className={inputCls}
          />
        </Field>

        <Field label="등록번호 *" required hint="로그인 ID로 사용됩니다.">
          <input
            type="text"
            value={form.registration_number}
            onChange={e => set('registration_number', e.target.value)}
            required
            placeholder="예: 2024001"
            className={inputCls}
          />
        </Field>

        <Field label="초기 비밀번호 *" required hint="환자가 처음 로그인할 때 사용하는 비밀번호입니다.">
          <input
            type="text"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            required
            placeholder="6자 이상"
            minLength={6}
            className={inputCls}
          />
        </Field>

        <Field label="생년월일">
          <input
            type="date"
            value={form.birth_date}
            onChange={e => set('birth_date', e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="연락처">
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="010-0000-0000"
            className={inputCls}
          />
        </Field>

        {error && <p className="text-danger text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-[--radius-sm] border border-bg-tertiary text-text-secondary text-sm font-medium hover:bg-bg-secondary transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 rounded-[--radius-sm] bg-brand-500 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '환자 등록'}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-[--radius-sm] border border-bg-tertiary bg-bg-secondary text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-brand-400 text-sm'

function Field({ label, children, required, hint }: {
  label: string
  children: React.ReactNode
  required?: boolean
  hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  )
}
