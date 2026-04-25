import { requireAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { MessageCircle, CheckCircle, Clock } from 'lucide-react'

export default async function AdminQnAPage() {
  const { supabase } = await requireAdmin()

  type QnARow = {
    id: string; question: string; answer: string | null; is_answered: boolean
    created_at: string; answered_at: string | null; patient_id: string
    patients: { name: string; registration_number: string } | null
  }

  const { data } = await supabase
    .from('qna')
    .select('*, patients(name, registration_number)')
    .order('created_at', { ascending: false })

  const items = (data ?? []) as unknown as QnARow[]
  const unanswered = items.filter((q) => !q.is_answered)
  const answered = items.filter((q) => q.is_answered)

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <div className="flex items-center gap-2">
        <MessageCircle size={20} className="text-brand-500" />
        <h1 className="text-xl font-bold text-gray-900">문의 관리</h1>
        {unanswered.length > 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
            {unanswered.length}
          </span>
        )}
      </div>

      {unanswered.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-red-500 flex items-center gap-1.5">
            <Clock size={14} /> 미답변 ({unanswered.length}건)
          </h2>
          {unanswered.map((q) => (
            <QnACard key={q.id} item={q} />
          ))}
        </section>
      )}

      {answered.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 flex items-center gap-1.5">
            <CheckCircle size={14} /> 답변 완료 ({answered.length}건)
          </h2>
          {answered.map((q) => (
            <QnACard key={q.id} item={q} />
          ))}
        </section>
      )}

      {items.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center text-sm text-gray-400 shadow-card">
          문의 내역이 없습니다.
        </div>
      )}
    </div>
  )
}

function QnACard({ item }: { item: { id: string; question: string; answer: string | null; is_answered: boolean; created_at: string; answered_at: string | null; patient_id: string; patients: { name: string; registration_number: string } | null } }) {
  const patient = item.patients
  return (
    <div className="bg-white rounded-xl shadow-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          {patient && (
            <Link
              href={`/admin/patients`}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              {patient.name} #{patient.registration_number}
            </Link>
          )}
          <p className="text-sm text-gray-800">{item.question}</p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{item.created_at.slice(0, 10)}</span>
      </div>
      {item.is_answered && item.answer && (
        <div className="bg-brand-50 rounded-lg px-3 py-2 text-xs text-brand-800">
          <span className="font-medium">답변: </span>{item.answer}
        </div>
      )}
      {!item.is_answered && (
        <p className="text-xs text-red-400">미답변 — 환자 상세 페이지에서 답변하세요.</p>
      )}
    </div>
  )
}
