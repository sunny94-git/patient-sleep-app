'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })

    if (authErr || !data.user) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    // 관리자 역할 확인
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (role?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('관리자 계정이 아닙니다.')
      setLoading(false)
      return
    }

    router.replace('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-[--radius-md] flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">W</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">관리자 로그인</h1>
          <p className="text-text-muted text-sm mt-1">수면장애 클리닉 관리 시스템</p>
        </div>

        <form onSubmit={handleLogin} className="bg-bg-primary rounded-[--radius-lg] shadow-[--shadow-card] p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@clinic.com"
              required
              className="w-full px-3 py-2.5 rounded-[--radius-sm] border border-bg-tertiary bg-bg-secondary text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-brand-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-[--radius-sm] border border-bg-tertiary bg-bg-secondary text-text-primary focus:outline-none focus:border-brand-400 text-sm"
            />
          </div>

          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 text-white rounded-[--radius-md] font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
