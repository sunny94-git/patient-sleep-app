'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface SleepDisorder {
  id: string
  diagnosis: string
  severity: string | null
  onset_date: string | null
  notes: string | null
}

interface TreatmentRecord {
  id: string
  visit_date: string | null
  prescription: string | null
  treatment_notes: string | null
  next_visit_date: string | null
  created_at: string
}

interface Patient {
  id: string
  registration_number: string
  name: string
  birth_date: string | null
  phone: string | null
  created_at: string
  sleep_disorders: SleepDisorder[]
  treatment_records: TreatmentRecord[]
}

function formatDate(str: string | null) {
  if (!str) return '-'
  return str.slice(0, 10).replace(/-/g, '.')
}

const SEVERITY_STYLE: Record<string, string> = {
  경미: 'bg-warning/10 text-warning',
  중등도: 'bg-caution/10 text-caution',
  심각: 'bg-danger/10 text-danger',
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  // 처방 추가 상태
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
  const [prescForm, setPrescForm] = useState({ visit_date: '', prescription: '', treatment_notes: '', next_visit_date: '' })
  const [prescSubmitting, setPrescSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/patients/${id}`)
      .then(r => r.json())
      .then(d => { setPatient(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault()
    setPrescSubmitting(true)
    const res = await fetch(`/api/admin/patients/${id}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescForm),
    })
    setPrescSubmitting(false)
    if (res.ok) {
      setShowPrescriptionForm(false)
      setPrescForm({ visit_date: '', prescription: '', treatment_notes: '', next_visit_date: '' })
      // 새로고침
      fetch(`/api/admin/patients/${id}`).then(r => r.json()).then(setPatient)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-muted">환자를 찾을 수 없습니다.</p>
        <button onClick={() => router.back()} className="mt-4 text-brand-600 text-sm font-medium">돌아가기</button>
      </div>
    )
  }

  const latestTreatment = patient.treatment_records[0] ?? null

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary text-sm">← 목록</button>
        <h1 className="text-2xl font-bold text-text-primary flex-1">{patient.name}</h1>
        <Link
          href={`/admin/patients/${id}/edit`}
          className="px-3 py-1.5 border border-bg-tertiary rounded-[--radius-sm] text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
        >
          정보 수정
        </Link>
      </div>

      {/* 기본 정보 */}
      <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-5">
        <h2 className="text-base font-semibold text-text-primary mb-4">기본 정보</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Info label="등록번호" value={patient.registration_number} />
          <Info label="생년월일" value={formatDate(patient.birth_date)} />
          <Info label="연락처" value={patient.phone ?? '-'} />
          <Info label="등록일" value={formatDate(patient.created_at)} />
        </div>
        {latestTreatment?.next_visit_date && (
          <div className="mt-4 pt-4 border-t border-bg-tertiary">
            <Info label="다음 방문 예정" value={formatDate(latestTreatment.next_visit_date)} />
          </div>
        )}
      </div>

      {/* 진단 정보 */}
      {patient.sleep_disorders.length > 0 && (
        <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-5">
          <h2 className="text-base font-semibold text-text-primary mb-4">수면장애 진단</h2>
          <div className="space-y-3">
            {patient.sleep_disorders.map(d => (
              <div key={d.id} className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-text-primary text-sm">{d.diagnosis}</p>
                  {d.notes && <p className="text-text-muted text-xs mt-0.5">{d.notes}</p>}
                </div>
                {d.severity && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_STYLE[d.severity] ?? 'bg-bg-tertiary text-text-muted'}`}>
                    {d.severity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 바로가기 */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/admin/patients/${id}/sleep`}
          className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-4 flex items-center gap-3 hover:shadow-[--shadow-card-hover] transition-shadow"
        >
          <span className="text-2xl">🌙</span>
          <div>
            <p className="font-medium text-text-primary text-sm">수면 데이터</p>
            <p className="text-xs text-text-muted">수면일지 조회 및 입력</p>
          </div>
        </Link>
        <Link
          href={`/admin/patients/${id}/exam`}
          className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-4 flex items-center gap-3 hover:shadow-[--shadow-card-hover] transition-shadow"
        >
          <span className="text-2xl">🔬</span>
          <div>
            <p className="font-medium text-text-primary text-sm">검사 결과</p>
            <p className="text-xs text-text-muted">HRV / InBody / QEEG</p>
          </div>
        </Link>
      </div>

      {/* 처방 내역 */}
      <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">처방 내역</h2>
          <button
            onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
            className="text-sm text-brand-600 font-medium hover:text-brand-700"
          >
            {showPrescriptionForm ? '취소' : '+ 처방 추가'}
          </button>
        </div>

        {showPrescriptionForm && (
          <form onSubmit={handleAddPrescription} className="mb-4 p-4 bg-bg-secondary rounded-[--radius-sm] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">방문일 *</label>
                <input
                  type="date"
                  required
                  value={prescForm.visit_date}
                  onChange={e => setPrescForm(p => ({ ...p, visit_date: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">다음 방문일</label>
                <input
                  type="date"
                  value={prescForm.next_visit_date}
                  onChange={e => setPrescForm(p => ({ ...p, next_visit_date: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">처방</label>
              <textarea
                rows={3}
                value={prescForm.prescription}
                onChange={e => setPrescForm(p => ({ ...p, prescription: e.target.value }))}
                placeholder="처방 내용을 입력하세요."
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">원장 코멘트</label>
              <textarea
                rows={2}
                value={prescForm.treatment_notes}
                onChange={e => setPrescForm(p => ({ ...p, treatment_notes: e.target.value }))}
                placeholder="환자에게 전달할 코멘트"
                className={`${inputCls} resize-none`}
              />
            </div>
            <button
              type="submit"
              disabled={prescSubmitting}
              className="w-full py-2 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {prescSubmitting ? '저장 중...' : '저장'}
            </button>
          </form>
        )}

        {patient.treatment_records.length === 0 ? (
          <p className="text-text-muted text-sm">처방 내역이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {patient.treatment_records.map((t, i) => (
              <div key={t.id} className={`${i > 0 ? 'border-t border-bg-tertiary pt-3' : ''}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-medium text-text-primary text-sm">{formatDate(t.visit_date)}</span>
                  {i === 0 && <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full">최근</span>}
                  {t.next_visit_date && (
                    <span className="text-xs text-text-muted ml-auto">다음: {formatDate(t.next_visit_date)}</span>
                  )}
                </div>
                {t.prescription && <p className="text-sm text-text-primary whitespace-pre-wrap">{t.prescription}</p>}
                {t.treatment_notes && (
                  <p className="text-xs text-text-muted mt-1 italic">{t.treatment_notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-[6px] border border-bg-tertiary bg-bg-primary text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-brand-400 text-sm'

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className="text-sm font-medium text-text-primary">{value}</p>
    </div>
  )
}
