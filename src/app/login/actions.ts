'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인에 실패했습니다.' }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (roleRow?.role === 'admin') redirect('/admin/dashboard')
  redirect('/home')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
