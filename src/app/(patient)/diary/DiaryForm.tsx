'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Check, Moon } from 'lucide-react'

interface DiaryData {
  bedtime: string
  wake_time: string
  sleep_onset_latency: string
  night_awakening_count: string
  sleep_event_memo: string
  sleep_quality: number
  morning_fatigue: number
  daytime_sleepiness: string
  nap_taken: boolean
  nap_duration_min: number | null
  dream: string
  caffeine: string
  alcohol: boolean
  condition: number
  memo: string
  herbal_morning: boolean
  herbal_lunch: boolean
  herbal_evening: boolean
  herbal_bedtime: boolean
  western_morning: boolean
  western_lunch: boolean
  western_evening: boolean
  western_bedtime: boolean
}

interface DiaryFormProps {
  patientId: string
  today: string
  existingDiary: Partial<DiaryData> & { id?: string } | null
  hasPrescription: boolean
}

function makeInitial(existing: DiaryFormProps['existingDiary']): DiaryData {
  return {
    bedtime: existing?.bedtime ?? '23:00',
    wake_time: existing?.wake_time ?? '07:00',
    sleep_onset_latency: existing?.sleep_onset_latency ?? '',
    night_awakening_count: existing?.night_awakening_count ?? '',
    sleep_event_memo: existing?.sleep_event_memo ?? '',
    sleep_quality: existing?.sleep_quality ?? 3,
    morning_fatigue: existing?.morning_fatigue ?? 3,
    daytime_sleepiness: existing?.daytime_sleepiness ?? '',
    nap_taken: existing?.nap_taken ?? false,
    nap_duration_min: existing?.nap_duration_min ?? null,
    dream: existing?.dream ?? '',
    caffeine: existing?.caffeine ?? '',
    alcohol: existing?.alcohol ?? false,
    condition: existing?.condition ?? 3,
    memo: existing?.memo ?? '',
    herbal_morning: existing?.herbal_morning ?? false,
    herbal_lunch: existing?.herbal_lunch ?? false,
    herbal_evening: existing?.herbal_evening ?? false,
    herbal_bedtime: existing?.herbal_bedtime ?? false,
    western_morning: existing?.western_morning ?? false,
    western_lunch: existing?.western_lunch ?? false,
    western_evening: existing?.western_evening ?? false,
    western_bedtime: existing?.western_bedtime ?? false,
  }
}

function calcSleepMinutes(bedtime: string, wake_time: string): number | null {
  if (!bedtime || !wake_time) return null
  const [bedH, bedM] = bedtime.split(':').map(Number)
  const [wakeH, wakeM] = wake_time.split(':').map(Number)
  let total = wakeH * 60 + wakeM - (bedH * 60 + bedM)
  if (total <= 0) total += 24 * 60
  return total
}

const TOTAL_STEPS = 4

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < current ? 'w-8 bg-brand-500' : i === current ? 'w-8 bg-brand-500' : 'w-4 bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function RatingButtons({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const labels = ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음']
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            value === n ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={labels[n - 1]}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function SelectButtons({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? '' : opt)}
          className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            value === opt ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

type MedTiming = 'morning' | 'lunch' | 'evening' | 'bedtime'
const MED_TIMING_LABEL: Record<MedTiming, string> = {
  morning: '아침',
  lunch: '점심',
  evening: '저녁',
  bedtime: '취침전',
}

