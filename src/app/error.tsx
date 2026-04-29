'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-4">⚠️</p>
      <h1 className="text-2xl font-bold text-[#1A202C] mb-2">오류가 발생했습니다</h1>
      <p className="text-sm text-[#718096] mb-8">일시적인 오류입니다. 잠시 후 다시 시도해 주세요.</p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-[#4A90D9] text-white rounded-xl text-sm font-semibold hover:bg-[#3a7bc8] transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}
