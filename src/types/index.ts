export type UserRole = 'patient' | 'admin'

export interface Patient {
  id: string
  registration_number: string
  name: string
  birth_date?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface SleepDisorder {
  id: string
  patient_id: string
  diagnosis: string
  severity?: '경미' | '중등도' | '심각'
  onset_date?: string
  notes?: string
  created_at: string
}

export interface TreatmentRecord {
  id: string
  patient_id: string
  visit_date?: string
  prescription?: string
  treatment_notes?: string
  next_visit_date?: string
  created_by?: string
  created_at: string
}

export interface SleepDiary {
  id: string
  patient_id: string
  diary_date: string
  bedtime?: string
  wake_time?: string
  sleep_onset_latency?: string
  night_awakening_count?: string
  sleep_event_memo?: string
  sleep_quality?: number
  morning_fatigue?: number
  daytime_sleepiness?: string
  nap_taken: boolean
  nap_duration_min?: number
  dream?: string
  caffeine?: string
  alcohol: boolean
  condition?: number
  memo?: string
  herbal_morning?: boolean
  herbal_lunch?: boolean
  herbal_evening?: boolean
  herbal_bedtime?: boolean
  western_morning?: boolean
  western_lunch?: boolean
  western_evening?: boolean
  western_bedtime?: boolean
  total_sleep_min?: number
  deep_sleep_min?: number
  light_sleep_min?: number
  rem_sleep_min?: number
  admin_note?: string
  created_at: string
  updated_by?: string
  updated_at?: string
}

export interface ExamResult {
  id: string
  patient_id: string
  exam_date: string
  exam_type: 'HRV' | 'InBody' | 'QEEG'
  result_data?: Record<string, unknown>
  summary?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface IsiAssessment {
  id: string
  patient_id: string
  assessed_at: string
  q1?: number
  q2?: number
  q3?: number
  q4?: number
  q5?: number
  q6?: number
  q7?: number
  total_score?: number
  created_at: string
}

export interface Qna {
  id: string
  patient_id: string
  question: string
  answer?: string
  is_answered: boolean
  answered_by?: string
  answered_at?: string
  created_at: string
}

export interface Settings {
  id: string
  push_enabled: boolean
  diary_remind: boolean
  med_alarm: boolean
  qna_alarm: boolean
  created_at: string
  updated_at: string
}
