'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Microscope, HelpCircle, Moon, UserPlus } from 'lucide-react'

const MENU = [
  { href: '/admin/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/patients', label: '환자 관리', icon: Users },
  { href: '/admin/patients/new', label: '신규 환자 등록', icon: UserPlus },
  { href: '/admin/exams', label: '검사 결과', icon: Microscope },
  { href: '/admin/sleep-data', label: '수면 데이터', icon: Moon },
  { href: '/admin/qna', label: '문의 관리', icon: HelpCircle },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-200">
        <h1 className="text-sm font-bold text-gray-900 leading-tight">원광대 광주한방병원</h1>
        <p className="text-xs text-gray-500 mt-0.5">수면장애 클리닉</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {MENU.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-5 py-4 border-t border-gray-200 text-xs text-gray-400">
        v1.0.0
      </div>
    </aside>
  )
}
