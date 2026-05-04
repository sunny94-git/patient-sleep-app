'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Check, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ── 타입 ─────────────────────────────────────────── */
interface DiaryForm {
  // Step 1
  bedtime: string
  wake_time: string
  sleep_onset_latency: string
  night_awakening_count: string
  sleep_event_memo: string
  // Step 2
  sleep_quality: number
  morning_fatigue: number
  daytime_sleepiness: string
  // Step 3
  nap_taken: boolean
  nap_duration_min: string
  dream: string
  caffeine: string
  alcohol: boolean
  condition: number
  memo: string
  // Step 4
  herbal_morning: boolean; herbal_lunch: boolean
  herbal_evening: boolean; herbal_bedtime: boolean
  western_morning: boolean; western_lunch: boolean
  western_evening: boolean; western_bedtime: boolean
}

const INITIAL: DiaryForm = {
  bedtime: '23:00', wake_time: '07:00',
  sleep_onset_latency: '', night_awakening_count: '', sleep_event_memo: '',
  sleep_quality: 3, morning_fatigue: 3, daytime_sleepiness: '',
  nap_taken: false, nap_duration_min: '', dream: '',
  caffeine: '', alcohol: false, condition: 3, memo: '',
  herbal_morning: false, herbal_lunch: false, herbal_evening: false, herbal_bedtime: false,
  western_morning: false, western_lunch: false, western_evening: false, western_bedtime: false,
}

const STEPS = ['기본 정보', '수면 질 평가', '추가 기록', '복약 체크']

