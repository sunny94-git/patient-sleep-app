'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Patient {
  id: string
  registration_number: string
  name: string
  birth_date: string | null
  phone: string | null
  created_at: string
  last_diary_date: string | null
}

function DiaryBadge({ lastDate }: { lastDate: string | null }) {
  if (!lastDate) return <span className="text-xs px-1.5 py-0.5 rounded-full bg-danger/10 text-danger font-medium">미작성</span>
  const days = Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000)
  if (days <= 7)  return <span className="text-xs px-1.5 py-0.5 rounded-full bg-success/10 text-success font-medium">{days}일 전</span>
  if (days <= 14) return <span className="text-xs px-1.5 py-0.5 rounded-full bg-warning/10 text-warning font-medium">{days}일 전</span>
  return <span className="text-xs px-1.5 py-0.5 rounded-full bg-danger/10 text-danger font-medium">{days}일 전</span>
}

interface PatientsResponse {
  data: Patient[]
  total: number
  page: number
  totalPages: number
  limit: number
}

function formatDate(str: string | null) {
  if (!str) return '-'
  return str.slice(0, 10).replace(/-/g, '.')
}

const LIMIT = 20

export default function PatientsPage() {
  const [res, setRes] = useState<PatientsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [inputValue, setInputValue] = useState('')

  const fetchPatients = useCallback((p: number, q: string) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: String(LIMIT) })
    if (q) params.set('search', q)
    fetch(`/api/admin/patients?${params}`)
      .then(r => r.json())
      .then(d => { setRes(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(inputValue)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  useEffect(() => {
    fetchPatients(page, search)
  }, [page, search, fetchPatients])

  const patients = res?.data ?? []
  const total = res?.total ?? 0
  const totalPages = res?.totalPages ?? 1

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">환자 목록</h1>
        <Link
          href="/admin/patients/new"
          className="px-4 py-2 bg-brand-500 text-white rounded-[--radius-sm] text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          + 환자 등록
        </Link>
      </div>

      {/* 검색 */}
      <div className="mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="이름 또는 등록번호 검색"
          className="w-full max-w-sm px-3 py-2 rounded-[--radius-sm] border border-bg-tertiary bg-bg-primary text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-brand-400 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-text-muted">{search ? '검색 결과가 없습니다.' : '등록된 환자가 없습니다.'}</p>
        </div>
      ) : (
        <div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-tertiary bg-bg-secondary">
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">이름</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">등록번호</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">생년월일</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">연락처</th>
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">최근 일지</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-tertiary">
              {patients.map(p => (
                <tr key={p.id} className="hover:bg-bg-secondary transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/patients/${p.id}`} className="font-medium text-brand-600 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{p.registration_number}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(p.birth_date)}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.phone ?? '-'}</td>
                  <td className="px-4 py-3"><DiaryBadge lastDate={p.last_diary_date} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 하단 - 총 인원 + 페이지네이션 */}
          <div className="px-4 py-3 bg-bg-secondary border-t border-bg-tertiary flex items-center justify-between">
            <span className="text-xs text-text-muted">총 {total}명</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <PageBtn onClick={() => setPage(1)} disabled={page === 1}>«</PageBtn>
                <PageBtn onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</PageBtn>
                {pageRange(page, totalPages).map(n =>
                  n === '...' ? (
                    <span key={n + Math.random()} className="px-2 text-text-muted text-xs">…</span>
                  ) : (
                    <PageBtn key={n} onClick={() => setPage(Number(n))} active={page === Number(n)}>
                      {n}
                    </PageBtn>
                  )
                )}
                <PageBtn onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</PageBtn>
                <PageBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</PageBtn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PageBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[28px] h-7 px-1.5 rounded text-xs font-medium transition-colors ${
        active
          ? 'bg-brand-500 text-white'
          : 'text-text-secondary hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-default'
      }`}
    >
      {children}
    </button>
  )
}

function pageRange(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
