import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

type Params = { params: Promise<{ id: string }> }

function escapeCell(v: unknown): string {
  if (v == null) return ''
  const s = String(v)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function toRow(cols: unknown[]): string {
  return cols.map(escapeCell).join(',')
}

export async function GET(_req: Request, { params }: Params) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const [{ data: patient }, { data: diary }] = await Promise.all([
    supabase.from('patients').select('name, registration_number').eq('id', id).single(),
    supabase
      .from('sleep_diary')
      .select('*')
      .eq('patient_id', id)
      .order('diary_date', { ascending: true }),
  ])

  const headers = [
    '날짜', '취침시각', '기상시각', '잠드는시간', '각성횟수',
    '총수면(분)', '깊은수면(분)', '얕은수면(분)', 'REM수면(분)',
    '수면의질(1-5)', '아침피로도(1-5)', '낮졸음', '컨디션(1-5)',
    '낮잠여부', '낮잠시간(분)', '꿈', '카페인', '음주',
    '한약_아침', '한약_점심', '한약_저녁', '한약_취침',
    '양약_아침', '양약_점심', '양약_저녁', '양약_취침',
    '메모', '원장메모',
  ]

  const rows: string[] = [
    `# 환자: ${patient?.name ?? ''} (${patient?.registration_number ?? ''})`,
    headers.join(','),
  ]

  for (const r of diary ?? []) {
    rows.push(toRow([
      r.diary_date,
      r.bedtime,
      r.wake_time,
      r.sleep_onset_latency,
      r.night_awakening_count,
      r.total_sleep_min,
      r.deep_sleep_min,
      r.light_sleep_min,
      r.rem_sleep_min,
      r.sleep_quality,
      r.morning_fatigue,
      r.daytime_sleepiness,
      r.condition,
      r.nap_taken != null ? (r.nap_taken ? '있음' : '없음') : '',
      r.nap_duration_min,
      r.dream,
      r.caffeine,
      r.alcohol != null ? (r.alcohol ? '있음' : '없음') : '',
      r.herbal_morning ? 'O' : 'X',
      r.herbal_lunch ? 'O' : 'X',
      r.herbal_evening ? 'O' : 'X',
      r.herbal_bedtime ? 'O' : 'X',
      r.western_morning ? 'O' : 'X',
      r.western_lunch ? 'O' : 'X',
      r.western_evening ? 'O' : 'X',
      r.western_bedtime ? 'O' : 'X',
      r.memo,
      r.admin_note,
    ]))
  }

  const csv = '﻿' + rows.join('\r\n')
  const filename = `sleep_${patient?.registration_number ?? id}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
