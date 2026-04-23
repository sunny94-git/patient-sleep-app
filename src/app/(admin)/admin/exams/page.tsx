'use client'

import { useState, useEffect } from 'react'
import { Microscope, Save, Search, Plus, Trash2, CheckCircle2 } from 'lucide-react'

interface Patient {
  id: string
  name: string
  registration_number: string
}

type ExamType = 'hrv' | 'qeeg' | 'inbody'

const EXAM_DEFAULTS: Record<ExamType, { key: string; label: string; unit: string }[]> = {
  hrv: [
    { key: 'sdnn', label: 'SDNN', unit: 'ms' },
    { key: 'rmssd', label: 'RMSSD', unit: 'ms' },
    { key: 'lf_hf_ratio', label: 'LF/HF ratio', unit: '' },
    { key: 'total_power', label: 'Total Power', unit: '' },
    { key: 'pnn50', label: 'pNN50', unit: '%' },
  ],
  qeeg: [
    { key: 'delta', label: 'Delta', unit: '%' },
    { key: 'theta', label: 'Theta', unit: '%' },
    { key: 'alpha', label: 'Alpha', unit: '%' },
    { key: 'beta', label: 'Beta', unit: '%' },
    { key: 'gamma', label: 'Gamma', unit: '%' },
  ],
  inbody: [
    { key: 'weight', label: '체중', unit: 'kg' },
    { key: 'muscle', label: '골격근량', unit: 'kg' },
    { key: 'fat_mass', label: '체지방량', unit: 'kg' },
    { key: 'fat_percent', label: '체지방률', unit: '%' },
    { key: 'bmi', label: 'BMI', unit: '' },
    { key: 'bmr', label: '기초대사량', unit: 'kcal' },
  ],
}

const EXAM_LABELS: Record<ExamType, string> = {
  hrv: 'HRV',
  qeeg: 'QEEG',
  inbody: 'InBody',
}

export default function ExamsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [examType, setExamType] = useState<ExamType>('hrv')
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10))
  const [fields, setFields] = useState<{ key: string; label: string; unit: string; value: string }[]>([])
  const [summary, setSummary] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/patients-list')
      .then((r) => r.json())
      .then((d) => setPatients(d.patients ?? []))
  }, [])

  useEffect(() => {
    setFields(EXAM_DEFAULTS[examType].map((f) => ({ ...f, value: '' })))
  }, [examType])

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.registration_number.toLowerCase().includes(patientSearch.toLowerCase())
  )

  function updateField(key: string, value: string) {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)))
  }

  function addField() {
    setFields((prev) => [...prev, { key: `custom_${Date.now()}`, label: '', unit: '', value: '' }])
  }

  function removeField(key: string) {
    setFields((prev) => prev.filter((f) => f.key !== key))
  }

  async function handleSave() {
    if (!selectedPatient) return
    setSaving(true)
    setToast(null)

    const result_data: Record<string, string> = {}
    for (const f of fields) {
      if (f.value.trim()) result_data[f.key] = f.value.trim()
    }

    const res = await fetch('/api/admin/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: selectedPatient.id,
        exam_date: examDate,
        exam_type: examType,
        result_data,
        summary: summary || null,
      }),
    })

    if (res.ok) {
      setToast({ type: 'success', message: '검사 결과가 등록되었습니다.' })
      setFields(EXAM_DEFAULTS[examType].map((f) => ({ ...f, value: '' })))
      setSummary('')
    } else {
      const d = await res.json()
      setToast({ type: 'error', message: d.error ?? '저장 실패' })
    }
    setSaving(false)
  }

  const inputCls =
    'bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-brand-400 focus:bg-white'

  return (
    <div className="p-6 max-w-xl space-y-5">
      <div className="flex items-center gap-2">
        <Microscope size={20} className="text-brand-500" />
        <h1 className="text-xl font-bold text-gray-900">검사 결과 입력</h1>
      </div>

      {/* 환자 선택 */}
      <div className="bg-white rounded-xl p-5 shadow-card space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">환자 선택</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className={`w-full pl-8 pr-3 py-2 ${inputCls}`}
            placeholder="이름 또는 등록번호"
            value={patientSearch}
            onChange={(e) => {
              setPatientSearch(e.target.value)
              if (selectedPatient) setSelectedPatient(null)
            }}
          />
        </div>
        {patientSearch && !selectedPatient && filteredPatients.length > 0 && (
          <ul className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
            {filteredPatients.slice(0, 6).map((p) => (
              <li key={p.id}>
                <button
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    setSelectedPatient(p)
                    setPatientSearch(p.name)
                  }}
                >
                  <span className="font-medium text-gray-900">{p.name}</span>
                  <span className="text-gray-400 ml-2">#{p.registration_number}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {selectedPatient && (
          <div className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-blue-700">
              {selectedPatient.name} (#{selectedPatient.registration_number})
            </span>
            <button
              className="text-xs text-blue-400 hover:text-blue-600"
              onClick={() => { setSelectedPatient(null); setPatientSearch('') }}
            >
              변경
            </button>
          </div>
        )}
      </div>

      {/* 검사 유형 + 날짜 */}
      <div className="bg-white rounded-xl p-5 shadow-card space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-3">검사 유형</h2>
          <div className="flex gap-3">
            {(Object.keys(EXAM_LABELS) as ExamType[]).map((t) => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="examType"
                  value={t}
                  checked={examType === t}
                  onChange={() => setExamType(t)}
                  className="accent-brand-500"
                />
                <span className="text-sm text-gray-700">{EXAM_LABELS[t]}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">검사 날짜</label>
          <input
            type="date"
            className={inputCls}
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </div>
      </div>

      {/* 검사 항목 */}
      {selectedPatient && (
        <>
          <div className="bg-white rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                📊 {EXAM_LABELS[examType]} 항목별 수치
              </h2>
              <button
                onClick={addField}
                className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600"
              >
                <Plus size={13} /> 항목 추가
              </button>
            </div>
            {fields.map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                {f.label === '' ? (
                  <input
                    className={`flex-1 ${inputCls}`}
                    placeholder="항목명"
                    value={f.label}
                    onChange={(e) =>
                      setFields((prev) =>
                        prev.map((p) => (p.key === f.key ? { ...p, label: e.target.value } : p))
                      )
                    }
                  />
                ) : (
                  <label className="flex-1 text-sm text-gray-700">
                    {f.label}
                    {f.unit && <span className="text-gray-400 ml-1">({f.unit})</span>}
                  </label>
                )}
                <input
                  className={`w-24 text-right ${inputCls}`}
                  placeholder="수치"
                  value={f.value}
                  onChange={(e) => updateField(f.key, e.target.value)}
                />
                {f.key.startsWith('custom_') && (
                  <button
                    onClick={() => removeField(f.key)}
                    className="text-gray-300 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-card">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              📝 원장 코멘트
            </label>
            <textarea
              className={`w-full ${inputCls} resize-none`}
              rows={3}
              placeholder="검사 해석 메모"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          {toast && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                toast.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <CheckCircle2 size={15} />
              {toast.message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
