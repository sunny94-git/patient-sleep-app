'use client'

import Link from 'next/link'
import { BookOpen, ClipboardList, FileText, HelpCircle, Settings, CheckCircle2, AlertCircle } from 'lucide-react'
import { getISISeverity } from '@/types'

interface Props {
  patient: { id: string; name: string; registration_number: string }
  todayDiary: { diary_date: string } | null
  latestIsi: { total_score: number; assessed_at: string } | null
  nextVisit: string | null
  settings: { push_enabled: boolean; diary_remind: boolean; med_alarm: boolean; qna_alarm: boolean }
}

const MENU = [
  { href: '/diary', label: '수면 일지', icon: BookOpen, desc: '오늘의 수면을 기록하세요' },
  { href: '/isi', label: 'ISI 평가', icon: ClipboardList, desc: '불면증 심각도 자가 평가' },
  { href: '/prescription', label: '처방·검사', icon: FileText, desc: '처방 및 검사 결과 확인' },
  { href: '/qna', label: '문의하기', icon: HelpCircle, desc: '의료진에게 문의하세요' },
  { href: '/records', label: '진료 기록', icon: FileText, desc: '방문 기록 및 이력' },
]

export default function HomeClient({ patient, todayDiary, latestIsi, nextVisit }: Props) {
  const isiSeverity = latestIsi ? getISISeverity(latestIsi.total_score) : null
  const isiColor = isiSeverity === '없음' ? 'text-green-600' : isiSeverity === '경미' ? 'text-yellow-600' : isiSeverity === '중등도' ? 'text-orange-500' : 'text-red-500'

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-brand-500 px-5 pt-12 pb-8 text-white">
        <p className="text-sm text-blue-200 mb-1">안녕하세요,</p>
        <h1 className="text-2xl font-bold">{patient.name} 님</h1>
        <p className="text-xs text-blue-200 mt-1">#{patient.registration_number}</p>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">오늘의 상태</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatusItem
              label="오늘 일지"
              value={todayDiary ? '작성 완료' : '미작성'}
              icon={todayDiary ? CheckCircle2 : AlertCircle}
              ok={!!todayDiary}
            />
            <StatusItem
              label="ISI 점수"
              value={latestIsi ? `${latestIsi.total_score}점 (${isiSeverity})` : '미평가'}
              icon={ClipboardList}
              ok={!!latestIsi}
              valueClass={latestIsi ? isiColor : undefined}
            />
          </div>
          {nextVisit && (
            <div className="bg-blue-50 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs text-blue-700 font-medium">다음 방문일</span>
              <span className="text-sm font-semibold text-blue-800">{nextVisit}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MENU.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl shadow-card p-4 flex flex-col gap-2 hover:bg-blue-50 transition-colors active:scale-95"
            >
              <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                <Icon size={18} className="text-brand-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{desc}</p>
              </div>
            </Link>
          ))}
          <Link
            href="/settings"
            className="bg-white rounded-2xl shadow-card p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors active:scale-95"
          >
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
              <Settings size={18} className="text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">설정</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">알림 및 환경 설정</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatusItem({ label, value, icon: Icon, ok, valueClass }: {
  label: string; value: string; icon: React.ElementType; ok: boolean; valueClass?: string
}) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={13} className={ok ? 'text-green-500' : 'text-gray-400'} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${valueClass ?? (ok ? 'text-gray-900' : 'text-gray-400')}`}>{value}</p>
    </div>
  )
}
