import RecordsClient from '@/app/(patient)/records/RecordsClient'

const mockDiaries = [
  { id: '1', diary_date: '2026-04-22', bedtime: '23:00', wake_time: '06:30', sleep_onset_latency: '10~30분', night_awakening_count: '없음', sleep_quality: 5, condition: 4, total_sleep_min: 420, deep_sleep_min: 90, light_sleep_min: 210, rem_sleep_min: 90 },
  { id: '2', diary_date: '2026-04-21', bedtime: '23:30', wake_time: '07:00', sleep_onset_latency: '30~60분', night_awakening_count: '1회', sleep_quality: 3, condition: 3, total_sleep_min: 390, deep_sleep_min: 70, light_sleep_min: 200, rem_sleep_min: 80 },
  { id: '3', diary_date: '2026-04-20', bedtime: '00:00', wake_time: '07:00', sleep_onset_latency: '60분 이상', night_awakening_count: '2회', sleep_quality: 2, condition: 2, total_sleep_min: 330, deep_sleep_min: 50, light_sleep_min: 180, rem_sleep_min: 60 },
  { id: '4', diary_date: '2026-04-19', bedtime: '22:30', wake_time: '06:00', sleep_onset_latency: '0~10분', night_awakening_count: '없음', sleep_quality: 5, condition: 5, total_sleep_min: 450, deep_sleep_min: 110, light_sleep_min: 220, rem_sleep_min: 100 },
  { id: '5', diary_date: '2026-04-18', bedtime: '23:00', wake_time: '06:30', sleep_onset_latency: '10~30분', night_awakening_count: '1회', sleep_quality: 4, condition: 4, total_sleep_min: 400, deep_sleep_min: 80, light_sleep_min: 210, rem_sleep_min: 85 },
  { id: '6', diary_date: '2026-04-17', bedtime: '01:00', wake_time: '08:00', sleep_onset_latency: '30~60분', night_awakening_count: '3회 이상', sleep_quality: 1, condition: 2, total_sleep_min: 360, deep_sleep_min: 40, light_sleep_min: 200, rem_sleep_min: 70 },
  { id: '7', diary_date: '2026-04-16', bedtime: '23:00', wake_time: '07:00', sleep_onset_latency: '10~30분', night_awakening_count: '없음', sleep_quality: 4, condition: 4, total_sleep_min: 420, deep_sleep_min: 100, light_sleep_min: 215, rem_sleep_min: 90 },
]

const mockExams = [
  { id: 'e1', exam_date: '2026-04-15', exam_type: 'HRV', summary: 'SDNN 정상 범위, 자율신경 균형 양호. 스트레스 지수 소폭 상승 추세 관찰됨.', result_data: { SDNN: '42ms', RMSSD: '28ms', LF_HF: '1.8', 스트레스지수: '48' } },
  { id: 'e2', exam_date: '2026-03-10', exam_type: 'HRV', summary: '전반적 자율신경 기능 저하 소견. 추적 관찰 권고.', result_data: { SDNN: '35ms', RMSSD: '22ms', LF_HF: '2.1', 스트레스지수: '62' } },
  { id: 'e3', exam_date: '2026-04-15', exam_type: 'InBody', summary: '체지방률 정상, 골격근량 양호. 수분 균형 유지.', result_data: { 체중: '65.2kg', 골격근량: '28.5kg', 체지방률: '18.2%', BMI: '22.3' } },
]

const mockIsiList = [
  { id: 'i1', assessed_at: '2026-04-22T10:00:00Z', total_score: 18 },
  { id: 'i2', assessed_at: '2026-04-08T10:00:00Z', total_score: 15 },
  { id: 'i3', assessed_at: '2026-03-25T10:00:00Z', total_score: 20 },
  { id: 'i4', assessed_at: '2026-03-11T10:00:00Z', total_score: 22 },
  { id: 'i5', assessed_at: '2026-02-25T10:00:00Z', total_score: 24 },
]

export default function PreviewRecords() {
  return <RecordsClient diaries={mockDiaries} exams={mockExams} isiList={mockIsiList} />
}
