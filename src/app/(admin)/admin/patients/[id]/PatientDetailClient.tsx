'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronDown, ChevronUp, Save, Plus, Trash2, Pencil, X, Check } from 'lucide-react'

interface Patient {
  id: string
  registration_number: string
  name: string
  birth_date: string | null
  phone: string | null
}

interface Diary {
  id: string
  diary_date: string
  bedtime: string | null
  wake_time: string | null
  sleep_onset_latency: string | null
  night_awakening_count: string | null
  sleep_quality: number | null
  morning_fatigue: number | null
  daytime_sleepiness: string | null
  nap_taken: boolean
  nap_duration_min: number | null
  dream: string | null
  caffeine: string | null
  alcohol: boolean
  condition: number | null
  memo: string | null
  admin_note: string | null
  herbal_morning: boolean | null
  herbal_lunch: boolean | null
  herbal_evening: boolean | null
  herbal_bedtime: boolean | null
  western_morning: boolean | null
  western_lunch: boolean | null
  western_evening: boolean | null
  western_bedtime: boolean | null
}

interface Treatment {
  id: string
  visit_date: string
  prescription: string | null
  treatment_notes: string | null
  next_visit_date: string | null
}

interface Exam {
  id: string
  exam_date: string
  exam_type: string
  summary: string | null
  result_data: Record<string, unknown> | null
}

interface QnA {
  id: string
  question: string
  answer: string | null
  is_answered: boolean
  created_at: string
  answered_at: string | null
}

interface Props {
  patient: Patient
  diaries: Diary[]
  treatments: Treatment[]
  exams: Exam[]
  qnaList: QnA[]
}

const TABS = [
  { key: 'info', label: '기본정보' },
  { key: 'diary', label: '수면일지' },
  { key: 'treatment', label: '처방' },
  { key: 'exam', label: '검사결과' },
  { key: 'qna', label: 'Q&A' },
] as const
type TabKey = typeof TABS[number]['key']

export default function PatientDetailClient({ patient, diaries, treatments, exams, qnaList }: Props) {
  const [tab, setTab] = useState<TabKey>('diary')

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/patients" className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
          <ChevronLeft size={22} />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900">{patient.name}</h1>
          <p className="text-xs text-gray-400">#{patient.registration_number}{patient.birth_date && ` · ${patient.birth_date}`}{patient.phone && ` · ${patient.phone}`}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === key ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'info'      && <InfoTab patient={patient} />}
      {tab === 'diary'     && <DiaryTab patientId={patient.id} initialDiaries={diaries} />}
      {tab === 'treatment' && <TreatmentTab patientId={patient.id} initialTreatments={treatments} />}
      {tab === 'exam'      && <ExamTab patientId={patient.id} initialExams={exams} />}
      {tab === 'qna'       && <QnATab initialQnaList={qnaList} />}
    </div>
  )
}

// ─── 기본 정보 탭 ───────────────────────────────────────────────────────────

const SEVERITY_OPTIONS = ['경미', '중등도', '심각']
const DIAGNOSIS_OPTIONS = ['불면증', '수면무호흡증', '기면병', '하지불안증후군', '렘수면행동장애', '기타']

