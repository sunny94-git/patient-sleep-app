'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Moon, PenLine } from 'lucide-react'

interface DiaryCalendarClientProps {
  diaryDates: string[]
  today: string
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function DiaryCalendarClient({ diaryDates, today }: DiaryCalendarClientProps) {
  const router = useRouter()
  const [year, setYear] = useState(() => parseInt(today.slice(0, 4)))
  const [month, setMonth] = useState(() => parseInt(today.slice(5, 7)) - 1)

  const diarySet = new Set(diaryDates)
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function toDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function handleDayClick(day: number) {
    router.push(`/diary?date=${toDateStr(day)}`)
  }

  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const todayHasEntry = diarySet.has(today)

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Moon className="text-brand-500" size={20} />
        <h1 className="text-sm font-semibold text-gray-900 flex-1">수면 일지</h1>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-1">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <span className="text-base font-semibold text-gray-900">
            {year}년 {month + 1}월
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar */}
        <div className="card">
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((d, i) => (
              <div
                key={d}
                className={`text-center text-xs font-medium py-1 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={idx} />
              const dateStr = toDateStr(day)
              const hasEntry = diarySet.has(dateStr)
              const isToday = dateStr === today
              const isFuture = dateStr > today
              const colIdx = idx % 7

              return (
                <button
                  key={idx}
                  onClick={() => !isFuture && handleDayClick(day)}
                  disabled={isFuture}
                  className={`relative flex flex-col items-center justify-center py-2 rounded-xl transition-colors ${
                    isFuture
                      ? 'opacity-25 cursor-not-allowed'
                      : isToday
                        ? 'bg-brand-500 text-white'
                        : hasEntry
                          ? 'bg-brand-50 hover:bg-brand-100'
                          : 'hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isToday
                        ? 'text-white'
                        : colIdx === 0
                          ? 'text-red-400'
                          : colIdx === 6
                            ? 'text-blue-400'
                            : 'text-gray-800'
                    }`}
                  >
                    {day}
                  </span>
                  {hasEntry && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isToday ? 'bg-white/80' : 'bg-brand-500'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Today shortcut */}
        <button
          onClick={() => router.push(`/diary?date=${today}`)}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <PenLine size={18} />
          오늘 일지 {todayHasEntry ? '수정하기' : '작성하기'}
        </button>

        <div className="flex items-center gap-4 justify-center pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span className="text-xs text-gray-500">작성 완료</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            <span className="text-xs text-gray-500">미작성</span>
          </div>
        </div>
      </div>
    </div>
  )
}
