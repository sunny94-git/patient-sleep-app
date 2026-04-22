import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PrescriptionClient from './PrescriptionClient'

export default async function PrescriptionPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (!user || authError) redirect('/login')

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('patient_id')
    .eq('id', user.id)
    .single()

  if (!userRole?.patient_id) redirect('/login')

  const { data: records } = await supabase
    .from('treatment_records')
    .select('id, visit_date, prescription, treatment_notes, next_visit_date')
    .eq('patient_id', userRole.patient_id)
    .order('visit_date', { ascending: false })

  return <PrescriptionClient records={records ?? []} />
}
