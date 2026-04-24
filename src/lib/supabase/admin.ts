import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!roleRow || roleRow.role !== 'admin') redirect('/login')

  return { supabase, user }
}

export async function requirePatient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role, patient_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!roleRow || roleRow.role !== 'patient' || !roleRow.patient_id) redirect('/login')

  return { supabase, user, patientId: roleRow.patient_id }
}
