export type { Database, Json } from "./database";

export interface Patient { id: string; registration_number: string; name: string; birth_date?: string; phone?: string; }

export interface SleepDiary { id: string; patient_id: string; diary_date: string; bedtime?: string; wake_time?: string; sleep_onset_latency?: string; night_awakening_count?: string; sleep_event_memo?: string; sleep_quality?: number; morning_fatigue?: number; daytime_sleepiness?: string; nap_taken: boolean; nap_duration_min?: number; dream?: string; caffeine?: string; alcohol: boolean; condition?: number; memo?: string; herbal_morning?: boolean; herbal_lunch?: boolean; herbal_evening?: boolean; herbal_bedtime?: boolean; western_morning?: boolean; western_lunch?: boolean; western_evening?: boolean; western_bedtime?: boolean; total_sleep_min?: number; deep_sleep_min?: number; light_sleep_min?: number; rem_sleep_min?: number; }

export interface ISIAssessment { id: string; patient_id: string; assessed_at: string; q1: number; q2: number; q3: number; q4: number; q5: number; q6: number; q7: number; total_score: number; }

export type ISISeverity = "없음" | "경미" | "중등도" | "심각";
export function getISISeverity(score: number): ISISeverity { if (score <= 7) return "없음"; if (score <= 14) return "경미"; if (score <= 21) return "중등도"; return "심각"; }

export type SleepEfficiencyLevel = "정상" | "주의" | "불량";
export function getSleepEfficiencyLevel(efficiency: number): SleepEfficiencyLevel { if (efficiency >= 85) return "정상"; if (efficiency >= 70) return "주의"; return "불량"; }

export function calcSleepEfficiency(diary: Pick<SleepDiary, "bedtime" | "wake_time" | "sleep_onset_latency" | "night_awakening_count">): number | null { if (!diary.bedtime || !diary.wake_time) return null; const [bedH, bedM] = diary.bedtime.split(":").map(Number); const [wakeH, wakeM] = diary.wake_time.split(":").map(Number); let totalMinutes = (wakeH * 60 + wakeM) - (bedH * 60 + bedM); if (totalMinutes <= 0) totalMinutes += 24 * 60; const latencyMap: Record<string, number> = { "0~10분":5, "10~30분":20, "30~60분":45, "60분 이상":75 }; const awakeningMap: Record<string, number> = { "없음":0, "1회":15, "2회":30, "3회 이상":45 }; const latency = diary.sleep_onset_latency ? (latencyMap[diary.sleep_onset_latency] ?? 0) : 0; const awakening = diary.night_awakening_count ? (awakeningMap[diary.night_awakening_count] ?? 0) : 0; const actualSleep = totalMinutes - latency - awakening; if (totalMinutes === 0) return null; return Math.round((actualSleep / totalMinutes) * 100); }
