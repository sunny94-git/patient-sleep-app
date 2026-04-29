-- push_subscriptions 테이블 생성
-- Supabase SQL Editor에서 실행하세요.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own subscription" ON public.push_subscriptions;
CREATE POLICY "Users manage own subscription"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id);
