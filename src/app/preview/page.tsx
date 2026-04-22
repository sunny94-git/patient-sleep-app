import Link from 'next/link'

export default function PreviewIndex() {
  const screens = [
    { href: '/preview/home', label: '홈' },
    { href: '/preview/diary', label: '수면 일지' },
    { href: '/preview/records', label: '기록' },
    { href: '/preview/isi', label: 'ISI 자가진단' },
    { href: '/preview/prescription', label: '처방' },
    { href: '/preview/qna', label: '문의' },
  ]
  return (
    <div className="px-6 py-10 space-y-3">
      <h1 className="text-h1 text-gray-900 mb-6">화면 프리뷰</h1>
      {screens.map((s) => (
        <Link key={s.href} href={s.href}
          className="block card text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors">
          {s.label} →
        </Link>
      ))}
    </div>
  )
}
