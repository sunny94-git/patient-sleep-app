'use client'

import { useState } from 'react'
import { Moon, Eye, EyeOff } from 'lucide-react'
import { loginAction } from './actions'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center px-5">
      <div className="w-full max-w-[360px]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-4">
            <Moon className="text-white" size={32} />
          </div>
          <h1 className="text-display text-gray-900">수면장애 클리닉</h1>
          <p className="text-body text-gray-500 mt-1">원광대학교 광주한방병원</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="registration_number"
              className="text-sm font-medium text-gray-700"
            >
              등록번호
            </label>
            <input
              id="registration_number"
              name="registration_number"
              type="text"
              inputMode="numeric"
              placeholder="병원 등록번호 입력"
              autoComplete="username"
              required
              className="flex w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="비밀번호 입력"
                autoComplete="current-password"
                required
                className="flex w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pr-10 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          로그인 문제가 있으신가요?<br />
          병원 원무과에 문의해주세요.
        </p>
      </div>
    </div>
  )
}
