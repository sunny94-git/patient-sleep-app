'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminHeader() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="text-sm font-semibold text-gray-700">관리자 대시보드</div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
      >
        <LogOut size={14} />
        로그아웃
      </button>
    </header>
  )
}
