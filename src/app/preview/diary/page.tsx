import DiaryForm from '@/app/(patient)/diary/DiaryForm'

export default function PreviewDiary() {
  return (
    <DiaryForm
      patientId="preview-patient"
      today="2026-04-22"
      existingDiary={null}
      hasPrescription={true}
    />
  )
}
