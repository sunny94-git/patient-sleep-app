'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface ExamResult {
  id: string
  exam_date: string
  exam_type: string
  result_data: Record<string, string | number> | null
  summary: string | null
  created_at: string
}

interface ExamForm {
  exam_date: string
  exam_type: string
  summary: string
  result_data: string
}

const EXAM_TYPES = ['HRV', 'InBody', 'QEEG']

const EXAM_TEMPLATES: Record<string, Record<string, string | number>> = {
  HRV: { SDNN: 0, RMSSD: 0, LF: 0, HF: 0, LF_HF_ratio: 0, mean_HR: 0 },
  InBody: { weight_kg: 0, muscle_kg: 0, fat_kg: 0, fat_pct: 0, BMI: 0, InBody_score: 0 },
  QEEG: { delta_pct: 0, theta_pct: 0, alpha_pct: 0, beta_pct: 0, gamma_pct: 0 },
}

function formatDate(str: string) {
  return str.slice(0, 10).replace(/-/g, '.')
}

export default function AdminExamPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [exams, setExams] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('HRV')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ExamForm>({ exam_date: '', exam_type: 'HRV', summary: '', result_data: JSON.stringify(EXAM_TEMPLATES.HRV, null, 2) })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = () => {
    setLoading(true)
    fetch(`/api/admin/patients/${id}/exam`)
      .then(r => r.json())
      .then(d => { setExams(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [id])

  const setF = (k: keyof ExamForm, v: string) => {
    setForm(prev => {
      const next = { ...prev, [k]: v }
      if (k === 'exam_type' && !editingId) {
        next.result_data = JSON.stringify(EXAM_TEMPLATES[v] ?? {}, null, 2)
      }
      return next
    })
    if (k === 'result_data') setJsonError('')
  }

  const openNew = () => {
    setEditingId(null)
    setForm({ exam_date: '', exam_type: 'HRV', summary: '', result_data: JSON.stringify(EXAM_TEMPLATES.HRV, null, 2) })
    setError('')
    setJsonError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openEdit = (exam: ExamResult) => {
    setEditingId(exam.id)
    setForm({
      exam_date: exam.exam_date,
      exam_type: exam.exam_type,
      summary: exam.summary ?? '',
      result_data: JSON.stringify(exam.result_data ?? {}, null, 2),
    })
    setError('')
    setJsonError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setError('')
    setJsonError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    let parsedData: Record<string, string | number> | null = null
    try {
      parsedData = JSON.parse(form.result_data)
    } catch {
      setJsonError('JSON 형식이 올바르지 않습니다.')
      return
    }
    setSubmitting(true)
    const payload = {
      exam_date: form.exam_date,
      exam_type: form.exam_type,
      summary: form.summary || null,
      result_data: parsedData,
    }

    const res = editingId
      ? await fetch(`/api/admin/patients/${id}/exam/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/admin/patients/${id}/exam`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    setSubmitting(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? '오류가 발생했습니다.')
      return
    }
    setShowForm(false)
    setEditingId(null)
    fetchData()
  }

  const handleDelete = async (examId: string) => {
    if (!confirm('이 검사 결과를 삭제하시겠습니까?')) return
    setDeletingId(examId)
    await fetch(`/api/admin/patients/${id}/exam/${examId}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchData()
  }

  const filtered = exams.filter(e => e.exam_type === activeType)
  const isEditing = editingId !== null

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary text-sm">← 환자 정보</button>
        <h1 className="text-2xl font-bold text-text-primary flex-1">검사 결과 입력</h1>
        <button
          onClick={showForm ? handleCancel : openNew}
          className="px-4 py-2 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          {showForm ? '취소' : '+ 결과 입력'}
        </button>
      </div>

      {/* 입력/수정 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-5 mb-6 space-y-4">
          <h2 className="font-semibold text-text-primary">
            {isEditing ? '검사 결과 수정' : '검사 결과 입력'}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">검사 유형 *</label>
              <select value={form.exam_type} onChange={e => setF('exam_type', e.target.value)} className={inputCls}>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">검사 날짜 *</label>
              <input type="date" required value={form.exam_date} onChange={e => setF('exam_date', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="label">원장 코멘트</label>
            <textarea
              rows={2}
              value={form.summary}
              onChange={e => setF('summary', e.target.value)}
              placeholder="환자가 볼 수 있는 검사 해설 코멘트"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className="label">검사 결과 (JSON)</label>
            <textarea
              rows={8}
              value={form.result_data}
              onChange={e => setF('result_data', e.target.value)}
              className={`${inputCls} resize-y font-mono text-xs`}
            />
            {jsonError && <p className="text-danger text-xs mt-1">{jsonError}</p>}
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {submitting ? '저장 중...' : isEditing ? '수정 저장' : '저장'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 bg-bg-secondary text-text-secondary rounded-[--radius-sm] text-sm font-medium hover:bg-bg-tertiary transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 유형 탭 */}
      <div className="flex gap-1 bg-bg-tertiary rounded-[--radius-sm] p-1 mb-4 w-fit">
        {EXAM_TYPES.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-1.5 rounded-[6px] text-sm font-medium transition-colors ${
              activeType === t ? 'bg-bg-primary text-brand-600 shadow-[--shadow-card]' : 'text-text-muted'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-10 text-center">
          <p className="text-4xl mb-2">🔬</p>
          <p className="text-text-muted">{activeType} 검사 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(exam => (
            <div key={exam.id} className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-text-primary">{formatDate(exam.exam_date)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full">{exam.exam_type}</span>
                  <button
                    onClick={() => openEdit(exam)}
                    className="text-brand-500 hover:text-brand-700 text-xs font-medium px-2 py-1 rounded hover:bg-bg-secondary transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    disabled={deletingId === exam.id}
                    className="text-danger hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-bg-secondary transition-colors disabled:opacity-50"
                  >
                    {deletingId === exam.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              </div>
              {exam.result_data && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {Object.entries(exam.result_data).map(([k, v]) => (
                    <div key={k} className="bg-bg-secondary rounded-[6px] px-3 py-2">
                      <p className="text-xs text-text-muted">{k}</p>
                      <p className="text-sm font-semibold text-text-primary">{String(v)}</p>
                    </div>
                  ))}
                </div>
              )}
              {exam.summary && (
                <div className="pt-3 border-t border-bg-tertiary">
                  <p className="text-xs text-text-muted mb-0.5">원장 코멘트</p>
                  <p className="text-sm text-text-secondary">{exam.summary}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 rounded-[--radius-sm] border border-bg-tertiary bg-bg-secondary text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-brand-400 text-sm'
