'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) {
      showToast('새 비밀번호가 일치하지 않습니다.', 'error')
      return
    }
    if (newPw.length < 6) {
      showToast('비밀번호는 6자 이상이어야 합니다.', 'error')
      return
    }

    setLoading(true)

    // 현재 비밀번호 확인 (재로그인)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      showToast('세션이 만료됐습니다. 다시 로그인해 주세요.', 'error')
      setLoading(false)
      return
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPw,
    })
    if (signInErr) {
      showToast('현재 비밀번호가 올바르지 않습니다.', 'error')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPw })
    setLoading(false)

    if (error) {
      showToast('비밀번호 변경에 실패했습니다.', 'error')
    } else {
      showToast('비밀번호가 변경됐습니다.', 'success')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-4 py-6">
      <h1 className="text-xl font-bold text-[#1A202C] mb-6">설정</h1>

      {/* 비밀번호 변경 */}
      <section className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-[#4A90D9]" />
          <h2 className="text-base font-semibold text-[#1A202C]">비밀번호 변경</h2>
        </div>

        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <PasswordField
            label="현재 비밀번호"
            value={currentPw}
            onChange={setCurrentPw}
            show={showCurrent}
            onToggle={() => setShowCurrent(v => !v)}
          />
          <PasswordField
            label="새 비밀번호"
            value={newPw}
            onChange={setNewPw}
            show={showNew}
            onToggle={() => setShowNew(v => !v)}
            hint="6자 이상"
          />
          <PasswordField
            label="새 비밀번호 확인"
            value={confirmPw}
            onChange={setConfirmPw}
            show={showNew}
            onToggle={() => setShowNew(v => !v)}
          />

          <button
            type="submit"
            disabled={loading || !currentPw || !newPw || !confirmPw}
            className="w-full py-3 mt-1 bg-[#4A90D9] text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </section>

      {/* 토스트 */}
      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 py-3 px-4 rounded-xl text-sm font-medium text-white text-center shadow-lg transition-all z-50 ${
          toast.type === 'success' ? 'bg-[#48BB78]' : 'bg-[#EF4444]'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

function PasswordField({
  label, value, onChange, show, onToggle, hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  hint?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#718096] mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg px-3 py-2.5 pr-10 text-sm text-[#1A202C] focus:outline-none focus:border-[#4A90D9] transition-colors"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {hint && <p className="text-xs text-[#A0AEC0] mt-0.5">{hint}</p>}
    </div>
  )
}