function InfoTab({ patient }: { patient: Patient }) {
  const [form, setForm] = useState({
    name: patient.name,
    birth_date: patient.birth_date ?? '',
    phone: patient.phone ?? '',
    diagnosis: '',
    severity: '중등도',
    onset_date: '',
    notes: '',
  })
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 진단 정보 로딩
  useState(() => {
    fetch(`/api/admin/patients/${patient.id}`)
      .then(r => r.json())
      .then(({ disorder }) => {
        if (disorder) {
          setForm(prev => ({
            ...prev,
            diagnosis: disorder.diagnosis ?? '',
            severity: disorder.severity ?? '중등도',
            onset_date: disorder.onset_date ?? '',
            notes: disorder.notes ?? '',
          }))
        }
        setLoaded(true)
      })
  })

  function set(key: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('이름은 필수입니다.'); return }
    setSaving(true); setError(null); setSuccess(false)
    try {
      const res = await fetch(`/api/admin/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally { setSaving(false) }
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <div className="space-y-4">
      {/* 기본 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">기본 정보</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1 block">등록번호</label>
            <input value={patient.registration_number} disabled
              className="w-full rounded-lg border border-gray-100 bg-gray-100 px-3 py-2 text-sm text-gray-400 cursor-not-allowed" />
          </div>
          <Field label="이름 *" value={form.name} onChange={v => set('name', v)} />
          <Field label="생년월일" type="date" value={form.birth_date} onChange={v => set('birth_date', v)} />
          <div className="col-span-2">
            <Field label="연락처" value={form.phone} onChange={v => set('phone', v)} placeholder="010-0000-0000" />
          </div>
        </div>
      </div>

      {/* 진단 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800">진단 정보</h3>
        {!loaded ? (
          <p className="text-xs text-gray-400">불러오는 중...</p>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">진단명</label>
              <select value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)}
                className={inputCls}>
                <option value="">선택하세요</option>
                {DIAGNOSIS_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">중증도</label>
                <select value={form.severity} onChange={e => set('severity', e.target.value)} className={inputCls}>
                  {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Field label="발병일" type="date" value={form.onset_date} onChange={v => set('onset_date', v)} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">메모</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-green-600">저장되었습니다.</p>}

      <button onClick={handleSave} disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl transition-colors disabled:opacity-50">
        <Save size={15} />
        {saving ? '저장 중...' : '변경사항 저장'}
      </button>
    </div>
  )
}

// ─── 수면일지 탭 ────────────────────────────────────────────────────────────

function DiaryTab({ patientId, initialDiaries }: { patientId: string; initialDiaries: Diary[] }) {
  const [diaries, setDiaries] = useState(initialDiaries)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    initialDiaries.forEach(d => { m[d.id] = d.admin_note ?? '' })
    return m
  })
  const [saving, setSaving] = useState<string | null>(null)

  async function saveNote(diaryId: string) {
    setSaving(diaryId)
    try {
      await fetch(`/api/admin/diary/${diaryId}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_note: notes[diaryId] }),
      })
      setDiaries(prev => prev.map(d => d.id === diaryId ? { ...d, admin_note: notes[diaryId] } : d))
    } finally {
      setSaving(null)
    }
  }

  if (diaries.length === 0) {
    return <Empty>수면 일지 기록이 없습니다.</Empty>
  }

  return (
    <div className="space-y-2">
      {diaries.map((d) => {
        const isOpen = expanded === d.id
        const dur = calcDur(d.bedtime, d.wake_time)
        return (
          <div key={d.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              onClick={() => setExpanded(isOpen ? null : d.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{d.diary_date}</span>
                {dur && <span className="text-xs text-gray-500">{dur}</span>}
                {d.sleep_quality && (
                  <span className="text-xs text-yellow-500">{'★'.repeat(d.sleep_quality)}{'☆'.repeat(5 - d.sleep_quality)}</span>
                )}
                {d.admin_note && <span className="text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded">메모</span>}
              </div>
              {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {isOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 pt-3">
                  <Row label="취침" value={d.bedtime} />
                  <Row label="기상" value={d.wake_time} />
                  <Row label="잠들기까지" value={d.sleep_onset_latency} />
                  <Row label="야간 각성" value={d.night_awakening_count} />
                  <Row label="수면 만족도" value={d.sleep_quality ? `${d.sleep_quality}점` : null} />
                  <Row label="기상 피로도" value={d.morning_fatigue ? `${d.morning_fatigue}점` : null} />
                  <Row label="낮 졸림" value={d.daytime_sleepiness} />
                  <Row label="낮잠" value={d.nap_taken ? `${d.nap_duration_min ?? '?'}분` : '없음'} />
                  <Row label="꿈" value={d.dream} />
                  <Row label="카페인" value={d.caffeine} />
                  <Row label="음주" value={d.alcohol ? '예' : '없음'} />
                  <Row label="컨디션" value={d.condition ? `${d.condition}점` : null} />
                </div>
                {d.memo && (
                  <div className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium text-gray-700">환자 메모: </span>{d.memo}
                  </div>
                )}
                {/* 복약 체크 */}
                <MedCheck label="한약" data={d} prefix="herbal" />
                <MedCheck label="양약" data={d} prefix="western" />

                {/* 관리자 메모 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">관리자 메모</label>
                  <textarea
                    value={notes[d.id] ?? ''}
                    onChange={e => setNotes(prev => ({ ...prev, [d.id]: e.target.value }))}
                    rows={3}
                    placeholder="의료진 메모 (환자에게 보이지 않습니다)"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                  <button
                    onClick={() => saveNote(d.id)}
                    disabled={saving === d.id}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
                  >
                    <Save size={13} />
                    {saving === d.id ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function MedCheck({ label, data, prefix }: { label: string; data: Diary; prefix: 'herbal' | 'western' }) {
  const timings = ['morning', 'lunch', 'evening', 'bedtime'] as const
  const labels = { morning: '아침', lunch: '점심', evening: '저녁', bedtime: '취침전' }
  const checked = timings.filter(t => data[`${prefix}_${t}` as keyof Diary])
  if (checked.length === 0) return null
  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span className="font-medium text-gray-700">💊 {label}:</span>
      {checked.map(t => <span key={t} className="bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded">{labels[t]}</span>)}
    </div>
  )
}

// ─── 처방 탭 ────────────────────────────────────────────────────────────────

const EMPTY_TREATMENT = { visit_date: '', prescription: '', treatment_notes: '', next_visit_date: '' }

function TreatmentTab({ patientId, initialTreatments }: { patientId: string; initialTreatments: Treatment[] }) {
  const [items, setItems] = useState(initialTreatments)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_TREATMENT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd() {
    if (!form.visit_date) { setError('진료일을 입력해주세요.'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/admin/patients/${patientId}/treatment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setItems(prev => [data.record, ...prev])
      setForm(EMPTY_TREATMENT); setShowForm(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally { setLoading(false) }
  }

  async function handleEdit(id: string) {
    if (!form.visit_date) { setError('진료일을 입력해주세요.'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/admin/treatment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setItems(prev => prev.map(t => t.id === id ? { ...t, ...form } : t))
      setEditing(null); setForm(EMPTY_TREATMENT)
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('처방을 삭제하시겠습니까?')) return
    await fetch(`/api/admin/treatment/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(t => t.id !== id))
  }

  const formUI = (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="진료일 *" type="date" value={form.visit_date} onChange={v => setForm(p => ({ ...p, visit_date: v }))} />
        <Field label="다음 진료일" type="date" value={form.next_visit_date} onChange={v => setForm(p => ({ ...p, next_visit_date: v }))} />
      </div>
      <TextAreaField label="처방 내용" value={form.prescription} onChange={v => setForm(p => ({ ...p, prescription: v }))} />
      <TextAreaField label="진료 메모" value={form.treatment_notes} onChange={v => setForm(p => ({ ...p, treatment_notes: v }))} />
      <div className="flex gap-2 pt-1">
        <button onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY_TREATMENT); setError(null) }}
          className="btn-secondary flex-1 text-sm py-2">취소</button>
        <button onClick={() => editing ? handleEdit(editing) : handleAdd()}
          disabled={loading}
          className="btn-primary flex-1 text-sm py-2">
          {loading ? '저장 중...' : editing ? '수정 완료' : '추가'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      {!showForm && !editing && (
        <button onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-brand-600 border border-dashed border-brand-300 rounded-xl hover:bg-brand-50 transition-colors">
          <Plus size={16} /> 새 처방 추가
        </button>
      )}
      {showForm && formUI}
      {items.length === 0 && !showForm && <Empty>처방 기록이 없습니다.</Empty>}
      {items.map(t => (
        <div key={t.id}>
          {editing === t.id ? formUI : (
            <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-gray-900">{t.visit_date}</span>
                  {t.next_visit_date && <span className="text-xs text-gray-400 ml-2">→ 다음: {t.next_visit_date}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(t.id); setForm({ visit_date: t.visit_date, prescription: t.prescription ?? '', treatment_notes: t.treatment_notes ?? '', next_visit_date: t.next_visit_date ?? '' }); setShowForm(false) }}
                    className="p-1.5 text-gray-400 hover:text-brand-600 rounded">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {t.prescription && <p className="text-xs text-gray-700 whitespace-pre-wrap">{t.prescription}</p>}
              {t.treatment_notes && <p className="text-xs text-gray-500 whitespace-pre-wrap border-t border-gray-100 pt-2">{t.treatment_notes}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── 검사결과 탭 ────────────────────────────────────────────────────────────

const EXAM_TYPES = ['HRV', 'InBody', 'QEEG'] as const
const EMPTY_EXAM = { exam_date: '', exam_type: 'HRV', summary: '', result_data_str: '' }

function ExamTab({ patientId, initialExams }: { patientId: string; initialExams: Exam[] }) {
  const [exams, setExams] = useState(initialExams)
  const [activeType, setActiveType] = useState<string>('HRV')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_EXAM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = exams.filter(e => e.exam_type === activeType)

  async function handleAdd() {
    if (!form.exam_date) { setError('검사일을 입력해주세요.'); return }
    let result_data = null
    if (form.result_data_str.trim()) {
      try { result_data = JSON.parse(form.result_data_str) }
      catch { setError('결과 데이터가 올바른 JSON 형식이 아닙니다.'); return }
    }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/admin/patients/${patientId}/exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_date: form.exam_date, exam_type: form.exam_type, summary: form.summary, result_data }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setExams(prev => [data.record, ...prev].sort((a, b) => b.exam_date.localeCompare(a.exam_date)))
      setForm(EMPTY_EXAM); setShowForm(false); setActiveType(form.exam_type)
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('검사 결과를 삭제하시겠습니까?')) return
    await fetch(`/api/admin/exam/${id}`, { method: 'DELETE' })
    setExams(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="space-y-3">
      {/* Type tabs */}
      <div className="flex gap-2">
        {EXAM_TYPES.map(t => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeType === t ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {!showForm && (
        <button onClick={() => { setShowForm(true); setForm({ ...EMPTY_EXAM, exam_type: activeType }) }}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-brand-600 border border-dashed border-brand-300 rounded-xl hover:bg-brand-50 transition-colors">
          <Plus size={16} /> {activeType} 결과 추가
        </button>
      )}

      {showForm && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="검사일 *" type="date" value={form.exam_date} onChange={v => setForm(p => ({ ...p, exam_date: v }))} />
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">검사 종류</label>
              <select value={form.exam_type} onChange={e => setForm(p => ({ ...p, exam_type: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <TextAreaField label="요약" value={form.summary} onChange={v => setForm(p => ({ ...p, summary: v }))} placeholder="검사 결과 요약 (선택)" />
          <TextAreaField label="결과 데이터 (JSON)" value={form.result_data_str} onChange={v => setForm(p => ({ ...p, result_data_str: v }))} placeholder={'{"항목": "값", ...} (선택)'} rows={4} />
          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); setError(null) }} className="btn-secondary flex-1 text-sm py-2">취소</button>
            <button onClick={handleAdd} disabled={loading} className="btn-primary flex-1 text-sm py-2">{loading ? '저장 중...' : '추가'}</button>
          </div>
        </div>
      )}

      {filtered.length === 0 && !showForm && <Empty>{activeType} 검사 기록이 없습니다.</Empty>}
      {filtered.map(e => (
        <div key={e.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">{e.exam_date}</span>
            <button onClick={() => handleDelete(e.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
              <Trash2 size={14} />
            </button>
          </div>
          {e.summary && <p className="text-xs text-gray-700">{e.summary}</p>}
          {e.result_data && (
            <div className="bg-gray-50 rounded-lg p-2 space-y-1">
              {Object.entries(e.result_data).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-800">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Q&A 탭 ────────────────────────────────────────────────────────────────

function QnATab({ initialQnaList }: { initialQnaList: QnA[] }) {
  const [items, setItems] = useState(initialQnaList)
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {}
    initialQnaList.forEach(q => { m[q.id] = q.answer ?? '' })
    return m
  })
  const [saving, setSaving] = useState<string | null>(null)

  async function handleAnswer(id: string) {
    if (!answers[id]?.trim()) return
    setSaving(id)
    try {
      const res = await fetch(`/api/admin/qna/${id}/answer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answers[id] }),
      })
      if (res.ok) {
        setItems(prev => prev.map(q => q.id === id ? { ...q, is_answered: true, answer: answers[id], answered_at: new Date().toISOString() } : q))
      }
    } finally { setSaving(null) }
  }

  if (items.length === 0) return <Empty>문의 내역이 없습니다.</Empty>

  const unanswered = items.filter(q => !q.is_answered)
  const answered = items.filter(q => q.is_answered)

  return (
    <div className="space-y-3">
      {unanswered.length > 0 && (
        <>
          <p className="text-xs font-semibold text-red-500">미답변 ({unanswered.length}건)</p>
          {unanswered.map(q => (
            <QnAItem key={q.id} q={q} answer={answers[q.id] ?? ''} saving={saving === q.id}
              onChange={v => setAnswers(p => ({ ...p, [q.id]: v }))}
              onSave={() => handleAnswer(q.id)} />
          ))}
        </>
      )}
      {answered.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-400 mt-2">답변 완료 ({answered.length}건)</p>
          {answered.map(q => (
            <QnAItem key={q.id} q={q} answer={answers[q.id] ?? ''} saving={saving === q.id}
              onChange={v => setAnswers(p => ({ ...p, [q.id]: v }))}
              onSave={() => handleAnswer(q.id)} />
          ))}
        </>
      )}
    </div>
  )
}

function QnAItem({ q, answer, saving, onChange, onSave }: {
  q: QnA; answer: string; saving: boolean
  onChange: (v: string) => void; onSave: () => void
}) {
  const [editing, setEditing] = useState(!q.is_answered)

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-gray-800 flex-1">{q.question}</p>
        <span className="text-xs text-gray-400 shrink-0">{q.created_at.slice(0, 10)}</span>
      </div>
      {q.is_answered && !editing ? (
        <div className="bg-brand-50 rounded-lg px-3 py-2 flex items-start justify-between gap-2">
          <p className="text-xs text-brand-800 flex-1 whitespace-pre-wrap">{q.answer}</p>
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-brand-600 shrink-0">
            <Pencil size={13} />
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <textarea
            value={answer}
            onChange={e => onChange(e.target.value)}
            rows={3}
            placeholder="답변을 입력하세요"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <div className="flex gap-2">
            {q.is_answered && (
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                <X size={12} /> 취소
              </button>
            )}
            <button onClick={onSave} disabled={saving || !answer.trim()}
              className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-40">
              <Check size={13} /> {saving ? '저장 중...' : q.is_answered ? '수정' : '답변 등록'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 공통 유틸 ──────────────────────────────────────────────────────────────

function calcDur(bedtime: string | null, wake_time: string | null): string | null {
  if (!bedtime || !wake_time) return null
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = wake_time.split(':').map(Number)
  let min = wh * 60 + wm - (bh * 60 + bm)
  if (min <= 0) min += 24 * 60
  return `${Math.floor(min / 60)}h ${min % 60}m`
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="flex gap-1">
      <span className="text-gray-400 shrink-0">{label}:</span>
      <span className="text-gray-700">{value}</span>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-10 text-center text-sm text-gray-400">
      {children}
    </div>
  )
}

function Field({ label, type = 'text', value, onChange }: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[38px]" />
    </div>
  )
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
    </div>
  )
}