const SCORE_COLORS: Record<number, string> = {
  1: '#EF4444',
  2: '#F97316',
  3: '#EAB308',
  4: '#84CC16',
  5: '#22C55E',
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function formatDateKo(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

/* ── 공통 하위 컴포넌트 ──────────────────────────── */
function SelectGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${value === o ? 'bg-[#4A90D9] text-white' : 'bg-[#F1F5F9] text-[#718096] hover:bg-[#E2E8F0]'}`}>
          {o}
        </button>
      ))}
    </div>
  )
}

function ColorSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const color = SCORE_COLORS[value]
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <input
          type="range" min={1} max={5} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 h-2 cursor-pointer"
          style={{ accentColor: color }}
        />
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0 shadow-sm transition-colors"
          style={{ backgroundColor: color }}
        >
          {value}
        </span>
      </div>
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
            style={{
              backgroundColor: n === value ? SCORE_COLORS[n] + '20' : 'transparent',
              color: n === value ? SCORE_COLORS[n] : '#CBD5E0',
              border: `2px solid ${n === value ? SCORE_COLORS[n] : '#E2E8F0'}`,
            }}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-[#4A5568] mb-2">{children}</p>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-[#A0AEC0] uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

/* ── 메인 페이지 ─────────────────────────────────── */
export default function DiaryPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<DiaryForm>(INITIAL)
  const [hasPrescription, setHasPrescription] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [isEdit, setIsEdit] = useState(false)

  useEffect(() => {
    setForm(INITIAL)
    setIsEdit(false)
    fetch(`/api/diary/today?date=${selectedDate}`).then(r => r.json()).then(d => {
      if (d.diary) {
        setForm(f => ({ ...f, ...d.diary }))
        setIsEdit(true)
      }
      setHasPrescription(d.hasPrescription)
    })
  }, [selectedDate])

  const set = (key: keyof DiaryForm, val: unknown) =>
    setForm(f => ({ ...f, [key]: val }))

  const totalSteps = hasPrescription ? 4 : 3
  const stepLabels = hasPrescription ? STEPS : STEPS.slice(0, 3)

  async function handleSubmit() {
    setSubmitting(true)
    const payload = {
      ...form,
      diary_date: selectedDate,
      nap_duration_min: form.nap_duration_min ? Number(form.nap_duration_min) : null,
    }
    await fetch('/api/diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSubmitting(false)
    setDone(true)
    setTimeout(() => router.push('/home'), 1500)
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="text-green-500 w-8 h-8" />
        </div>
        <p className="text-lg font-semibold text-[#1A202C]">일지가 저장되었습니다</p>
        <p className="text-sm text-[#718096]">홈으로 이동합니다...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-[#E2E8F0] px-5 py-4 flex items-center gap-3">
        <button onClick={() => step === 0 ? router.back() : setStep(s => s - 1)} className="p-1 -ml-1">
          <ChevronLeft size={22} className="text-[#4A5568]" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#718096]">{isEdit ? '수면 일지 수정' : '수면 일지 작성'}</p>
          <h1 className="text-base font-semibold text-[#1A202C]">{stepLabels[step]}</h1>
        </div>
        <span className="text-sm text-[#A0AEC0] shrink-0">{step + 1} / {totalSteps}</span>
      </div>

      {/* 날짜 선택 */}
      <div className="bg-white border-b border-[#E2E8F0] px-5 py-2.5">
        <label className="flex items-center gap-2 cursor-pointer">
          <CalendarDays size={16} className="text-[#4A90D9] shrink-0" />
          <span className="text-sm text-[#4A5568] font-medium shrink-0">날짜</span>
          <span className="text-sm text-[#1A202C] font-semibold">{formatDateKo(selectedDate)}</span>
          {isEdit && (
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium shrink-0">수정 중</span>
          )}
          <input
            type="date"
            value={selectedDate}
            max={todayStr()}
            onChange={e => { if (e.target.value) { setSelectedDate(e.target.value); setStep(0) } }}
            className="sr-only"
            id="diary-date-picker"
          />
        </label>
        <label htmlFor="diary-date-picker"
          className="mt-1 inline-flex items-center gap-1 text-xs text-[#4A90D9] cursor-pointer hover:underline">
          날짜 변경
        </label>
      </div>

      {/* 진행 바 */}
      <div className="h-1 bg-[#E2E8F0]">
        <div
          className="h-full bg-[#4A90D9] transition-all duration-300"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* 폼 영역 */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        {step === 0 && <Step1 form={form} set={set} />}
        {step === 1 && <Step2 form={form} set={set} />}
        {step === 2 && <Step3 form={form} set={set} />}
        {step === 3 && hasPrescription && <Step4 form={form} set={set} />}
      </div>

      {/* 하단 버튼 */}
      <div className="bg-white border-t border-[#E2E8F0] px-5 py-4">
        {step < totalSteps - 1 ? (
          <Button size="lg" onClick={() => setStep(s => s + 1)} className="flex items-center gap-2">
            다음 <ChevronRight size={18} />
          </Button>
        ) : (
          <Button size="lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '저장 중...' : (isEdit ? '수정 완료' : '저장 완료')}
          </Button>
        )}
      </div>
    </div>
  )
}

/* ── Step 1: 기본 수면 정보 ─────────────────────── */
function Step1({ form, set }: { form: DiaryForm; set: (k: keyof DiaryForm, v: unknown) => void }) {
  return (
    <>
      <Section title="취침 · 기상 시간">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>취침 시간</FieldLabel>
            <input type="time" value={form.bedtime} onChange={e => set('bedtime', e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-base text-center font-medium text-[#1A202C] focus:outline-none focus:border-[#4A90D9]" />
          </div>
          <div>
            <FieldLabel>기상 시간</FieldLabel>
            <input type="time" value={form.wake_time} onChange={e => set('wake_time', e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-base text-center font-medium text-[#1A202C] focus:outline-none focus:border-[#4A90D9]" />
          </div>
        </div>
      </Section>

      <Section title="잠들기까지 걸린 시간">
        <SelectGroup
          options={['0~10분', '10~30분', '30~60분', '60분 이상']}
          value={form.sleep_onset_latency}
          onChange={v => set('sleep_onset_latency', v)}
        />
      </Section>

      <Section title="야간 각성 횟수">
        <SelectGroup
          options={['없음', '1회', '2회', '3회 이상']}
          value={form.night_awakening_count}
          onChange={v => set('night_awakening_count', v)}
        />
      </Section>

      <Section title="수면 중 특이사항 (선택)">
        <textarea value={form.sleep_event_memo} onChange={e => set('sleep_event_memo', e.target.value)}
          maxLength={200} rows={3} placeholder="가위눌림, 코골이, 수면 중 경련 등..."
          className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A202C] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#4A90D9] resize-none" />
        <p className="text-xs text-[#A0AEC0] text-right">{form.sleep_event_memo.length}/200</p>
      </Section>
    </>
  )
}

/* ── Step 2: 수면의 질 평가 ─────────────────────── */
function Step2({ form, set }: { form: DiaryForm; set: (k: keyof DiaryForm, v: unknown) => void }) {
  return (
    <>
      <Section title="수면 만족도">
        <div className="flex justify-between text-xs text-[#A0AEC0] mb-1">
          <span>매우 나쁨</span><span>매우 좋음</span>
        </div>
        <ColorSlider value={form.sleep_quality} onChange={v => set('sleep_quality', v)} />
      </Section>

      <Section title="기상 시 피로도">
        <div className="flex justify-between text-xs text-[#A0AEC0] mb-1">
          <span>매우 피곤함</span><span>매우 개운함</span>
        </div>
        <ColorSlider value={form.morning_fatigue} onChange={v => set('morning_fatigue', v)} />
      </Section>

      <Section title="낮 동안 졸림">
        <SelectGroup
          options={['없음', '약간', '심함']}
          value={form.daytime_sleepiness}
          onChange={v => set('daytime_sleepiness', v)}
        />
      </Section>
    </>
  )
}

/* ── Step 3: 추가 상태 기록 ─────────────────────── */
function Step3({ form, set }: { form: DiaryForm; set: (k: keyof DiaryForm, v: unknown) => void }) {
  return (
    <>
      <Section title="낮잠">
        <div className="flex gap-2">
          {['없음', '있음'].map(o => (
            <button key={o} type="button"
              onClick={() => set('nap_taken', o === '있음')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${form.nap_taken === (o === '있음') ? 'bg-[#4A90D9] text-white' : 'bg-[#F1F5F9] text-[#718096]'}`}>
              {o}
            </button>
          ))}
        </div>
        {form.nap_taken && (
          <div className="mt-2">
            <FieldLabel>낮잠 시간 (분)</FieldLabel>
            <input type="number" min={1} max={480} value={form.nap_duration_min}
              onChange={e => set('nap_duration_min', e.target.value)}
              placeholder="예: 30"
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A202C] focus:outline-none focus:border-[#4A90D9]" />
          </div>
        )}
      </Section>

      <Section title="꿈">
        <SelectGroup options={['없음', '기억 안 남', '꿈을 꿈']} value={form.dream} onChange={v => set('dream', v)} />
      </Section>

      <Section title="카페인 섭취">
        <SelectGroup options={['없음', '오전', '오후', '저녁']} value={form.caffeine} onChange={v => set('caffeine', v)} />
      </Section>

      <Section title="음주">
        <div className="flex gap-2">
          {['없음', '있음'].map(o => (
            <button key={o} type="button"
              onClick={() => set('alcohol', o === '있음')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${form.alcohol === (o === '있음') ? 'bg-[#4A90D9] text-white' : 'bg-[#F1F5F9] text-[#718096]'}`}>
              {o}
            </button>
          ))}
        </div>
      </Section>

      <Section title="오늘 컨디션">
        <div className="flex justify-between text-xs text-[#A0AEC0] mb-1">
          <span>매우 나쁨</span><span>매우 좋음</span>
        </div>
        <ColorSlider value={form.condition} onChange={v => set('condition', v)} />
      </Section>

      <Section title="특이사항 메모 (선택)">
        <textarea value={form.memo} onChange={e => set('memo', e.target.value)}
          maxLength={200} rows={3} placeholder="오늘 컨디션에 영향을 준 사항..."
          className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#1A202C] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#4A90D9] resize-none" />
        <p className="text-xs text-[#A0AEC0] text-right">{form.memo.length}/200</p>
      </Section>
    </>
  )
}

/* ── Step 4: 복약 체크 ──────────────────────────── */
const TIMINGS = [
  { key: 'morning' as const, label: '아침' },
  { key: 'lunch'   as const, label: '점심' },
  { key: 'evening' as const, label: '저녁' },
  { key: 'bedtime' as const, label: '취침전' },
]

function Step4({ form, set }: { form: DiaryForm; set: (k: keyof DiaryForm, v: unknown) => void }) {
  return (
    <>
      {(['herbal', 'western'] as const).map(type => (
        <Section key={type} title={type === 'herbal' ? '💊 한약' : '💊 양약'}>
          <div className="flex gap-2">
            {TIMINGS.map(({ key, label }) => {
              const field = `${type}_${key}` as keyof DiaryForm
              const checked = form[field] as boolean
              return (
                <button key={key} type="button"
                  onClick={() => set(field, !checked)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors flex flex-col items-center gap-1 ${checked ? 'bg-[#4A90D9] text-white' : 'bg-[#F1F5F9] text-[#718096]'}`}>
                  {checked ? <Check size={14} /> : <span className="w-3.5 h-3.5 rounded-full border-2 border-[#A0AEC0]" />}
                  {label}
                </button>
              )
            })}
          </div>
        </Section>
      ))}
      <p className="text-xs text-[#A0AEC0] text-center">복용하지 않은 항목은 선택하지 않아도 됩니다</p>
    </>
  )
}
