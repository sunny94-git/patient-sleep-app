'use client'

import { useState, useEffect } from 'react'
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
  const [regNumStatus, setRegNumStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  // 등록번호 중복 확인 (디바운스)
  useEffect(() => {
    const num = form.registration_number.trim()
    if (!num) { setRegNumStatus('idle'); return }
    setRegNumStatus('checking')
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/admin/patients/check?registration_number=${encodeURIComponent(num)}`)
      const data = await res.json()
      setRegNumStatus(data.available ? 'available' : 'taken')
    }, 400)
    return () => clearTimeout(timer)
  }, [form.registration_number])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (regNumStatus === 'taken') { setError('이미 사용 중인 등록번호입니다.'); return }
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

  const regNumHint = {
    idle:      { text: '로그인 ID로 사용됩니다.', color: 'text-text-muted' },
    checking:  { text: '확인 중...', color: 'text-text-muted' },
    available: { text: '✓ 사용 가능한 등록번호입니다.', color: 'text-success' },
    taken:     { text: '✗ 이미 사용 중인 등록번호입니다.', color: 'text-danger' },
  }[regNumStatus]

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary text-sm">
          ← 목록
        </button>
        <h1 className="text-2xl font-bold text-text-primary">환자 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-6 space-y-5">
        <Field label="이름 *">
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
            placeholder="홍길동"
            className={inputCls}
          />
        </Field>

        <Field label="등록번호 *" hint={regNumHint.text} hintColor={regNumHint.color}>
          <input
            type="text"
            value={form.registration_number}
            onChange={e => set('registration_number', e.target.value)}
            required
            placeholder="예: 2024001"
            className={`${inputCls} ${regNumStatus === 'taken' ? 'border-danger focus:border-danger' : regNumStatus === 'available' ? 'border-success focus:border-success' : ''}`}
          />
        </Field>

        <Field label="초기 비밀번호 *" hint="환자가 처음 로그인할 때 사용하는 비밀번호입니다.">
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
            disabled={submitting || regNumStatus === 'taken' || regNumStatus === 'checking'}
            className="flex-1 py-2.5 rounded-[--radius-sm] bg-brand-500 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '환자 등록'}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-[--radius-sm] border border-bg-tertiary bg-bg-secondary text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-brand-400 text-sm transition-colors'

function Field({ label, children, hint, hintColor = 'text-text-muted' }: {
  label: string; children: React.ReactNode; hint?: string; hintColor?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      {children}
      {hint && <p className={`text-xs mt-1 ${hintColor}`}>{hint}</p>}
    </div>
  )
}
