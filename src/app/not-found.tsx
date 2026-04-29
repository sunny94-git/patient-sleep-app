import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-4">🌙</p>
      <h1 className="text-4xl font-bold text-[#1A202C] mb-2">404</h1>
      <p className="text-base text-[#718096] mb-8">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#4A90D9] text-white rounded-xl text-sm font-semibold hover:bg-[#3a7bc8] transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
