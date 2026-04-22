'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginAction(
  formData: FormData
): Promise<{ error: string } | undefined> {
  const supabase = await createClient()
  const registrationNumber = (formData.get('registration_number') as string)?.trim()
  const password = formData.get('password') as string

  if (!registrationNumber || !password) {
    return { error: '등록번호와 비밀번호를 모두 입력해주세요.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: `${registrationNumber}@patient.local`,
    password,
  })

  if (error) {
    return { error: '등록번호 또는 비밀번호가 올바르지 않습니다.' }
  }

  redirect('/home')
}
