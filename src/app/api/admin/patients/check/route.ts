import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/admin-guard'

export async function GET(request: Request) {
  const { error, supabase } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const registration_number = searchParams.get('registration_number')?.trim()
  if (!registration_number) return NextResponse.json({ available: false })

  const { data } = await supabase
    .from('patients')
    .select('id')
    .eq('registration_number', registration_number)
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
