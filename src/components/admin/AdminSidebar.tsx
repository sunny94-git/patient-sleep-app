'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  BedDouble,
  Microscope,
  LogOut,
  Moon,
} from 'lucide-react'
import { logoutAction } from '@/app/login/actions'

const NAV = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { href: '/admin/patients', icon: Users, label: '환자 목록' },
  { href: '/admin/sleep-data', icon: BedDouble, label: '수면 데이터 입력' },
  { href: '/admin/exams', icon: Microscope, label: '검사 결과 입력' },
  { href: '/admin/qna', icon: MessageCircle, label: 'Q&A 관리' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col h-screen sticky top-0 z-20">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-200 shrink-0">
        <Moon className="text-brand-500 shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold text-gray-900">수면장애 클리닉</p>
          <p className="text-xs text-gray-400">관리자</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 shrink-0">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  )
}
