'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, Pill, ClipboardCheck, MessageCircle, Settings } from 'lucide-react'

const tabs = [
  { href: '/home',         icon: Home,            label: '홈' },
  { href: '/records',      icon: BarChart3,        label: '기록' },
  { href: '/prescription', icon: Pill,             label: '처방' },
  { href: '/isi',          icon: ClipboardCheck,   label: '자가진단' },
  { href: '/qna',          icon: MessageCircle,    label: '문의' },
  { href: '/settings',     icon: Settings,         label: '설정' },
]

export default function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] flex justify-around items-center px-2 pb-safe z-50" style={{ height: 56 }}>
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 min-h-[44px] justify-center transition-colors ${
              active ? 'text-[#4A90D9]' : 'text-[#A0AEC0]'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span className="text-[11px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
