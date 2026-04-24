'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, ChevronRight, AlertTriangle } from 'lucide-react'

interface PatientRow {
  id: string
  registration_number: string
  name: string
  birth_date: string | null
  phone: string | null
  latestDiary: string | null
  daysSinceLastDiary: number
  unansweredQna: number
  nextVisitDate: string | null
}

const today = new Date().toISOString().slice(0, 10)

function dayDiff(date: string | null): number {
  if (!date) return 999
  return Math.floor((new Date(today).getTime() - new Date(date).getTime()) / 86400000)
}

export default function PatientsClient({ patients }: { patients: PatientRow[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'inactive' | 'noqna'>('all')

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.registration_number.toLowerCase().includes(q))
          return false
      }
      if (filter === 'inactive') return p.daysSinceLastDiary >= 7
      if (filter === 'noqna') return p.unansweredQna > 0
      return true
    })
  }, [patients, search, filter])

  const filterTabs = [
    { key: 'all', label: `전체 (${patients.length})` },
    {
      key: 'inactive',
      label: `미활동 (${patients.filter((p) => p.daysSinceLastDiary >= 7).length})`,
    },
    {
      key: 'noqna',
      label: `미답변 Q&A (${patients.filter((p) => p.unansweredQna > 0).length})`,
    },
  ] as const

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">환자 목록</h1>
        <Link
          href="/admin/patients/new"
          className="flex items-center gap-1.5 bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
        >
          <Plus size={15} />
          신규 환자 등록
        </Link>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="이름 또는 등록번호로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-400"
        />
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2">
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === key ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl overflow-hidden shadow-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                등록번호 / 이름
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                연락처
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                최근 일지
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                다음 방문일
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                미답변
              </th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const diaryWarning =
                  p.daysSinceLastDiary >= 14
                    ? 'text-red-500'
                    : p.daysSinceLastDiary >= 7
                      ? 'text-yellow-600'
                      : 'text-gray-700'
                const visitSoon =
                  p.nextVisitDate &&
                  Math.ceil(
                    (new Date(p.nextVisitDate).getTime() - new Date(today).getTime()) / 86400000
                  ) <= 3

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/admin/patients/${p.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400">#{p.registration_number}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.phone ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.daysSinceLastDiary >= 7 && (
                          <AlertTriangle size={12} className={diaryWarning} />
                        )}
                        <span className={`text-sm ${diaryWarning}`}>
                          {p.latestDiary ?? '없음'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.nextVisitDate ? (
                        <span
                          className={`text-sm font-medium ${visitSoon ? 'text-orange-600' : 'text-gray-700'}`}
                        >
                          {p.nextVisitDate}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.unansweredQna > 0 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                          {p.unansweredQna}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight size={16} className="text-gray-300 inline-block" />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}