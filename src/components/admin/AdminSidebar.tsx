'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin/dashboard',  label: '대시보드',        icon: '📊' },
  { href: '/admin/patients',   label: '환자 목록',        icon: '👥' },
  { href: '/admin/qna',        label: 'Q&A 관리',        icon: '💬' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  return (
    <aside className="w-56 shrink-0 bg-bg-primary border-r border-bg-tertiary flex flex-col h-screen sticky top-0">
      {/* 로고 */}
      <div className="px-5 py-5 border-b border-bg-tertiary">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-[6px] flex items-center justify-center">
            <span className="text-white text-sm font-bold">W</span>
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary leading-tight">수면클리닉</p>
            <p className="text-xs text-text-muted">관리자</p>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[--radius-sm] text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* 로그아웃 */}
      <div className="p-3 border-t border-bg-tertiary">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[--radius-sm] text-sm font-medium text-text-muted hover:bg-bg-secondary hover:text-danger transition-colors"
        >
          <span className="text-base">🚪</span>
          로그아웃
        </button>
      </div>
    </aside>
  )
}
