'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PatientRef { id: string; name: string; registration_number: string; avgEfficiency?: number }

interface Stats {
  totalPatients: number
  diaryToday: number
  diaryWeek: number
  unansweredQna: number
  inactiveCount: number
  inactivePatients: PatientRef[]
  lowEfficiencyCount: number
  lowEfficiencyPatients: PatientRef[]
}

function StatCard({ label, value, icon, href, color }: {
  label: string; value: number | undefined; icon: string; href: string; color: string
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

function AlertCard({
  title, icon, color, patients, emptyMsg,
}: {
  title: string; icon: string; color: string; patients: PatientRef[]; emptyMsg: string
}) {
  return (
    <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {patients.length > 0 && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>
            {patients.length}명
          </span>
        )}
      </div>
      {patients.length === 0 ? (
        <p className="text-xs text-text-muted">{emptyMsg}</p>
      ) : (
        <div className="space-y-1.5">
          {patients.map(p => (
            <Link
              key={p.id}
              href={`/admin/patients/${p.id}`}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-bg-secondary transition-colors"
            >
              <div>
                <span className="text-sm font-medium text-text-primary">{p.name}</span>
                <span className="text-xs text-text-muted ml-2">{p.registration_number}</span>
              </div>
              {p.avgEfficiency !== undefined && (
                <span className={`text-xs font-semibold ${p.avgEfficiency < 70 ? 'text-danger' : 'text-warning'}`}>
                  {p.avgEfficiency}%
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
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

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="전체 환자"  value={stats?.totalPatients}   icon="👥" href="/admin/patients" color="bg-brand-50 text-brand-700" />
        <StatCard label="오늘 일지"  value={stats?.diaryToday}      icon="📝" href="/admin/patients" color="bg-success/10 text-success" />
        <StatCard label="주간 일지"  value={stats?.diaryWeek}       icon="📅" href="/admin/patients" color="bg-warning/10 text-warning" />
        <StatCard label="미답변 Q&A" value={stats?.unansweredQna}   icon="💬" href="/admin/qna"     color="bg-danger/10 text-danger" />
      </div>

      {/* 주의 환자 */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <AlertCard
          title="최근 7일 일지 미작성 환자"
          icon="⚠️"
          color="bg-warning/10 text-warning"
          patients={stats?.inactivePatients ?? []}
          emptyMsg="모든 환자가 최근 7일 내 일지를 작성했습니다."
        />
        <AlertCard
          title="수면 효율 저하 환자 (평균 85% 미만)"
          icon="📉"
          color="bg-danger/10 text-danger"
          patients={stats?.lowEfficiencyPatients ?? []}
          emptyMsg="수면 효율 저하 환자가 없습니다."
        />
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
