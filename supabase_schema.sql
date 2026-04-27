-- ============================================================
-- 수면장애 클리닉 환자 앱 — Supabase DB 초기화 스크립트
-- Supabase SQL Editor에서 전체 복사 후 실행하세요.
-- ============================================================

-- 0. UUID 확장
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. 테이블 생성
-- ============================================================

-- 환자 기본 정보
create table if not exists public.patients (
  id               uuid primary key default uuid_generate_v4(),
  registration_number text not null unique,
  name             text not null,
  birth_date       date,
  phone            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- auth.users ↔ patients 연결 (권한 테이블)
create table if not exists public.user_roles (
  id               uuid primary key references auth.users(id) on delete cascade,
  role             text not null default 'patient' check (role in ('patient', 'admin')),
  patient_id       uuid references public.patients(id) on delete set null,
  created_at       timestamptz not null default now()
);

-- 수면장애 진단 정보
create table if not exists public.sleep_disorders (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  diagnosis   text not null,
  severity    text check (severity in ('경미', '중등도', '심각')),
  onset_date  date,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 수면 일지
create table if not exists public.sleep_diary (
  id                     uuid primary key default uuid_generate_v4(),
  patient_id             uuid not null references public.patients(id) on delete cascade,
  diary_date             date not null,
  bedtime                text,
  wake_time              text,
  sleep_onset_latency    text,
  night_awakening_count  text,
  sleep_event_memo       text,
  sleep_quality          int  check (sleep_quality  between 1 and 5),
  morning_fatigue        int  check (morning_fatigue between 1 and 5),
  daytime_sleepiness     text,
  nap_taken              boolean not null default false,
  nap_duration_min       int,
  dream                  text,
  caffeine               text,
  alcohol                boolean not null default false,
  condition              int  check (condition between 1 and 5),
  memo                   text,
  herbal_morning         boolean,
  herbal_lunch           boolean,
  herbal_evening         boolean,
  herbal_bedtime         boolean,
  western_morning        boolean,
  western_lunch          boolean,
  western_evening        boolean,
  western_bedtime        boolean,
  total_sleep_min        int,
  deep_sleep_min         int,
  light_sleep_min        int,
  rem_sleep_min          int,
  admin_note             text,
  created_at             timestamptz not null default now(),
  updated_by             uuid references auth.users(id),
  updated_at             timestamptz,
  unique (patient_id, diary_date)
);

-- 진료 기록 / 처방
create table if not exists public.treatment_records (
  id               uuid primary key default uuid_generate_v4(),
  patient_id       uuid not null references public.patients(id) on delete cascade,
  visit_date       date,
  prescription     text,
  treatment_notes  text,
  next_visit_date  date,
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now()
);

-- 검사 결과 (HRV / InBody / QEEG)
create table if not exists public.exam_results (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  exam_date   date not null,
  exam_type   text not null check (exam_type in ('HRV', 'InBody', 'QEEG')),
  result_data jsonb,
  summary     text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ISI 자가진단
create table if not exists public.isi_assessments (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  assessed_at timestamptz not null default now(),
  q1          int check (q1 between 0 and 4),
  q2          int check (q2 between 0 and 4),
  q3          int check (q3 between 0 and 4),
  q4          int check (q4 between 0 and 4),
  q5          int check (q5 between 0 and 4),
  q6          int check (q6 between 0 and 4),
  q7          int check (q7 between 0 and 4),
  total_score int,
  created_at  timestamptz not null default now()
);

-- Q&A 문의
create table if not exists public.qna (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  question    text not null,
  answer      text,
  is_answered boolean not null default false,
  answered_by uuid references auth.users(id),
  answered_at timestamptz,
  created_at  timestamptz not null default now()
);

-- 알림 설정
create table if not exists public.settings (
  id           uuid primary key references auth.users(id) on delete cascade,
  push_enabled boolean not null default false,
  diary_remind boolean not null default false,
  med_alarm    boolean not null default false,
  qna_alarm    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- 2. updated_at 자동 갱신 트리거
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists patients_updated_at       on public.patients;
drop trigger if exists sleep_disorders_updated_at on public.sleep_disorders;
drop trigger if exists exam_results_updated_at    on public.exam_results;
drop trigger if exists settings_updated_at        on public.settings;

create trigger patients_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

create trigger sleep_disorders_updated_at
  before update on public.sleep_disorders
  for each row execute function public.set_updated_at();

create trigger exam_results_updated_at
  before update on public.exam_results
  for each row execute function public.set_updated_at();

create trigger settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. Row Level Security 활성화
-- ============================================================

alter table public.patients          enable row level security;
alter table public.user_roles        enable row level security;
alter table public.sleep_disorders   enable row level security;
alter table public.sleep_diary       enable row level security;
alter table public.treatment_records enable row level security;
alter table public.exam_results      enable row level security;
alter table public.isi_assessments   enable row level security;
alter table public.qna               enable row level security;
alter table public.settings          enable row level security;

-- ============================================================
-- 4. RLS 정책
-- ============================================================

-- user_roles
drop policy if exists "본인 역할 조회" on public.user_roles;
create policy "본인 역할 조회"
  on public.user_roles for select
  using (auth.uid() = id);

-- patients
drop policy if exists "환자 본인 조회"       on public.patients;
drop policy if exists "관리자 환자 전체 조회" on public.patients;
drop policy if exists "관리자 환자 전체 관리" on public.patients;
create policy "환자 본인 조회"
  on public.patients for select
  using (id in (select patient_id from public.user_roles where id = auth.uid()));

create policy "관리자 환자 전체 조회"
  on public.patients for select
  using (exists (select 1 from public.user_roles where id = auth.uid() and role = 'admin'));

create policy "관리자 환자 전체 관리"
  on public.patients for all
  using (exists (select 1 from public.user_roles where id = auth.uid() and role = 'admin'));

-- sleep_disorders
drop policy if exists "환자 진단정보 조회"       on public.sleep_disorders;
drop policy if exists "관리자 진단정보 전체 관리" on public.sleep_disorders;
create policy "환자 진단정보 조회"
  on public.sleep_disorders for select
  using (patient_id in (select patient_id from public.user_roles where id = auth.uid()));

create policy "관리자 진단정보 전체 관리"
  on public.sleep_disorders for all
  using (exists (select 1 from public.user_roles where id = auth.uid() and role = 'admin'));

-- sleep_diary
drop policy if exists "환자 본인 일지 관리" on public.sleep_diary;
drop policy if exists "관리자 일지 전체 조회" on public.sleep_diary;
drop policy if exists "관리자 일지 수정"   on public.sleep_diary;
drop policy if exists "관리자 일지 입력"   on public.sleep_diary;
create policy "환자 본인 일지 관리"
  on public.sleep_diary for all
  using (patient_id in (select patient_id from public.user_roles where id = auth.uid()));

create policy "관리자 일지 전체 조회"
  on public.sleep_diary for select
  using (exists (select 1 from public.user_roles where id = auth.uid() and role = 'admin'));

create policy "관리자 일지 수정"
  on public.sleep_diary for update
  using (exists (select 1 from public.user_roles where id = auth.uid() and role = 'admin'));

create policy "관리자 일지 입력"
  on public.sleep_diary for insert
  with check (exists (select 1 from public.user_roles where id = auth.uid() and role = 'admin'));

-- treatment_records
drop policy if exists "환자 처방 조회"       on public.treatment_records;
drop policy if exists "관리자 처방 전체 관리" on public.treatment_records;
create policy "환자 처방 조회"
  on public.treatment_records for select
  using (patient_id in (select patient_id from public.user_roles where id = auth.uid()));

create policy "관리자 처방 전체 관리"
  on public.treatment_records for all
  using (exists (select 1 from public.user_roles where id = auth.uid() and role = 'admin'));

-- exam_results
drop policy if exists "환자 검사결과 조회"       on public.exam_results;
drop policy if exists "관리자 검사결과 전체 관리" on public.exam_results;
create policy "환자 검사결과 조회"
  on public.exam_results for select
  using (patient_id in (select patient_id from public.user_roles where id = auth.uid()));

create policy "관리자 검사결과 전체 관리"
  on public.exam_results for all
  using (exists (select 1 from public.user_roles where id = auth.uid() and role = 'admin'));

-- isi_assessments
drop policy if exists "환자 ISI 관리"     on public.isi_assessments;
drop policy if exists "관리자 ISI 전체 조회" on public.isi_assessments;
create policy "환자 ISI 관리"
  on public.isi_assessments for all
  using (patient_id in (select patient_id from public.user_roles where id = auth.uid()));

create policy "관리자 ISI 전체 조회"
  on public.isi_assessments for select
  using (exists (select 1 from public.user_roles where id = auth.uid() and role = 'admin'));

-- qna
drop policy if exists "환자 본인 문의 관리" on public.qna;
drop policy if exists "관리자 문의 전체 관리" on public.qna;
create policy "환자 본인 문의 관리"
  on public.qna for all
  using (patient_id in (select patient_id from public.user_roles where id = auth.uid()));

create policy "관리자 문의 전체 관리"
  on public.qna for all
  using (exists (select 1 from public.user_roles where id = auth.uid() and role = 'admin'));

-- settings
drop policy if exists "본인 설정 관리" on public.settings;
create policy "본인 설정 관리"
  on public.settings for all
  using (auth.uid() = id);

-- ============================================================
-- 5. 계정 등록 가이드
-- ============================================================

-- [환자 계정 등록]
-- 1) Supabase Dashboard > Authentication > Users > "Add user"
--    Email: {등록번호}@patient.local  (예: 20240001@patient.local)
--    Password: 초기 비밀번호 설정
--    → 생성 후 user UUID 복사
--
-- 2) SQL Editor에서 실행:
-- insert into public.patients (registration_number, name, birth_date, phone)
-- values ('20240001', '홍길동', '1980-01-01', '010-1234-5678');
--
-- insert into public.user_roles (id, role, patient_id)
-- values (
--   '{복사한 user UUID}',
--   'patient',
--   (select id from public.patients where registration_number = '20240001')
-- );

-- [관리자 계정 등록]
-- 1) Supabase Dashboard > Authentication > Users > "Add user"
--    Email: admin@wku-sleep.clinic  (실제 이메일로 변경)
--    Password: 강력한 비밀번호 설정
--    → 생성 후 user UUID 복사
--
-- 2) SQL Editor에서 실행:
-- insert into public.user_roles (id, role)
-- values ('{복사한 user UUID}', 'admin');
