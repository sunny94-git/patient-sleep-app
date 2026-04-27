'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Patient {
  id: string
  registration_number: string
  name: string
  birth_date: string | null
  phone: string | null
  created_at: string
}

function formatDate(str: string | null) {
  if (!str) return '-'
  return str.slice(0, 10).replace(/-/g, '.')
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/patients')
      .then(r => r.json())
      .then(d => { setPatients(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p =>
    p.name.includes(search) || p.registration_number.includes(search)
  )

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
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름 또는 등록번호 검색"
          className="w-full max-w-sm px-3 py-2 rounded-[--radius-sm] border border-bg-tertiary bg-bg-primary text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-brand-400 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
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
                <th className="text-left px-4 py-3 font-semibold text-text-secondary">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-tertiary">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-bg-secondary transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/patients/${p.id}`} className="font-medium text-brand-600 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{p.registration_number}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDate(p.birth_date)}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.phone ?? '-'}</td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 bg-bg-secondary border-t border-bg-tertiary text-xs text-text-muted">
            총 {filtered.length}명
          </div>
        </div>
      )}
    </div>
  )
}
