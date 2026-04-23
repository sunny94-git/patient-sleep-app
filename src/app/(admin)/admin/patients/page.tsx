import { requireAdmin } from '@/lib/supabase/admin'
import { logoutAction } from '@/app/login/actions'
import Link from 'next/link'
import { Users, LogOut, Moon, MessageCircle } from 'lucide-react'

export default async function AdminPatientsPage() {
  const { supabase } = await requireAdmin()

  const [patientsRes, diaryDatesRes, unansweredRes] = await Promise.all([
    supabase.from('patients').select('*').order('registration_number'),
    supabase.from('sleep_diary').select('patient_id, diary_date').order('diary_date', { ascending: false }),
    supabase.from('qna').select('patient_id').eq('is_answered', false),
  ])

  const patients = patientsRes.data ?? []
  const diaryDates = diaryDatesRes.data ?? []
  const unanswered = unansweredRes.data ?? []

  const latestDiary = new Map<string, string>()
  for (const d of diaryDates) {
    if (!latestDiary.has(d.patient_id)) latestDiary.set(d.patient_id, d.diary_date)
  }

  const unansweredCount = new Map<string, number>()
  for (const q of unanswered) {
    unansweredCount.set(q.patient_id, (unansweredCount.get(q.patient_id) ?? 0) + 1)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Moon className="text-brand-500" size={22} />
          <div>
            <h1 className="text-base font-bold text-gray-900">수면장애 클리닉</h1>
            <p className="text-xs text-gray-400">관리자 페이지</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={13} /> 로그아웃
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-3 mb-5">
        <Users className="text-brand-500 shrink-0" size={20} />
        <span className="text-sm text-gray-600">총 <span className="font-bold text-gray-900">{patients.length}</span>명의 환자가 등록되어 있습니다.</span>
      </div>

      {/* Patient list */}
      {patients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center text-sm text-gray-400">
          등록된 환자가 없습니다.
        </div>
      ) : (
        <div className="space-y-2">
          {patients.map((p) => {
            const latest = latestDiary.get(p.id)
            const qnaCount = unansweredCount.get(p.id) ?? 0
            return (
              <Link
                key={p.id}
                href={`/admin/patients/${p.id}`}
                className="block bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-brand-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                      <span className="text-xs text-gray-400">#{p.registration_number}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      최근 일지: {latest ?? '없음'}
                      {p.birth_date && <span className="ml-2">생년월일: {p.birth_date}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {qnaCount > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full">
                        <MessageCircle size={11} /> {qnaCount}
                      </span>
                    )}
                    <span className="text-gray-300 text-sm">›</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
