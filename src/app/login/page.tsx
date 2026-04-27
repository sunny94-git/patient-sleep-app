'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Moon, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [regNumber, setRegNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const email = `${regNumber.trim()}@patient.local`
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('등록번호 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    router.push('/home')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center px-5">
      {/* 로고 영역 */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-[#4A90D9] rounded-2xl flex items-center justify-center mb-4 shadow-md">
          <Moon className="text-white w-8 h-8" />
        </div>
        <h1 className="text-xl font-semibold text-[#1A202C]">수면장애 클리닉</h1>
        <p className="text-sm text-[#718096] mt-1">원광대학교 광주한방병원</p>
      </div>

      {/* 로그인 카드 */}
      <div className="w-full max-w-[375px] bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
        <h2 className="text-lg font-semibold text-[#1A202C] mb-6">환자 로그인</h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* 등록번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#4A5568]">등록번호</label>
            <input
              type="text"
              value={regNumber}
              onChange={e => setRegNumber(e.target.value)}
              placeholder="병원 등록번호를 입력하세요"
              className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg px-4 py-3 text-sm text-[#1A202C] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#4A90D9] focus:bg-white transition-colors min-h-[48px]"
              required
              autoComplete="username"
            />
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#4A5568]">비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full bg-[#F5F7FA] border border-[#E2E8F0] rounded-lg px-4 py-3 pr-12 text-sm text-[#1A202C] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#4A90D9] focus:bg-white transition-colors min-h-[48px]"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0AEC0] hover:text-[#718096] p-1"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 에러 */}
          {error && (
            <p className="text-sm text-[#EF4444] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={loading} className="mt-2">
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>

      <p className="text-xs text-[#A0AEC0] mt-6 text-center">
        로그인 문의: 원광대학교 광주한방병원 수면장애 클리닉
      </p>
    </div>
  )
}
