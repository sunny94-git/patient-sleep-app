'use client'

import { useState } from 'react'
import { Save, Plus, Trash2, ChevronDown, ChevronUp, Check, X } from 'lucide-react'
import { calcSleepEfficiency } from '@/types'

/* ─── Types ─── */
interface Patient {
  id: string
  registration_number: string
  name: string
  birth_date: string | null
  phone: string | null
}

interface Diary {
  id: string
  patient_id: string
  diary_date: string
  bedtime: string | null
  wake_time: string | null
  sleep_onset_latency: string | null
  night_awakening_count: string | null
  sleep_quality: number | null
  condition: number | null
  memo: string | null
  admin_note: string | null
  nap_taken: boolean
  alcohol: boolean
  herbal_morning: boolean | null
  herbal_lunch: boolean | null
  herbal_evening: boolean | null
  herbal_bedtime: boolean | null
  western_morning: boolean | null
  western_lunch: boolean | null
  western_evening: boolean | null
  western_bedtime: boolean | null
  total_sleep_min: number | null
}

interface Treatment {
  id: string
  patient_id: string
  visit_date: string | null
  prescription: string | null
  treatment_notes: string | null
  next_visit_date: string | null
}

interface Exam {
  id: string
  patient_id: string
  exam_date: string
  exam_type: 'HRV' | 'InBody' | 'QEEG'
  summary: string | null
  result_data: Record<string, unknown> | null
}

interface QnA {
  id: string
  patient_id: string
  question: string
  answer: string | null
  is_answered: boolean
  created_at: string
}

interface Props {
  patient: Patient
  diaries: Diary[]
  treatments: Treatment[]
  exams: Exam[]
  qnaList: QnA[]
}

/* ─── Helpers ─── */
function calcDur(bedtime: string | null, wake_time: string | null): string {
  if (!bedtime || !wake_time) return '—'
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wake_time.split(':').map(Number)
  let mins = (wh * 60 + wm) - (bh * 60 + bm)
  if (mins <= 0) mins += 24 * 60
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

/* ─── Small shared components ─── */
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-28 shrink-0 text-gray-400">{label}</span>
      <span className="text-gray-800">{value ?? '—'}</span>
    </div>
  )
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-sm text-gray-400 text-center py-10">{msg}</p>
}

function Field({
  label, value, onChange, type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  )
}

function TextAreaField({
  label, value, onChange, rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
      />
    </div>
  )
}

/* ─── MedCheck chip grid ─── */
function MedCheck({ diary }: { diary: Diary }) {
  const meds = [
    { label: '한약 아침', val: diary.herbal_morning },
    { label: '한약 점심', val: diary.herbal_lunch },
    { label: '한약 저녁', val: diary.herbal_evening },
    { label: '한약 취침', val: diary.herbal_bedtime },
    { label: '양약 아침', val: diary.western_morning },
    { label: '양약 점심', val: diary.western_lunch },
    { label: '양약 저녁', val: diary.western_evening },
    { label: '양약 취침', val: diary.western_bedtime },
  ]
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {meds.map((m) => (
        <span
          key={m.label}
          className={`text-xs px-2 py-0.5 rounded-full border ${
            m.val ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'
          }`}
        >
          {m.label}
        </span>
      ))}
    </div>
  )
}

/* ─── Tab: 기본정보 ─── */
function InfoTab({ patient }: { patient: Patient }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: patient.name,
    birth_date: patient.birth_date ?? '',
    phone: patient.phone ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/admin/patients/${patient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">환자 정보</h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs text-brand-600 hover:text-brand-700 font-medium">수정</button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <Field label="이름" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
          <Field label="생년월일" value={form.birth_date} onChange={(v) => setForm((p) => ({ ...p, birth_date: v }))} type="date" />
          <Field label="전화번호" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} type="tel" />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="flex-1 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">취소</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50">
              <Save size={14} />
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Row label="등록번호" value={patient.registration_number} />
          <Row label="이름" value={patient.name} />
          <Row label="생년월일" value={patient.birth_date} />
          <Row label="전화번호" value={patient.phone} />
        </div>
      )}
    </div>
  )
}

