import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

export async function GET() {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const [
    { count: totalPatients },
    { count: diaryToday },
    { count: diaryWeek },
    { count: unansweredQna },
  ] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }),
    supabase.from('sleep_diary').select('id', { count: 'exact', head: true }).eq('diary_date', today),
    supabase.from('sleep_diary').select('id', { count: 'exact', head: true }).gte('diary_date', weekAgo),
    supabase.from('qna').select('id', { count: 'exact', head: true }).eq('is_answered', false),
  ])

  return NextResponse.json({ totalPatients, diaryToday, diaryWeek, unansweredQna })
}
