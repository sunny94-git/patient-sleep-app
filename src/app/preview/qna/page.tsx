import QnAClient from '@/app/(patient)/qna/QnAClient'

const mockItems = [
  {
    id: 'q1',
    question: '약 복용 시간 문의입니다. 식전에 먹어도 되나요?',
    answer: '식후 30분에 복용해 주세요. 공복에 드시면 속이 쓰릴 수 있습니다.',
    is_answered: true,
    answered_at: '2026-04-19T09:00:00Z',
    created_at: '2026-04-18T14:00:00Z',
  },
  {
    id: 'q2',
    question: '수면 중 갑자기 경련 증상이 나타났어요. 괜찮은 건가요?',
    answer: null,
    is_answered: false,
    answered_at: null,
    created_at: '2026-04-20T22:00:00Z',
  },
]

export default function PreviewQnA() {
  return <QnAClient initialItems={mockItems} />
}
