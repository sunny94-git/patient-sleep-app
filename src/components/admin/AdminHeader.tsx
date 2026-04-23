'use client'

import { Bell, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': '대시보드',
  '/admin/patients': '환자 목록',
  '/admin/sleep-data': '수면 데이터 입력',
  '/admin/exams': '검사 결과 입력',
  '/admin/qna': 'Q&A 관리',
}

export default function AdminHeader() {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? '관리자'

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-400 w-56"
            placeholder="환자 검색, 리포트..."
            readOnly
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
            관
          </div>
          <span className="text-sm font-medium text-gray-700">admin</span>
        </div>
      </div>
    </header>
  )
}
