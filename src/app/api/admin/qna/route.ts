import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('user_roles').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? 'all'
  const search = searchParams.get('search') ?? ''

  let query = supabase
    .from('qna')
    .select('id, question, answer, is_answered, created_at, answered_at, patient_id, patients(name, registration_number)')
    .order('created_at', { ascending: false })

  if (status === 'pending') query = query.eq('is_answered', false)
  if (status === 'answered') query = query.eq('is_answered', true)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let filtered = data ?? []
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        (item.patients as { name: string } | null)?.name?.toLowerCase().includes(q)
    )
  }

  return NextResponse.json({ items: filtered })
}
