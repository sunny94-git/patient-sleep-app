'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalPatients: number
  diaryToday: number
  diaryWeek: number
  unansweredQna: number
}

function StatCard({ label, value, icon, href, color }: {
  label: string
  value: number | undefined
  icon: string
  href: string
  color: string
}) {
  return (
    <Link href={href} className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-5 hover:shadow-[--shadow-card-hover] transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${color}`}>{label}</span>
      </div>
      <p className="text-3xl font-bold text-text-primary">{value ?? '—'}</p>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats)
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">대시보드</h1>
        <p className="text-text-muted text-sm mt-1">
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard label="전체 환자" value={stats?.totalPatients} icon="👥" href="/admin/patients" color="bg-brand-50 text-brand-700" />
        <StatCard label="오늘 일지" value={stats?.diaryToday}    icon="📝" href="/admin/patients" color="bg-success/10 text-success" />
        <StatCard label="주간 일지" value={stats?.diaryWeek}     icon="📅" href="/admin/patients" color="bg-warning/10 text-warning" />
        <StatCard label="미답변 Q&A" value={stats?.unansweredQna} icon="💬" href="/admin/qna"     color="bg-danger/10 text-danger" />
      </div>

      {/* 바로가기 */}
      <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-5">
        <h2 className="text-base font-semibold text-text-primary mb-4">빠른 메뉴</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: '/admin/patients/new', label: '환자 등록', icon: '➕' },
            { href: '/admin/patients',     label: '환자 목록', icon: '👥' },
            { href: '/admin/qna',          label: 'Q&A 관리',  icon: '💬' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 rounded-[--radius-sm] bg-bg-secondary hover:bg-bg-tertiary transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium text-text-secondary">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
