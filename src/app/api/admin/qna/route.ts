import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { supabase } = await requireAdmin()
  const url = new URL(req.url)
  const filter = url.searchParams.get('filter')

  let q = supabase
    .from('qna')
    .select('*, patients(name, registration_number)')
    .order('created_at', { ascending: false })

  if (filter === 'unanswered') q = q.eq('is_answered', false)
  if (filter === 'answered') q = q.eq('is_answered', true)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data ?? [] })
}
