'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { calcSleepEfficiency, getSleepEfficiencyLevel, getISISeverity, type ISISeverity } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DiaryRecord {
  id: string
  diary_date: string
  bedtime: string | null
  wake_time: string | null
  sleep_onset_latency: string | null
  night_awakening_count: string | null
  sleep_quality: number | null
  condition: number | null
  total_sleep_min: number | null
  deep_sleep_min: number | null
  light_sleep_min: number | null
  rem_sleep_min: number | null
}

interface ExamRecord {
  id: string
  exam_date: string
  exam_type: string
  summary: string | null
  result_data: Record<string, unknown> | null
}

interface ISIRecord {
  id: string
  assessed_at: string
  total_score: number | null
}

interface RecordsClientProps {
  diaries: DiaryRecord[]
  exams: ExamRecord[]
  isiList: ISIRecord[]
}

const SEVERITY_STYLE: Record<ISISeverity, { badge: string; bar: string }> = {
  없음:   { badge: 'badge-success', bar: 'bg-green-500' },
  경미:   { badge: 'badge-warning', bar: 'bg-yellow-500' },
  중등도: { badge: 'badge-orange',  bar: 'bg-orange-500' },
  심각:   { badge: 'badge-danger',  bar: 'bg-red-500' },
}

const TABS = [
  { key: 'sleep',      label: '수면' },
  { key: 'efficiency', label: '효율' },
  { key: 'exam',       label: '검사' },
  { key: 'isi',        label: 'ISI' },
] as const

type TabKey = typeof TABS[number]['key']

function calcDuration(d: DiaryRecord): number | null {
  if (d.total_sleep_min) return d.total_sleep_min
  if (!d.bedtime || !d.wake_time) return null
  const [bH, bM] = d.bedtime.split(':').map(Number)
  const [wH, wM] = d.wake_time.split(':').map(Number)
  let total = wH * 60 + wM - (bH * 60 + bM)
  if (total <= 0) total += 24 * 60
  const latencyMap: Record<string, number> = { '0~10분': 5, '10~30분': 20, '30~60분': 45, '60분 이상': 75 }
  const awakeningMap: Record<string, number> = { '없음': 0, '1회': 15, '2회': 30, '3회 이상': 45 }
  const latency = d.sleep_onset_latency ? (latencyMap[d.sleep_onset_latency] ?? 0) : 0
  const awakening = d.night_awakening_count ? (awakeningMap[d.night_awakening_count] ?? 0) : 0
  return Math.max(0, total - latency - awakening)
}

function calcEfficiency(d: DiaryRecord): number | null {
  return calcSleepEfficiency({
    bedtime: d.bedtime ?? undefined,
    wake_time: d.wake_time ?? undefined,
    sleep_onset_latency: d.sleep_onset_latency ?? undefined,
    night_awakening_count: d.night_awakening_count ?? undefined,
  })
}

export default function RecordsClient({ diaries, exams, isiList }: RecordsClientProps) {
  const [tab, setTab] = useState<TabKey>('sleep')

  return (
    <div className="px-4 pt-6 pb-8 space-y-4">
      <h1 className="text-h2 text-gray-900">📊 내 기록</h1>

      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-gray-900 shadow-card' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'sleep'      && <SleepTab diaries={diaries} />}
      {tab === 'efficiency' && <EfficiencyTab diaries={diaries} />}
      {tab === 'exam'       && <ExamTab exams={exams} />}
      {tab === 'isi'        && <ISITab isiList={isiList} />}
    </div>
  )
}

// ─── 수면 탭 ─────────────────────────────────────────────────────────────────