export default function DiaryForm({
  patientId,
  today,
  existingDiary,
  hasPrescription,
}: DiaryFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<DiaryData>(() => makeInitial(existingDiary))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const isEditing = !!existingDiary?.id
  const diaryId = existingDiary?.id

  function set<K extends keyof DiaryData>(key: K, value: DiaryData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const sleepMinutes = calcSleepMinutes(data.bedtime, data.wake_time)

  function validateStep(): string | null {
    if (step === 0) {
      if (!data.sleep_onset_latency) return '잠들기까지 걸린 시간을 선택해주세요.'
      if (!data.night_awakening_count) return '야간 각성 횟수를 선택해주세요.'
    }
    if (step === 1) {
      if (!data.daytime_sleepiness) return '낮 동안 졸림 정도를 선택해주세요.'
    }
    if (step === 2) {
      if (!data.dream) return '꿈 여부를 선택해주세요.'
      if (!data.caffeine) return '카페인 섭취 여부를 선택해주세요.'
    }
    return null
  }

  function handleNext() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError(null)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const body = { ...data, diary_date: today, patient_id: patientId }
      const url = isEditing ? `/api/diary/${diaryId}` : '/api/diary'
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '저장에 실패했습니다.')
      }
      setSubmitted(true)
      setTimeout(() => router.push('/home'), 1800)
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <Check className="text-green-600" size={32} />
          </div>
          <p className="text-h2 text-gray-900">수면 일지 저장 완료!</p>
          <p className="text-sm text-gray-500">홈으로 돌아갑니다...</p>
        </div>
      </div>
    )
  }

  const stepTitles = ['기본 수면 정보', '수면의 질', '추가 상태', '복약 체크']
  const totalSteps = hasPrescription ? 4 : 3

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => (step > 0 ? setStep((s) => s - 1) : router.push('/home'))}
          className="p-1.5 -ml-1.5 text-gray-500 hover:text-gray-900"
          aria-label="뒤로"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-gray-900">
            수면 일지 — {stepTitles[step]}
          </h1>
          <p className="text-xs text-gray-400">{today} · {step + 1}/{totalSteps}단계</p>
        </div>
        <Moon className="text-brand-500" size={20} />
      </div>

      <StepIndicator current={step} />

      <div className="px-4 pb-32 space-y-4">
        {/* ─── Step 0: 기본 수면 정보 ─── */}
        {step === 0 && (
          <>
            <div className="card space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">취침 시간</label>
                  <input
                    type="time"
                    value={data.bedtime}
                    onChange={(e) => set('bedtime', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">기상 시간</label>
                  <input
                    type="time"
                    value={data.wake_time}
                    onChange={(e) => set('wake_time', e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                  />
                </div>
              </div>
              {sleepMinutes && (
                <p className="text-xs text-brand-500 text-center">
                  예상 수면 시간: {Math.floor(sleepMinutes / 60)}시간 {sleepMinutes % 60}분
                </p>
              )}
            </div>

            <div className="card space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">잠들기까지 걸린 시간 *</label>
                <SelectButtons
                  options={['0~10분', '10~30분', '30~60분', '60분 이상']}
                  value={data.sleep_onset_latency}
                  onChange={(v) => set('sleep_onset_latency', v)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">야간 각성 횟수 *</label>
                <SelectButtons
                  options={['없음', '1회', '2회', '3회 이상']}
                  value={data.night_awakening_count}
                  onChange={(v) => set('night_awakening_count', v)}
                />
              </div>
            </div>

            <div className="card space-y-2">
              <label className="text-sm font-medium text-gray-700">수면 중 특이사항</label>
              <textarea
                value={data.sleep_event_memo}
                onChange={(e) => set('sleep_event_memo', e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="코골이, 수면 중 움직임 등 (선택)"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <p className="text-right text-xs text-gray-400">{data.sleep_event_memo.length}/200</p>
            </div>
          </>
        )}

        {/* ─── Step 1: 수면의 질 ─── */}
        {step === 1 && (
          <div className="card space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                수면 만족도
                <span className="ml-2 text-brand-500 font-semibold">{data.sleep_quality}점</span>
              </label>
              <p className="text-xs text-gray-400">1 = 매우 나쁨, 5 = 매우 좋음</p>
              <RatingButtons value={data.sleep_quality} onChange={(v) => set('sleep_quality', v)} />
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                기상 시 피로도
                <span className="ml-2 text-brand-500 font-semibold">{data.morning_fatigue}점</span>
              </label>
              <p className="text-xs text-gray-400">1 = 매우 상쾌함, 5 = 매우 피곤함</p>
              <RatingButtons value={data.morning_fatigue} onChange={(v) => set('morning_fatigue', v)} />
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <label className="text-sm font-medium text-gray-700">낮 동안 졸림 *</label>
              <SelectButtons
                options={['없음', '약간', '심함']}
                value={data.daytime_sleepiness}
                onChange={(v) => set('daytime_sleepiness', v)}
              />
            </div>
          </div>
        )}

        {/* ─── Step 2: 추가 상태 ─── */}
        {step === 2 && (
          <>
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">낮잠</label>
                <button
                  type="button"
                  onClick={() => set('nap_taken', !data.nap_taken)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    data.nap_taken ? 'bg-brand-500' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={data.nap_taken}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      data.nap_taken ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {data.nap_taken && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">낮잠 시간 (분)</label>
                  <input
                    type="number"
                    min={5}
                    max={240}
                    step={5}
                    value={data.nap_duration_min ?? ''}
                    onChange={(e) =>
                      set('nap_duration_min', e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="예: 30"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
                  />
                </div>
              )}
            </div>

            <div className="card space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">꿈 *</label>
                <SelectButtons
                  options={['없음', '기억 안 남', '꿈을 꿈']}
                  value={data.dream}
                  onChange={(v) => set('dream', v)}
                />
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <label className="text-sm font-medium text-gray-700">카페인 섭취 *</label>
                <SelectButtons
                  options={['없음', '오전', '오후', '저녁']}
                  value={data.caffeine}
                  onChange={(v) => set('caffeine', v)}
                />
              </div>
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">음주</label>
                <button
                  type="button"
                  onClick={() => set('alcohol', !data.alcohol)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    data.alcohol ? 'bg-brand-500' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={data.alcohol}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      data.alcohol ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="card space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  오늘 컨디션
                  <span className="ml-2 text-brand-500 font-semibold">{data.condition}점</span>
                </label>
                <p className="text-xs text-gray-400">1 = 매우 나쁨, 5 = 매우 좋음</p>
                <RatingButtons value={data.condition} onChange={(v) => set('condition', v)} />
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <label className="text-sm font-medium text-gray-700">특이사항 메모</label>
                <textarea
                  value={data.memo}
                  onChange={(e) => set('memo', e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="오늘 특이사항이 있으면 적어주세요 (선택)"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
                <p className="text-right text-xs text-gray-400">{data.memo.length}/200</p>
              </div>
            </div>
          </>
        )}

        {/* ─── Step 3: 복약 체크 (처방 환자만) ─── */}
        {step === 3 && hasPrescription && (
          <>
            {(['herbal', 'western'] as const).map((medType) => (
              <div key={medType} className="card space-y-3">
                <h2 className="text-sm font-semibold text-gray-700">
                  💊 {medType === 'herbal' ? '한약' : '양약'}
                </h2>
                <div className="grid grid-cols-4 gap-2">
                  {(['morning', 'lunch', 'evening', 'bedtime'] as MedTiming[]).map((timing) => {
                    const key = `${medType}_${timing}` as keyof DiaryData
                    const checked = !!data[key]
                    return (
                      <button
                        key={timing}
                        type="button"
                        onClick={() => set(key, !checked as DiaryData[typeof key])}
                        className={`py-3 rounded-lg text-xs font-medium transition-colors ${
                          checked ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {MED_TIMING_LABEL[timing]}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 px-4 py-3 space-y-2"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => { setError(null); setStep((s) => s - 1) }}
              className="btn-secondary flex-1 flex items-center justify-center gap-1"
            >
              <ChevronLeft size={18} /> 이전
            </button>
          )}
          {step < totalSteps - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex-1 flex items-center justify-center gap-1"
            >
              다음 <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? '저장 중...' : isEditing ? '수정 완료' : '제출하기'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
