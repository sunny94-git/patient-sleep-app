import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user } = await requireAdmin()
  const { id } = await params
  const body = await req.json()

  const { data, error } = await supabase
    .from('sleep_diary')
    .update({
      admin_note: body.admin_note ?? null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ record: data })
}