function SleepTab({ diaries }: { diaries: DiaryRecord[] }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed

  const qualityMap = useMemo(() => {
    const map = new Map<string, number>()
    diaries.forEach((d) => { if (d.sleep_quality !== null) map.set(d.diary_date, d.sleep_quality) })
    return map
  }, [diaries])

  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().slice(0, 10)
      const rec = diaries.find((r) => r.diary_date === dateStr)
      const dur = rec ? calcDuration(rec) : null
      return {
        label: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
        duration: dur !== null ? Math.round((dur / 60) * 10) / 10 : 0,
        hasData: !!rec,
      }
    })
  }, [diaries])

  const conditionData = useMemo(() =>
    [...diaries].reverse()
      .filter((d) => d.condition !== null)
      .slice(-14)
      .map((d) => ({ date: d.diary_date.slice(5), value: d.condition })),
    [diaries]
  )

  const hasStageData = diaries.some((d) => d.total_sleep_min && (d.deep_sleep_min || d.light_sleep_min || d.rem_sleep_min))

  function prevMonth() { if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1) }
  function nextMonth() {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
    if (!isCurrentMonth) { if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1) }
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  if (diaries.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-gray-400">아직 수면 기록이 없어요.<br />홈에서 수면 일지를 작성해 보세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 월별 캘린더 */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">수면 패턴</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />만족
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block ml-1" />보통
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block ml-1" />불만족
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <p className="text-sm font-semibold text-gray-800">
            {year}년 {month + 1}월
          </p>
          <button type="button" onClick={nextMonth} disabled={isCurrentMonth}
            className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <SleepCalendar year={year} month={month} qualityMap={qualityMap} />
      </div>

      {/* 주간 수면 시간 바 차트 */}
      <div className="card space-y-2">
        <p className="text-sm font-semibold text-gray-700">최근 7일 수면 시간</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={last7} margin={{ top: 16, right: 8, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `${v}h`} domain={[0, 12]} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: number) => v > 0 ? [`${v}시간`, '수면 시간'] : ['기록 없음', '']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="duration" radius={[4, 4, 0, 0]} fill="#60A5FA" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 수면 단계 (관리자 입력 데이터 있을 때만) */}
      {hasStageData && <SleepStagesCard diaries={diaries} />}

      {/* 컨디션 추이 */}
      {conditionData.length > 1 && (
        <div className="card space-y-2">
          <p className="text-sm font-semibold text-gray-700">컨디션 추이</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={conditionData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[1, 5]} tick={{ fontSize: 10, fill: '#9ca3af' }} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [v, '컨디션']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="value" stroke="#4A90D9" strokeWidth={2} dot={{ r: 3, fill: '#4A90D9' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function SleepCalendar({ year, month, qualityMap }: { year: number; month: number; qualityMap: Map<string, number> }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().slice(0, 10)

  const cells: (number | null)[] = [...Array(firstDay).fill(null)]
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  function dotColor(day: number): string {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const q = qualityMap.get(dateStr)
    if (q === undefined) return ''
    if (q >= 4) return 'bg-blue-400 text-white'
    if (q === 3) return 'bg-yellow-400 text-white'
    return 'bg-red-400 text-white'
  }

  function isToday(day: number): boolean {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` === today
  }

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-7 text-center mb-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <span key={d} className="text-[11px] font-medium text-gray-400">{d}</span>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 text-center gap-y-1">
          {week.map((day, di) => {
            if (!day) return <div key={di} />
            const color = dotColor(day)
            return (
              <div key={di} className="flex items-center justify-center">
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium
                  ${color || (isToday(day) ? 'border border-brand-400 text-brand-600' : 'text-gray-600')}`}>
                  {day}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function SleepStagesCard({ diaries }: { diaries: DiaryRecord[] }) {
  const latest = diaries.find((d) => d.total_sleep_min && (d.deep_sleep_min || d.light_sleep_min || d.rem_sleep_min))
  if (!latest) return null
  const total = latest.total_sleep_min ?? 0
  const deep = latest.deep_sleep_min ?? 0
  const light = latest.light_sleep_min ?? 0
  const rem = latest.rem_sleep_min ?? 0
  const awake = Math.max(0, total - deep - light - rem)

  const segments = [
    { label: '깊은 수면', min: deep,  color: 'bg-blue-600', textColor: 'text-blue-700' },
    { label: '얕은 수면', min: light, color: 'bg-blue-300', textColor: 'text-blue-500' },
    { label: 'REM',       min: rem,   color: 'bg-indigo-300', textColor: 'text-indigo-600' },
    { label: '각성',      min: awake, color: 'bg-gray-200', textColor: 'text-gray-500' },
  ].filter((s) => s.min > 0)

  return (
    <div className="card space-y-3">
      <p className="text-sm font-semibold text-gray-700">수면 단계 <span className="text-xs text-gray-400 font-normal">({latest.diary_date})</span></p>
      <div className="flex w-full rounded-full overflow-hidden h-5">
        {segments.map((s) => (
          <div
            key={s.label}
            className={`${s.color} transition-all`}
            style={{ width: `${(s.min / total) * 100}%` }}
            title={`${s.label}: ${Math.floor(s.min / 60)}h ${s.min % 60}m`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs">
            <span className={`w-2.5 h-2.5 rounded-sm ${s.color}`} />
            <span className="text-gray-600">{s.label}</span>
            <span className={`font-semibold ${s.textColor}`}>{Math.floor(s.min / 60)}h {s.min % 60}m</span>
            <span className="text-gray-400">({Math.round((s.min / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 효율 탭 ─────────────────────────────────────────────────────────────────

function EfficiencyTab({ diaries }: { diaries: DiaryRecord[] }) {
  const chartData = useMemo(() =>
    [...diaries].reverse()
      .map((d) => ({ date: d.diary_date.slice(5), efficiency: calcEfficiency(d) }))
      .filter((d): d is { date: string; efficiency: number } => d.efficiency !== null)
      .slice(-30),
    [diaries]
  )

  const withEff = diaries.map((d) => calcEfficiency(d)).filter((e): e is number => e !== null)
  const avg = withEff.length ? Math.round(withEff.reduce((s, e) => s + e, 0) / withEff.length) : null

  if (chartData.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-gray-400">효율 계산에 필요한 취침/기상 시간 데이터가 없어요.</p>
      </div>
    )
  }

  const CustomDot = (props: { cx?: number; cy?: number; payload?: { efficiency: number } }) => {
    const { cx, cy, payload } = props
    if (!cx || !cy || !payload) return null
    const level = getSleepEfficiencyLevel(payload.efficiency)
    const color = level === '정상' ? '#22c55e' : level === '주의' ? '#f59e0b' : '#ef4444'
    return <circle cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={1.5} />
  }

  return (
    <div className="space-y-4">
      {/* 통계 요약 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center space-y-1">
          <p className="text-[11px] text-gray-500">평균 수면 효율</p>
          <p className="text-base font-bold text-gray-900">{avg !== null ? `${avg}%` : '-'}</p>
          {avg !== null && <p className="text-[10px] text-gray-400">{getSleepEfficiencyLevel(avg)}</p>}
        </div>
        <div className="card text-center space-y-1">
          <p className="text-[11px] text-gray-500 leading-tight">정상 기준</p>
          <p className="text-base font-bold text-green-600">85%</p>
          <p className="text-[10px] text-gray-400">이상</p>
        </div>
        <div className="card text-center space-y-1">
          <p className="text-[11px] text-gray-500 leading-tight">주의 기준</p>
          <p className="text-base font-bold text-yellow-500">70%</p>
          <p className="text-[10px] text-gray-400">이상</p>
        </div>
      </div>

      {/* 효율 꺾은선 그래프 */}
      <div className="card space-y-2">
        <p className="text-sm font-semibold text-gray-700">수면 효율 추이</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} ticks={[0, 25, 50, 70, 85, 100]} />
            <Tooltip
              formatter={(v: number) => [`${v}%`, '수면 효율']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <ReferenceLine y={85} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={1.5}
              label={{ value: '85% 정상', position: 'insideTopRight', fontSize: 9, fill: '#22c55e' }} />
            <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={1.5}
              label={{ value: '70% 주의', position: 'insideTopRight', fontSize: 9, fill: '#f59e0b' }} />
            <Line
              type="monotone"
              dataKey="efficiency"
              stroke="#4A90D9"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6, stroke: '#4A90D9', strokeWidth: 2, fill: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── 검사 탭 ─────────────────────────────────────────────────────────────────

type ExamType = 'HRV' | 'InBody' | 'QEEG'

function ExamTab({ exams }: { exams: ExamRecord[] }) {
  const [examType, setExamType] = useState<ExamType>('HRV')

  const filtered = useMemo(() => exams.filter((e) => e.exam_type === examType), [exams, examType])

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['HRV', 'InBody', 'QEEG'] as ExamType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setExamType(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              examType === t ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-gray-400">아직 등록된 {examType} 검사 결과가 없어요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exam, idx) => (
            <ExamCard key={exam.id} exam={exam} isLatest={idx === 0} />
          ))}
        </div>
      )}
    </div>
  )
}

function ExamCard({ exam, isLatest }: { exam: ExamRecord; isLatest: boolean }) {
  const [open, setOpen] = useState(isLatest)
  const entries = exam.result_data ? Object.entries(exam.result_data) : []

  return (
    <div className={`card space-y-2 ${isLatest ? 'border border-brand-200' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            {isLatest && <span className="text-[10px] bg-brand-500 text-white px-1.5 py-0.5 rounded-full">최근</span>}
            <p className="text-sm font-semibold text-gray-800">{exam.exam_date}</p>
          </div>
          {exam.summary && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{exam.summary}</p>
          )}
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="space-y-2 border-t border-gray-100 pt-2">
          {entries.length > 0 && (
            <div className="grid grid-cols-2 gap-1.5">
              {entries.map(([key, val]) => (
                <div key={key} className="bg-gray-50 rounded-lg px-2.5 py-2">
                  <p className="text-[10px] text-gray-400">{key}</p>
                  <p className="text-sm font-semibold text-gray-800">{String(val)}</p>
                </div>
              ))}
            </div>
          )}
          {exam.summary && (
            <div className="bg-brand-50 rounded-xl px-3 py-2.5">
              <p className="text-xs font-semibold text-brand-700 mb-1">의료진 코멘트</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{exam.summary}</p>
            </div>
          )}
          {!entries.length && !exam.summary && (
            <p className="text-sm text-gray-400 text-center py-2">상세 데이터가 없어요.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── ISI 탭 ──────────────────────────────────────────────────────────────────

function ISITab({ isiList }: { isiList: ISIRecord[] }) {
  const chartData = useMemo(() =>
    [...isiList].reverse().map((item) => ({
      date: item.assessed_at.slice(5, 10),
      score: item.total_score ?? 0,
    })),
    [isiList]
  )

  if (isiList.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-sm text-gray-400">아직 자가진단 기록이 없어요.<br />자가진단 탭에서 ISI를 작성해 보세요.</p>
      </div>
    )
  }

  const latest = isiList[0]
  const latestScore = latest.total_score ?? 0
  const latestSeverity = getISISeverity(latestScore)

  return (
    <div className="space-y-4">
      {/* 최근 점수 */}
      <div className={`card border-2 ${SEVERITY_STYLE[latestSeverity].bar.replace('bg-', 'border-')}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">최근 ISI 점수</p>
            <p className="text-3xl font-bold text-gray-900">
              {latestScore}<span className="text-sm font-normal text-gray-400"> / 28</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{latest.assessed_at.slice(0, 10)}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${SEVERITY_STYLE[latestSeverity].badge}`}>
            {latestSeverity} 불면증
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
          <div
            className={`h-2 rounded-full ${SEVERITY_STYLE[latestSeverity].bar}`}
            style={{ width: `${(latestScore / 28) * 100}%` }}
          />
        </div>
      </div>

      {/* ISI 꺾은선 그래프 */}
      {chartData.length > 1 && (
        <div className="card space-y-2">
          <p className="text-sm font-semibold text-gray-700">점수 추이</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 28]} tick={{ fontSize: 10, fill: '#9ca3af' }} ticks={[0, 7, 14, 21, 28]} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [v, 'ISI 점수']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <ReferenceLine y={21} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5}
                label={{ value: '심각', position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }} />
              <ReferenceLine y={14} stroke="#f97316" strokeDasharray="5 5" strokeWidth={1.5}
                label={{ value: '중등도', position: 'insideTopRight', fontSize: 9, fill: '#f97316' }} />
              <ReferenceLine y={7} stroke="#eab308" strokeDasharray="5 5" strokeWidth={1.5}
                label={{ value: '경미', position: 'insideTopRight', fontSize: 9, fill: '#eab308' }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#4A90D9"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#4A90D9', stroke: 'white', strokeWidth: 1.5 }}
                activeDot={{ r: 6, stroke: '#4A90D9', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
          {/* 기준선 범례 */}
          <div className="flex flex-wrap gap-3 pt-1">
            {[{ label: '심각 (22~28)', color: 'bg-red-500' }, { label: '중등도 (15~21)', color: 'bg-orange-500' }, { label: '경미 (8~14)', color: 'bg-yellow-400' }, { label: '없음 (0~7)', color: 'bg-green-500' }].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span className={`w-2.5 h-0.5 ${item.color} inline-block`} />
                <span className="text-[10px] text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
