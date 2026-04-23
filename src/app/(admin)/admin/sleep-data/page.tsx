'use client'

import { useState, useEffect } from 'react'
import { BedDouble, Save, Search, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Patient {
  id: string
  name: string
  registration_number: string
}

function toMin(h: string, m: string): number | null {
  const hours = parseInt(h) || 0
  const mins = parseInt(m) || 0
  if (h === '' && m === '') return null
  return hours * 60 + mins
}

function fromMin(total: number | null): { h: string; m: string } {
  if (total === null) return { h: '', m: '' }
  return { h: String(Math.floor(total / 60)), m: String(total % 60) }
}

export default function SleepDataPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [existingData, setExistingData] = useState<Record<string, number | null> | null>(null)
  const [checking, setChecking] = useState(false)

  const [total, setTotal] = useState({ h: '', m: '' })
  const [deep, setDeep] = useState({ h: '', m: '' })
  const [light, setLight] = useState({ h: '', m: '' })
  const [rem, setRem] = useState({ h: '', m: '' })
  const [adminNote, setAdminNote] = useState('')

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/patients-list')
      .then((r) => r.json())
      .then((d) => setPatients(d.patients ?? []))
  }, [])

  useEffect(() => {
    if (!selectedPatient || !date) return
    setChecking(true)
    setExistingData(null)
    fetch(`/api/admin/sleep-data/${selectedPatient.id}/${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setExistingData(d.data)
          const t = fromMin(d.data.total_sleep_min)
          const dp = fromMin(d.data.deep_sleep_min)
          const lt = fromMin(d.data.light_sleep_min)
          const rm = fromMin(d.data.rem_sleep_min)
          setTotal(t)
          setDeep(dp)
          setLight(lt)
          setRem(rm)
          setAdminNote(d.data.admin_note ?? '')
        } else {
          setExistingData(null)
          setTotal({ h: '', m: '' })
          setDeep({ h: '', m: '' })
          setLight({ h: '', m: '' })
          setRem({ h: '', m: '' })
          setAdminNote('')
        }
      })
      .finally(() => setChecking(false))
  }, [selectedPatient, date])

  const totalMin = toMin(total.h, total.m)
  const deepMin = toMin(deep.h, deep.m)
  const lightMin = toMin(light.h, light.m)
  const remMin = toMin(rem.h, rem.m)

  const subTotal = (deepMin ?? 0) + (lightMin ?? 0) + (remMin ?? 0)
  const mismatch =
    totalMin !== null && subTotal > 0 && Math.abs(totalMin - subTotal) > 15

  async function handleSave() {
    if (!selectedPatient) return
    setSaving(true)
    setToast(null)
    try {
      const method = existingData ? 'PUT' : 'POST'
      const url = existingData
        ? `/api/admin/sleep-data/${selectedPatient.id}/${date}`
        : '/api/admin/sleep-data'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          diary_date: date,
          total_sleep_min: totalMin,
          deep_sleep_min: deepMin,
          light_sleep_min: lightMin,
          rem_sleep_min: remMin,
          admin_note: adminNote || null,
        }),
      })
      if (res.ok) {
        setToast({ type: 'success', message: '수면 데이터가 저장되었습니다.' })
        setExistingData({ total_sleep_min: totalMin, deep_sleep_min: deepMin, light_sleep_min: lightMin, rem_sleep_min: remMin, admin_note: adminNote })
      } else {
        const d = await res.json()
        setToast({ type: 'error', message: d.error ?? '저장 실패' })
      }
    } finally {
      setSaving(false)
    }
  }

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.registration_number.toLowerCase().includes(patientSearch.toLowerCase())
  )

  const inputCls =
    'w-16 bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center text-gray-900 focus:outline-none focus:border-brand-400 focus:bg-white'

  function TimeInput({
    label,
    value,
    onChange,
  }: {
    label: string
    value: { h: string; m: string }
    onChange: (v: { h: string; m: string }) => void
  }) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <input
            className={inputCls}
            placeholder="0"
            value={value.h}
            onChange={(e) => onChange({ ...value, h: e.target.value.replace(/\D/g, '') })}
          />
          <span className="text-sm text-gray-500">시간</span>
          <input
            className={inputCls}
            placeholder="0"
            value={value.m}
            onChange={(e) => onChange({ ...value, m: e.target.value.replace(/\D/g, '') })}
          />
          <span className="text-sm text-gray-500">분</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl space-y-5">
      <div className="flex items-center gap-2">
        <BedDouble size={20} className="text-brand-500" />
        <h1 className="text-xl font-bold text-gray-900">수면 데이터 입력</h1>
      </div>

      {/* 환자 선택 */}
      <div className="bg-white rounded-xl p-5 shadow-card space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">환자 선택</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400"
            placeholder="이름 또는 등록번호"
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
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
              onClick={() => {
                setSelectedPatient(null)
                setPatientSearch('')
                setExistingData(null)
              }}
            >
              변경
            </button>
          </div>
        )}
      </div>

      {/* 측정 날짜 */}
      <div className="bg-white rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-800">측정 날짜</label>
          <input
            type="date"
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        {checking && <p className="text-xs text-gray-400 mt-2">기존 데이터 확인 중...</p>}
        {existingData && !checking && (
          <p className="text-xs text-blue-600 mt-2">
            ⚠️ 이 날짜에 기존 데이터가 있습니다. 저장 시 덮어씁니다.
          </p>
        )}
      </div>

      {/* 수면 단계별 시간 */}
      {selectedPatient && (
        <>
          <div className="bg-white rounded-xl p-5 shadow-card space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">🛏️ 수면 단계별 시간</h2>
            <TimeInput label="총 수면 시간" value={total} onChange={setTotal} />
            <TimeInput label="깊은 수면 (Non-REM 3단계)" value={deep} onChange={setDeep} />
            <TimeInput label="얕은 수면 (Non-REM 1~2단계)" value={light} onChange={setLight} />
            <TimeInput label="REM 수면" value={rem} onChange={setRem} />

            {mismatch && (
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="text-yellow-600 shrink-0" />
                <p className="text-xs text-yellow-700">
                  수면 단계 합산({Math.floor(subTotal / 60)}h {subTotal % 60}m)이 총 수면 시간과
                  15분 이상 차이가 납니다. 확인 후 저장해 주세요.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-card">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              📝 관리자 메모
            </label>
            <textarea
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400 resize-none"
              rows={3}
              placeholder="측정 관련 특이사항"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
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
              disabled={saving || !totalMin}
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
