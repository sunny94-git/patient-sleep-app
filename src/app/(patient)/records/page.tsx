'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { getIsiLevel, getSleepEfficiencyLevel } from '@/lib/utils'

type SubTab = '수면' | '효율' | '검사' | 'ISI' | '복약'
type ExamType = 'hrv' | 'inbody' | 'qeeg'

const CHART_THEME = {
  grid: '#E2E8F0', axis: '#718096',
  font: "'Pretendard Variable', 'Inter', sans-serif", fontSize: 11,
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function fmtHours(h: number) {
  const totalMin = Math.round(h * 60)
  const hr = Math.floor(totalMin / 60)
  const min = totalMin % 60
  if (hr === 0) return `${min}분`
  if (min === 0) return `${hr}시간`
  return `${hr}시간 ${min}분`
}

/* ── 메인 ──────────────────────────────────────── */
export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState<SubTab>('수면')
  const tabs: SubTab[] = ['수면', '효율', '검사', 'ISI', '복약']

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#E2E8F0] px-5 pt-5 pb-0">
        <h1 className="text-xl font-bold text-[#1A202C] mb-4">내 기록</h1>
        <div className="flex gap-0">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t
                  ? 'border-[#4A90D9] text-[#4A90D9]'
                  : 'border-transparent text-[#A0AEC0]'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === '수면'  && <SleepTab />}
        {activeTab === '효율'  && <EfficiencyTab />}
        {activeTab === '검사'  && <ExamTab />}
        {activeTab === 'ISI'  && <IsiTab />}
        {activeTab === '복약'  && <MedTab />}
      </div>
    </div>
  )
}

/* ── 수면 탭 ────────────────────────────────────── */
function SleepTab() {
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/records/sleep?range=30d').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  const chartData = data.map(row => ({
    date: formatDate(row.diary_date as string),
    총수면: row.total_sleep_min ? Math.round((row.total_sleep_min as number) / 60 * 10) / 10 : null,
    깊은수면: row.deep_sleep_min ? Math.round((row.deep_sleep_min as number) / 60 * 10) / 10 : null,
    얕은수면: row.light_sleep_min ? Math.round((row.light_sleep_min as number) / 60 * 10) / 10 : null,
    REM: row.rem_sleep_min ? Math.round((row.rem_sleep_min as number) / 60 * 10) / 10 : null,
    만족도: row.sleep_quality,
    컨디션: row.condition,
  }))

  if (loading) return <ChartSkeleton />

  return (
    <div className="flex flex-col gap-4">
      <ChartCard title="수면 시간 (시간)" subtitle="최근 30일">
        {chartData.some(d => d.총수면) ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axis }} />
              <YAxis tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axis }} />
              <Tooltip formatter={(v) => [fmtHours(v as number), '수면 시간']} />
              <Bar dataKey="총수면" fill="#4A90D9" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState text="관리자가 수면 데이터를 입력하면 차트가 표시됩니다." />}
      </ChartCard>

      <ChartCard title="수면 단계 구성" subtitle="깊은·얕은·REM 수면">
        {chartData.some(d => d.깊은수면) ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axis }} />
              <YAxis tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axis }} />
              <Tooltip formatter={(v, name) => [fmtHours(v as number), name]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="깊은수면" stackId="s" fill="#2563EB" maxBarSize={20} />
              <Bar dataKey="얕은수면" stackId="s" fill="#60A5FA" maxBarSize={20} />
              <Bar dataKey="REM"     stackId="s" fill="#93C5FD" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState text="관리자가 수면 단계 데이터를 입력하면 차트가 표시됩니다." />}
      </ChartCard>

      <ChartCard title="수면 만족도 / 컨디션" subtitle="1~5점">
        {chartData.some(d => d.만족도) ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="date" tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axis }} />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axis }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="만족도" stroke="#4A90D9" dot={{ r: 3 }} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="컨디션" stroke="#60A5FA" dot={{ r: 3 }} strokeWidth={2} strokeDasharray="4 2" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyState text="수면 일지를 작성하면 차트가 표시됩니다." />}
      </ChartCard>
    </div>
  )
}

