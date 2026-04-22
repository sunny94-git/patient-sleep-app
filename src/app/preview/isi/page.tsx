import ISIClient from '@/app/(patient)/isi/ISIClient'

const mockHistory = [
  { id: 'i1', assessed_at: '2026-04-22T10:00:00Z', q1: 3, q2: 2, q3: 2, q4: 2, q5: 3, q6: 2, q7: 4, total_score: 18 },
  { id: 'i2', assessed_at: '2026-04-08T10:00:00Z', q1: 2, q2: 2, q3: 2, q4: 2, q5: 2, q6: 2, q7: 3, total_score: 15 },
  { id: 'i3', assessed_at: '2026-03-25T10:00:00Z', q1: 3, q2: 3, q3: 2, q4: 3, q5: 3, q6: 2, q7: 4, total_score: 20 },
  { id: 'i4', assessed_at: '2026-03-11T10:00:00Z', q1: 4, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, total_score: 22 },
  { id: 'i5', assessed_at: '2026-02-25T10:00:00Z', q1: 4, q2: 4, q3: 3, q4: 3, q5: 3, q6: 3, q7: 4, total_score: 24 },
]

export default function PreviewISI() {
  return <ISIClient patientId="preview-patient" history={mockHistory} />
}
