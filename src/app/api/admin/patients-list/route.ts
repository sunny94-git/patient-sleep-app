import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase
    .from('patients')
    .select('id, name, registration_number')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ patients: data ?? [] })
}
