import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:admin@clinic.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export interface PushPayload {
  title: string
  body: string
  url?: string
}

export async function sendPush(subscription: webpush.PushSubscription, payload: PushPayload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

/** patient_id로 해당 환자에게 푸시 발송 (adminClient 필요) */
export async function sendPushToPatient(
  adminClient: ReturnType<typeof import('./supabase/server').createAdminClient>,
  patientId: string,
  payload: PushPayload,
) {
  const { data: role } = await adminClient
    .from('user_roles')
    .select('id')
    .eq('patient_id', patientId)
    .single()
  if (!role?.id) return

  const { data: sub } = await adminClient
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', role.id)
    .single()
  if (!sub?.subscription) return

  await sendPush(sub.subscription as webpush.PushSubscription, payload)
}
