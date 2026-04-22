import PrescriptionClient from '@/app/(patient)/prescription/PrescriptionClient'

const mockRecords = [
  {
    id: 'r1',
    visit_date: '2026-04-01',
    prescription: '가감귀비탕\n아침 식후 30분 1포\n저녁 식후 30분 1포',
    treatment_notes: '수면 유도 목적으로 처방. 2주 후 경과 확인 예정.\n수면 전 따뜻한 물과 함께 복용하세요. 상태 변화 시 병원에 연락 바랍니다.',
    next_visit_date: '2026-04-29',
  },
  {
    id: 'r2',
    visit_date: '2026-03-01',
    prescription: '청심온담탕\n아침 식후 30분 1포\n점심 식후 30분 1포\n저녁 식후 30분 1포',
    treatment_notes: '불안 및 수면 개선 목적. 속쓰림 증상 발생 시 중단.',
    next_visit_date: '2026-03-28',
  },
  {
    id: 'r3',
    visit_date: '2026-02-01',
    prescription: '가미온담탕\n아침 식후 30분 1포\n저녁 식후 30분 1포',
    treatment_notes: '초기 처방. 수면 패턴 개선 관찰.',
    next_visit_date: '2026-02-28',
  },
]

export default function PreviewPrescription() {
  return <PrescriptionClient records={mockRecords} />
}
