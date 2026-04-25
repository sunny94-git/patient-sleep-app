'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import DiaryForm from './DiaryForm'
import { calcSleepEfficiency } from '@/types'

interface DiaryEntry {
  id: string
  diary_date: string
  bedtime: string | null
  wake_time: string | null
  sleep_onset_latency: string | null
  night_awakening_count: string | null
  sleep_quality: number | null
  condition: number | null
  memo: string | null
}

export default function DiaryCalendarClient({
  patientId,
  initialDiaries,
}: {
  patientId: string
  initialDiaries: DiaryEntry[]
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [diaries, setDiaries] = useState(initialDiaries)
  const [selected, setSelected] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const diaryMap = new Map(diaries.map((d) => [d.diary_date, d]))
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
  const selectedDiary = selected ? diaryMap.get(selected) ?? null : null

  function handleSaved(record: DiaryEntry) {
    setDiaries((prev) => {
      const idx = prev.findIndex((d) => d.diary_date === record.diary_date)
      if (idx >= 0) { const n = [...prev]; n[idx] = record; return n }
      return [...prev, record]
    })
    setShowForm(false)
    setSelected(record.diary_date)
  }

  const effColor = (v: number | null) =>
    v === null ? 'bg-gray-200' : v >= 85 ? 'bg-green-400' : v >= 70 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-brand-500 px-5 pt-12 pb-6 text-white">
        <h1 className="text-xl font-bold">수면 일지</h1>
        <p className="text-sm text-blue-200 mt-1">날짜를 선택해 기록하세요</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-900">{year}년 {month + 1}월</span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`
              const entry = diaryMap.get(dateStr)
              const eff = entry ? calcSleepEfficiency(entry) : null
              const isToday = dateStr === today.toISOString().slice(0, 10)
              const isSelected = selected === dateStr
              return (
                <button
                  key={day}
                  onClick={() => { setSelected(dateStr); setShowForm(false) }}
                  className={`flex flex-col items-center py-1 rounded-xl transition-colors ${isSelected ? 'bg-brand-500' : isToday ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <span className={`text-xs font-medium ${isSelected ? 'text-white' : isToday ? 'text-brand-600' : 'text-gray-700'}`}>{day}</span>
                  <div className={`w-4 h-1 rounded-full mt-0.5 ${entry ? effColor(eff) : 'bg-transparent'}`} />
                </button>
              )
            })}
          </div>
        </div>

        {selected && (
          <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">{selected}</h2>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                <Plus size={14} />
                {selectedDiary ? '수정' : '기록 작성'}
              </button>
            </div>
            {showForm && (
              <DiaryForm
                date={selected}
                initial={selectedDiary}
                onSaved={handleSaved}
                onCancel={() => setShowForm(false)}
              />
            )}
            {!showForm && selectedDiary && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                {selectedDiary.bedtime && <Row label="취침" value={selectedDiary.bedtime} />}
                {selectedDiary.wake_time && <Row label="기상" value={selectedDiary.wake_time} />}
                {selectedDiary.sleep_quality != null && <Row label="수면질" value={`${selectedDiary.sleep_quality}점`} />}
                {selectedDiary.condition != null && <Row label="콘디션" value={`${selectedDiary.condition}점`} />}
                {selectedDiary.memo && <div className="col-span-2 text-gray-500 italic">{selectedDiary.memo}</div>}
              </div>
            )}
            {!showForm && !selectedDiary && (
              <p className="text-sm text-gray-400">아직 기록이 없습니다.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1">
      <span className="text-gray-400">{label}:</span>
      <span className="text-gray-700">{value}</span>
    </div>
  )
}
