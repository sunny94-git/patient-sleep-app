import HomeClient from '@/app/(patient)/home/HomeClient'

const MOCK = {
  patient: { id: 'preview', name: '홍길동', registration_number: 'P-0001' },
  todayDiary: null,
  latestIsi: null,
  nextVisit: null,
  settings: { push_enabled: true, diary_remind: true, med_alarm: true, qna_alarm: true },
}

export default function PreviewHomePage() {
  return <HomeClient {...MOCK} />
}