/* ── 효율 탭 ────────────────────────────────────── */
function EfficiencyTab() {
  const [data, setData] = useState<{ date: string; efficiency: number }[]>([])
  const [range, setRange] = useState<'30d' | '90d'>('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/records/efficiency?range=${range}`).then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [range])

  const chartData = data.map(d => ({ date: formatDate(d.date), 수면효율: d.efficiency }))
  const avg = data.length ? Math.round(data.reduce((s, d) => s + d.efficiency, 0) / data.length) : null
  const effLevel = avg !== null ? getSleepEfficiencyLevel(avg) : null

  return (
    <div className="flex flex-col gap-4">
      {/* 평균 카드 */}
      {avg !== null && effLevel && (
        <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-[#718096]">최근 {range === '30d' ? 30 : 90}일 평균</p>
            <p className="text-3xl font-bold" style={{ color: effLevel.color }}>{avg}%</p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: effLevel.color + '20', color: effLevel.color }}>
            {effLevel.label}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        {(['30d', '90d'] as const).map(r => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${range === r ? 'bg-[#4A90D9] text-white' : 'bg-[#F1F5F9] text-[#718096]'}`}>
            {r === '30d' ? '30일' : '90일'}
          </button>
        ))}
      </div>

      <ChartCard title="수면 효율 추이" subtitle="기준: 85% 정상 / 70% 불량">
        {loading ? <ChartSkeleton /> : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="date" tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axis }} />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 70, 85, 100]} tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axis }} />
              <Tooltip formatter={(v) => [`${v}%`, '수면 효율']} />
              <ReferenceLine y={85} stroke="#22C55E" strokeDasharray="4 2" label={{ value: '85%', fill: '#22C55E', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="4 2" label={{ value: '70%', fill: '#EF4444', fontSize: 10, position: 'right' }} />
              <Line type="monotone" dataKey="수면효율" stroke="#4A90D9" dot={{ r: 3 }} strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyState text="수면 일지를 작성하면 효율 차트가 표시됩니다." />}
      </ChartCard>
    </div>
  )
}

/* ── 검사 탭 ────────────────────────────────────── */
interface ExamItem {
  id: string
  exam_date: string
  exam_type: string
  result_data?: Record<string, string | number>
  summary?: string
}

function ExamTab() {
  const [examType, setExamType] = useState<ExamType>('hrv')
  const [data, setData] = useState<ExamItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/records/exams/${examType}`).then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [examType])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(['hrv', 'inbody', 'qeeg'] as ExamType[]).map(t => (
          <button key={t} onClick={() => setExamType(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium uppercase transition-colors ${examType === t ? 'bg-[#4A90D9] text-white' : 'bg-[#F1F5F9] text-[#718096]'}`}>
            {t === 'inbody' ? 'InBody' : t.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? <ChartSkeleton /> : data.length === 0 ? (
        <EmptyCard text={`아직 등록된 ${examType.toUpperCase()} 검사 결과가 없습니다.`} />
      ) : (
        data.map((item) => (
          <div key={item.id as string} className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#1A202C]">
                {new Date(item.exam_date as string).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#4A90D9] text-xs font-medium rounded-full">{item.exam_type}</span>
            </div>
            {item.result_data && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.entries(item.result_data).map(([k, v]) => (
                  <div key={k} className="bg-[#F5F7FA] rounded-lg px-3 py-2">
                    <p className="text-xs text-[#718096]">{k}</p>
                    <p className="text-sm font-semibold text-[#1A202C]">{String(v)}</p>
                  </div>
                ))}
              </div>
            )}
            {item.summary && (
              <div className="border-t border-[#E2E8F0] pt-3">
                <p className="text-xs text-[#718096] mb-1">원장 코멘트</p>
                <p className="text-sm text-[#4A5568]">{item.summary}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

/* ── ISI 탭 ─────────────────────────────────────── */
function IsiTab() {
  const [data, setData] = useState<{ assessed_at: string; total_score: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/records/isi').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  const latest = data.at(-1)
  const latestLevel = latest?.total_score != null ? getIsiLevel(latest.total_score) : null
  const chartData = data.map(d => ({ date: formatDate(d.assessed_at), 점수: d.total_score }))

  if (loading) return <ChartSkeleton />

  return (
    <div className="flex flex-col gap-4">
      {latest && latestLevel && (
        <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-[#718096]">최근 자가진단 점수</p>
            <p className="text-3xl font-bold text-[#1A202C]">{latest.total_score}<span className="text-base font-normal text-[#718096]"> / 28</span></p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${latestLevel.bg} ${latestLevel.color}`}>
            {latestLevel.label}
          </span>
        </div>
      )}

      <ChartCard title="ISI 점수 추이" subtitle="기준: 7·14·21점">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="date" tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axis }} />
              <YAxis domain={[0, 28]} ticks={[0, 7, 14, 21, 28]} tick={{ fontSize: CHART_THEME.fontSize, fill: CHART_THEME.axis }} />
              <Tooltip formatter={(v) => [`${v}점`, 'ISI 점수']} />
              <ReferenceLine y={7}  stroke="#22C55E" strokeDasharray="3 2" />
              <ReferenceLine y={14} stroke="#EAB308" strokeDasharray="3 2" />
              <ReferenceLine y={21} stroke="#F97316" strokeDasharray="3 2" />
              <Line type="monotone" dataKey="점수" stroke="#4A90D9" dot={{ r: 4 }} strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyState text="자가진단을 제출하면 추이 그래프가 표시됩니다." />}
      </ChartCard>
    </div>
  )
}

