import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: role } = await supabase.from('user_roles').select('role').eq('id', user.id).single()
  if (role?.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('patients')
    .select('id, name, registration_number')
    .order('name')

  return NextResponse.json({ patients: data ?? [] })
}
