import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase } = await requireAdmin()
  const { id } = await params

  const { error } = await supabase.from('exam_results').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