/* ── 복약 탭 ────────────────────────────────────── */
interface MedRecord {
  diary_date: string
  herbal_morning: boolean
  herbal_lunch: boolean
  herbal_evening: boolean
  herbal_bedtime: boolean
  western_morning: boolean
  western_lunch: boolean
  western_evening: boolean
  western_bedtime: boolean
}

const MED_TIMINGS = [
  { key: 'morning', label: '아침' },
  { key: 'lunch',   label: '점심' },
  { key: 'evening', label: '저녁' },
  { key: 'bedtime', label: '취침' },
] as const

const HERBAL_KEYS  = { morning: 'herbal_morning',  lunch: 'herbal_lunch',  evening: 'herbal_evening',  bedtime: 'herbal_bedtime'  } as const
const WESTERN_KEYS = { morning: 'western_morning', lunch: 'western_lunch', evening: 'western_evening', bedtime: 'western_bedtime' } as const

function calcAdherenceRate(records: MedRecord[], keys: typeof HERBAL_KEYS | typeof WESTERN_KEYS) {
  let total = 0, taken = 0
  for (const r of records) {
    for (const t of MED_TIMINGS) {
      total++
      if (r[keys[t.key]]) taken++
    }
  }
  return total === 0 ? null : Math.round((taken / total) * 100)
}

function MedDot({ taken }: { taken: boolean }) {
  return (
    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
      taken ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#EF4444]'
    }`}>
      {taken ? '✓' : '✗'}
    </span>
  )
}

function MedSection({ title, records, keys }: {
  title: string
  records: MedRecord[]
  keys: typeof HERBAL_KEYS | typeof WESTERN_KEYS
}) {
  const rate = calcAdherenceRate(records, keys)
  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-[#1A202C]">{title}</p>
          <p className="text-xs text-[#718096]">최근 30일</p>
        </div>
        {rate !== null && (
          <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{
            backgroundColor: rate >= 80 ? '#DCFCE7' : rate >= 50 ? '#FEF9C3' : '#FEE2E2',
            color:           rate >= 80 ? '#16A34A' : rate >= 50 ? '#CA8A04' : '#EF4444',
          }}>
            {rate}%
          </span>
        )}
      </div>

      {/* 헤더 행 */}
      <div className="flex items-center gap-1 mb-1.5 px-0.5">
        <span className="w-14 shrink-0" />
        {MED_TIMINGS.map(t => (
          <span key={t.key} className="flex-1 text-center text-[10px] text-[#A0AEC0]">{t.label}</span>
        ))}
      </div>

      {/* 데이터 행 */}
      <div className="flex flex-col gap-1">
        {records.map(r => (
          <div key={r.diary_date} className="flex items-center gap-1 px-0.5">
            <span className="text-[11px] text-[#718096] w-14 shrink-0">
              {new Date(r.diary_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
            </span>
            {MED_TIMINGS.map(t => (
              <div key={t.key} className="flex-1 flex justify-center">
                <MedDot taken={r[keys[t.key]]} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function MedTab() {
  const [data, setData] = useState<MedRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/records/medication?days=30')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <ChartSkeleton />
  if (data.length === 0) return <EmptyCard text="수면 일지를 작성하면 복약 이력이 표시됩니다." />

  const hasHerbal  = data.some(r => r.herbal_morning  || r.herbal_lunch  || r.herbal_evening  || r.herbal_bedtime)
  const hasWestern = data.some(r => r.western_morning || r.western_lunch || r.western_evening || r.western_bedtime)

  if (!hasHerbal && !hasWestern) {
    return <EmptyCard text="처방받은 약이 없거나 복약 기록이 없습니다." />
  }

  return (
    <div className="flex flex-col gap-4">
      {hasHerbal  && <MedSection title="한약 복약 이력" records={data} keys={HERBAL_KEYS}  />}
      {hasWestern && <MedSection title="양약 복약 이력" records={data} keys={WESTERN_KEYS} />}
    </div>
  )
}

/* ── 공통 UI ────────────────────────────────────── */
function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="mb-3">
        <p className="text-sm font-semibold text-[#1A202C]">{title}</p>
        {subtitle && <p className="text-xs text-[#718096]">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-[#A0AEC0] text-center py-8">{text}</p>
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08)] text-center">
      <p className="text-sm text-[#A0AEC0]">{text}</p>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
      <div className="h-40 bg-gray-100 rounded-xl" />
    </div>
  )
}
