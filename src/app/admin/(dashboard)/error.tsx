'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-5xl mb-4">⚠️</p>
      <h2 className="text-xl font-bold text-text-primary mb-2">오류가 발생했습니다</h2>
      <p className="text-sm text-text-muted mb-6">페이지를 불러오는 중 문제가 생겼습니다.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-semibold hover:bg-brand-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}
