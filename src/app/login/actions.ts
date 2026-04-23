'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginAction(
  formData: FormData
): Promise<{ error: string } | undefined> {
  const supabase = await createClient()
  const input = (formData.get('registration_number') as string)?.trim()
  const password = formData.get('password') as string

  if (!input || !password) {
    return { error: '등록번호와 비밀번호를 모두 입력해주세요.' }
  }

  const email = input.includes('@') ? input : `${input}@patient.local`

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: '등록번호 또는 비밀번호가 올바르지 않습니다.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (userRole?.role === 'admin') redirect('/admin')
  }

  redirect('/home')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