/* ─── Tab: 수면일지 ─── */
function DiaryTab({ patientId, initialDiaries }: { patientId: string; initialDiaries: Diary[] }) {
  const [diaries, setDiaries] = useState(initialDiaries)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [noteEditing, setNoteEditing] = useState<string | null>(null)
  const [noteVal, setNoteVal] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  async function saveNote(id: string) {
    setSavingNote(true)
    const res = await fetch(`/api/admin/diary/${id}/note`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_note: noteVal }),
    })
    if (res.ok) {
      setDiaries((prev) => prev.map((d) => d.id === id ? { ...d, admin_note: noteVal } : d))
      setNoteEditing(null)
    }
    setSavingNote(false)
  }

  if (diaries.length === 0) return <Empty msg="수면일지 기록이 없습니다." />

  return (
    <div className="space-y-2">
      {diaries.map((d) => {
        const eff = calcSleepEfficiency(d)
        const effColor = eff === null ? 'text-gray-400' : eff >= 85 ? 'text-green-600' : eff >= 70 ? 'text-yellow-600' : 'text-red-500'
        const isOpen = expanded === d.id

        return (
          <div key={d.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : d.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-800">{d.diary_date}</span>
                <span className="text-xs text-gray-500">{d.bedtime ?? '—'} → {d.wake_time ?? '—'}</span>
                <span className="text-xs text-gray-500">{calcDur(d.bedtime, d.wake_time)}</span>
                {eff !== null && <span className={`text-xs font-medium ${effColor}`}>효율 {eff}%</span>}
              </div>
              {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
                  <Row label="잠들기까지" value={d.sleep_onset_latency} />
                  <Row label="야간 각성" value={d.night_awakening_count} />
                  <Row label="수면 만족도" value={d.sleep_quality != null ? `${d.sleep_quality}점` : null} />
                  <Row label="컨디션" value={d.condition != null ? `${d.condition}점` : null} />
                  <Row label="낮잠" value={d.nap_taken ? '있음' : '없음'} />
                  <Row label="음주" value={d.alcohol ? '있음' : '없음'} />
                  {d.total_sleep_min != null && <Row label="총 수면" value={`${Math.floor(d.total_sleep_min / 60)}h ${d.total_sleep_min % 60}m`} />}
                </div>

                {d.memo && <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-2">{d.memo}</p>}

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">복약 체크</p>
                  <MedCheck diary={d} />
                </div>

                <div className="border-t border-gray-100 pt-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">관리자 메모</p>
                  {noteEditing === d.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={noteVal}
                        onChange={(e) => setNoteVal(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setNoteEditing(null)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"><X size={12} />취소</button>
                        <button onClick={() => saveNote(d.id)} disabled={savingNote} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"><Check size={12} />{savingNote ? '저장 중...' : '저장'}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs text-gray-600">{d.admin_note || <span className="text-gray-400">없음</span>}</p>
                      <button onClick={() => { setNoteEditing(d.id); setNoteVal(d.admin_note ?? '') }} className="text-xs text-brand-600 hover:text-brand-700 shrink-0">수정</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Tab: 처방 ─── */
function TreatmentTab({ patientId, initialTreatments }: { patientId: string; initialTreatments: Treatment[] }) {
  const [treatments, setTreatments] = useState(initialTreatments)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ visit_date: '', prescription: '', treatment_notes: '', next_visit_date: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleAdd() {
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/admin/patients/${patientId}/treatment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    setTreatments((prev) => [data.record, ...prev])
    setForm({ visit_date: '', prescription: '', treatment_notes: '', next_visit_date: '' })
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/treatment/${id}`, { method: 'DELETE' })
    if (res.ok) setTreatments((prev) => prev.filter((t) => t.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
          <Plus size={16} />{showForm ? '취소' : '처방 추가'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
          <Field label="방문일" value={form.visit_date} onChange={(v) => setForm((p) => ({ ...p, visit_date: v }))} type="date" />
          <TextAreaField label="처방 내용" value={form.prescription} onChange={(v) => setForm((p) => ({ ...p, prescription: v }))} />
          <TextAreaField label="진료 메모" value={form.treatment_notes} onChange={(v) => setForm((p) => ({ ...p, treatment_notes: v }))} />
          <Field label="다음 방문일" value={form.next_visit_date} onChange={(v) => setForm((p) => ({ ...p, next_visit_date: v }))} type="date" />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button onClick={handleAdd} disabled={saving}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50">
            <Save size={14} />{saving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}

      {treatments.length === 0
        ? <Empty msg="처방 기록이 없습니다." />
        : treatments.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl shadow-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">{t.visit_date ?? '—'}</span>
              <div className="flex items-center gap-3">
                {t.next_visit_date && <span className="text-xs text-gray-400">다음: {t.next_visit_date}</span>}
                <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id}
                  className="text-red-400 hover:text-red-500 disabled:opacity-40">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {t.prescription && <p className="text-sm text-gray-700 whitespace-pre-wrap">{t.prescription}</p>}
            {t.treatment_notes && <p className="text-xs text-gray-500 border-t border-gray-100 pt-2 whitespace-pre-wrap">{t.treatment_notes}</p>}
          </div>
        ))
      }
    </div>
  )
}

/* ─── Tab: 검사결과 ─── */
function ExamTab({ patientId, initialExams }: { patientId: string; initialExams: Exam[] }) {
  const [exams, setExams] = useState(initialExams)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ exam_date: '', exam_type: 'HRV' as 'HRV' | 'InBody' | 'QEEG', summary: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleAdd() {
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/admin/patients/${patientId}/exam`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    setExams((prev) => [data.record, ...prev])
    setForm({ exam_date: '', exam_type: 'HRV', summary: '' })
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/exam/${id}`, { method: 'DELETE' })
    if (res.ok) setExams((prev) => prev.filter((e) => e.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
          <Plus size={16} />{showForm ? '취소' : '검사 추가'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
          <Field label="검사일" value={form.exam_date} onChange={(v) => setForm((p) => ({ ...p, exam_date: v }))} type="date" />
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">검사 종류</label>
            <div className="flex gap-2">
              {(['HRV', 'InBody', 'QEEG'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setForm((p) => ({ ...p, exam_type: t }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${form.exam_type === t ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <TextAreaField label="요약" value={form.summary} onChange={(v) => setForm((p) => ({ ...p, summary: v }))} />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button onClick={handleAdd} disabled={saving}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50">
            <Save size={14} />{saving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}

      {exams.length === 0
        ? <Empty msg="검사 기록이 없습니다." />
        : exams.map((e) => (
          <div key={e.id} className="bg-white rounded-2xl shadow-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">{e.exam_type}</span>
                <span className="text-sm font-semibold text-gray-900">{e.exam_date}</span>
              </div>
              <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id}
                className="text-red-400 hover:text-red-500 disabled:opacity-40">
                <Trash2 size={14} />
              </button>
            </div>
            {e.summary && <p className="text-sm text-gray-700">{e.summary}</p>}
            {e.result_data && Object.keys(e.result_data).length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {Object.entries(e.result_data).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-800">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      }
    </div>
  )
}

/* ─── Tab: Q&A ─── */
function QnAItem({ item, onAnswered }: { item: QnA; onAnswered: (updated: QnA) => void }) {
  const [open, setOpen] = useState(false)
  const [answer, setAnswer] = useState(item.answer ?? '')
  const [saving, setSaving] = useState(false)

  async function handleAnswer() {
    setSaving(true)
    const res = await fetch(`/api/admin/qna/${item.id}/answer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    })
    const data = await res.json()
    if (res.ok) onAnswered(data.record)
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between px-4 py-3 text-left">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.is_answered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {item.is_answered ? '답변 완료' : '답변 대기'}
            </span>
            <span className="text-xs text-gray-400">{item.created_at.slice(0, 10)}</span>
          </div>
          <p className="text-sm text-gray-800 truncate">{item.question}</p>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" /> : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          <p className="text-sm text-gray-700">{item.question}</p>
          <TextAreaField label="답변" value={answer} onChange={setAnswer} rows={3} />
          <button onClick={handleAnswer} disabled={saving || !answer.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-xl hover:bg-brand-600 disabled:opacity-50">
            <Check size={14} />{saving ? '저장 중...' : '답변 저장'}
          </button>
        </div>
      )}
    </div>
  )
}

function QnATab({ patientId, initialQnaList }: { patientId: string; initialQnaList: QnA[] }) {
  const [list, setList] = useState(initialQnaList)

  function handleAnswered(updated: QnA) {
    setList((prev) => prev.map((q) => q.id === updated.id ? updated : q))
  }

  if (list.length === 0) return <Empty msg="문의 내역이 없습니다." />

  return (
    <div className="space-y-2">
      {list.map((item) => (
        <QnAItem key={item.id} item={item} onAnswered={handleAnswered} />
      ))}
    </div>
  )
}

/* ─── Main component ─── */
const TABS = [
  { key: 'info', label: '기본정보' },
  { key: 'diary', label: '수면일지' },
  { key: 'treatment', label: '처방' },
  { key: 'exam', label: '검사결과' },
  { key: 'qna', label: 'Q&A' },
] as const

type TabKey = typeof TABS[number]['key']

export default function PatientDetailClient({ patient, diaries, treatments, exams, qnaList }: Props) {
  const [tab, setTab] = useState<TabKey>('info')

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-brand-500 px-5 pt-10 pb-6 text-white">
        <h1 className="text-xl font-bold">{patient.name}</h1>
        <p className="text-sm text-blue-200 mt-1">{patient.registration_number}</p>
      </div>

      <div className="px-5 pt-4">
        {/* Tab bar */}
        <div className="flex bg-gray-200 rounded-xl p-1 mb-4">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${tab === key ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'info' && <InfoTab patient={patient} />}
        {tab === 'diary' && <DiaryTab patientId={patient.id} initialDiaries={diaries} />}
        {tab === 'treatment' && <TreatmentTab patientId={patient.id} initialTreatments={treatments} />}
        {tab === 'exam' && <ExamTab patientId={patient.id} initialExams={exams} />}
        {tab === 'qna' && <QnATab patientId={patient.id} initialQnaList={qnaList} />}
      </div>
    </div>
  )
}
