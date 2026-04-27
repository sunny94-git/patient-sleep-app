import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

export async function GET() {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { data } = await supabase
    .from('qna')
    .select(`
      id, question, answer, is_answered, answered_at, created_at,
      patients ( name, registration_number )
    `)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}
