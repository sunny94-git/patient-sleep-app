import DiaryCalendarClient from '@/app/(patient)/diary/DiaryCalendarClient'

export default function PreviewDiaryPage() {
  return <DiaryCalendarClient patientId="preview" initialDiaries={[]} />
}
