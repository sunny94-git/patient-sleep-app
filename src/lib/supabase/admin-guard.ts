import { createClient } from './server'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), supabase, user: null }

  const { data: role } = await supabase.from('user_roles').select('role').eq('id', user.id).single()
  if (role?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), supabase, user: null }

  return { error: null, supabase, user }
}
