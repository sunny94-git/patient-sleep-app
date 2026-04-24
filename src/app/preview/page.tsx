import Link from 'next/link'

const PAGES = [
  { href: '/preview/home', label: '홈' },
  { href: '/preview/diary', label: '수면일지' },
  { href: '/preview/isi', label: 'ISI 평가' },
  { href: '/preview/prescription', label: '처방전' },
  { href: '/preview/qna', label: 'Q&A' },
  { href: '/preview/records', label: '진료 기록' },
]

export default function PreviewIndexPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-gray-900 text-center">UI 미리보기</h1>
        <p className="text-sm text-gray-500 text-center">개발용 화면 미리보기입니다.</p>
        <div className="space-y-2 pt-2">
          {PAGES.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              {label}
              <span className="text-gray-400">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
