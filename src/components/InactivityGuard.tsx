'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

export default function InactivityGuard({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const reset = () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        await supabase.auth.signOut()
        router.push(redirectTo)
      }, TIMEOUT_MS)
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      if (timer.current) clearTimeout(timer.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [router, redirectTo])

  return null
}
