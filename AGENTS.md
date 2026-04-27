# 수면장애 클리닉 환자 앱 — Agent Instructions

## 프로젝트 개요

수면장애 클리닉 환자용 모바일 웹앱 + 관리자 대시보드.
환자가 수면 일지를 작성하고, 원장이 데이터를 관리하는 시스템.

- **프로덕션 URL**: https://patient-sleep-app.vercel.app
- **DB**: Supabase (프로젝트 ID: `aalzgqtydeilklzufxcn`)
- **배포**: Vercel (서울 리전 icn1)

---

## ⚠️ 반드시 읽을 것 — Next.js 주의사항

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

- **버전**: Next.js 16 (App Router, TypeScript)
- `pages/` 디렉토리 사용 금지 — `src/app/` App Router만 사용
- 서버 컴포넌트가 기본값. 클라이언트 기능이 필요한 파일만 `'use client'` 선언
- Route Handler는 `route.ts`에 `export async function GET/POST/PATCH/DELETE` 형태로 작성

---

## 기술 스택

| 항목 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 16 | App Router, TypeScript strict |
| 스타일링 | Tailwind CSS v4 | `tailwind.config.ts` 없음 |
| DB / Auth | Supabase | `@supabase/ssr`, cookie 기반 세션 |
| 차트 | Recharts | `'use client'` 파일에서만 사용 |
| 폰트 | Pretendard Variable | CDN import (globals.css 최상단) |
| 배포 | Vercel | 환경 변수 등록 완료 |

---

## 환경 변수

`.env.local`에 정의 (git 제외, Vercel에 등록됨):

```
NEXT_PUBLIC_SUPABASE_URL=https://aalzgqtydeilklzufxcn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버 전용. 클라이언트 번들에 절대 노출 금지.

---

## 개발 명령어

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드 (TypeScript 검사 포함)
npm run lint     # ESLint
```

코드 작성 후 반드시 `npm run build`로 TypeScript 오류 없음을 확인할 것.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── globals.css                       # Tailwind v4 디자인 토큰 (@theme inline)
│   ├── layout.tsx                        # 루트 레이아웃
│   ├── page.tsx                          # / → /home 리다이렉트
│   ├── login/page.tsx                    # 환자 로그인
│   │
│   ├── (patient)/                        # 환자 보호 라우트 그룹
│   │   ├── layout.tsx                    # BottomTabBar + 하단 패딩
│   │   ├── home/page.tsx                 # 홈 탭
│   │   ├── diary/page.tsx                # 수면 일지 4-Step 폼
│   │   ├── records/page.tsx              # 기록 탭 (수면/효율/검사/ISI)
│   │   ├── prescription/page.tsx         # 처방 탭
│   │   ├── isi/page.tsx                  # ISI 자가진단
│   │   └── qna/
│   │       ├── page.tsx                  # 문의 목록 / 작성
│   │       └── [id]/page.tsx             # 문의 상세
│   │
│   ├── admin/
│   │   ├── page.tsx                      # /admin → /admin/dashboard 리다이렉트
│   │   ├── login/page.tsx                # 관리자 로그인
│   │   └── (dashboard)/
│   │       ├── layout.tsx                # 사이드바 + 관리자 역할 검증
│   │       ├── dashboard/page.tsx        # 통계 대시보드
│   │       ├── patients/
│   │       │   ├── page.tsx              # 환자 목록 + 검색
│   │       │   ├── new/page.tsx          # 환자 등록
│   │       │   └── [id]/
│   │       │       ├── page.tsx          # 환자 상세 + 처방 추가
│   │       │       ├── edit/page.tsx     # 환자 정보 수정
│   │       │       ├── sleep/page.tsx    # 수면 데이터 입력/조회
│   │       │       └── exam/page.tsx     # 검사 결과 입력/조회
│   │       └── qna/page.tsx              # Q&A 관리
│   │
│   └── api/
│       ├── diary/route.ts                # POST: 수면 일지 upsert
│       ├── diary/today/route.ts          # GET: 오늘 일지 + hasPrescription
│       ├── home/summary/route.ts         # GET: 홈 요약
│       ├── medication/check/route.ts     # PATCH: 복약 체크 토글
│       ├── settings/route.ts             # GET/PATCH: 알림 설정
│       ├── prescriptions/route.ts        # GET: 처방 내역
│       ├── isi/route.ts                  # GET/POST: ISI 자가진단
│       ├── qna/route.ts                  # GET/POST: 문의
│       ├── qna/[id]/route.ts             # GET: 문의 상세
│       ├── records/
│       │   ├── sleep/route.ts            # GET: 수면 일지 (7d/30d/90d)
│       │   ├── efficiency/route.ts       # GET: 수면 효율 계산
│       │   ├── exams/[type]/route.ts     # GET: 검사 결과
│       │   └── isi/route.ts              # GET: ISI 이력
│       └── admin/
│           ├── stats/route.ts            # GET: 대시보드 통계
│           ├── patients/route.ts         # GET/POST: 환자 목록/등록
│           ├── patients/[id]/route.ts    # GET/PATCH: 환자 상세/수정
│           ├── patients/[id]/sleep/route.ts       # GET/POST: 수면 데이터
│           ├── patients/[id]/exam/route.ts        # GET/POST: 검사 결과
│           ├── patients/[id]/prescriptions/route.ts        # POST
│           ├── patients/[id]/prescriptions/[pid]/route.ts  # PATCH/DELETE
│           ├── qna/route.ts              # GET: Q&A 목록
│           └── qna/[id]/route.ts         # PATCH: 답변 등록
│
├── components/
│   ├── layout/BottomTabBar.tsx           # 환자 하단 탭바 (5탭)
│   ├── admin/AdminSidebar.tsx            # 관리자 사이드바
│   └── ui/button.tsx                     # CVA 기반 버튼
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # createClient() — 브라우저 전용
│   │   ├── server.ts                     # createClient() + createAdminClient() — 서버 전용
│   │   └── admin-guard.ts                # requireAdmin() 유틸
│   └── utils.ts                          # cn(), calcSleepEfficiency(), getIsiLevel()
│
├── middleware.ts                          # 인증 보호 라우팅
└── types/index.ts                         # DB 타입 인터페이스
```

---

## 코딩 규칙

### Tailwind CSS v4

`tailwind.config.ts` 파일이 없다. 모든 디자인 토큰은 `src/app/globals.css`의 `@theme inline` 블록에 정의되어 있다.

```css
/* 사용 가능한 커스텀 토큰 예시 */
--color-brand-500: #4A90D9      → bg-brand-500, text-brand-500
--color-text-primary: #1A202C   → text-text-primary
--color-bg-secondary: #F5F7FA   → bg-bg-secondary
--color-success: #22C55E        → text-success, bg-success/10
--color-danger: #EF4444         → text-danger
--radius-md: 12px               → rounded-[--radius-md]
--shadow-card: ...              → shadow-[--shadow-card]
```

임의 값 문법 `rounded-[--radius-md]`, `shadow-[--shadow-card]`로 CSS 변수를 직접 참조한다.
Tailwind 표준 클래스(`rounded-lg`, `shadow-md` 등)보다 위 토큰을 우선 사용할 것.

### Supabase 클라이언트 사용 규칙

```typescript
// 서버 컴포넌트 / Route Handler에서
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// 클라이언트 컴포넌트에서 ('use client' 파일)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// admin API Route Handler에서 (service_role 필요 시)
import { createAdminClient } from '@/lib/supabase/server'
const adminClient = createAdminClient()
```

**절대 혼용 금지**: 서버용 `createClient`를 클라이언트 컴포넌트에서 import하면 빌드 에러.

### 인증 패턴

모든 API Route Handler는 다음 패턴으로 인증을 확인한다:

```typescript
// 환자 API
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const { data: role } = await supabase.from('user_roles').select('patient_id').eq('id', user.id).single()
if (!role?.patient_id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

// 이후 role.patient_id로 데이터 조회

// 관리자 API — requireAdmin() 사용
import { requireAdmin } from '@/lib/supabase/admin-guard'
const { error, supabase, user } = await requireAdmin()
if (error) return error
```

### 환자 인증 이메일 변환

환자는 등록번호로 로그인한다. 내부적으로 Supabase Auth 이메일은 다음 형식:
```
{등록번호}@patient.local
// 예: 2024001 → 2024001@patient.local
```

관리자는 실제 이메일로 로그인.

### TypeScript 타입

DB 타입은 `src/types/index.ts`에 정의됨:
- `Patient`, `UserRole`, `SleepDiary`, `TreatmentRecord`
- `ExamResult`, `IsiAssessment`, `Qna`, `Settings`, `SleepDisorder`

Route Handler에서 API 응답 데이터는 별도 인터페이스를 파일 내에 선언해서 사용.

---

## DB 스키마 요약

9개 테이블, RLS 적용됨. `supabase_schema.sql` 참조.

| 테이블 | 주요 컬럼 |
|--------|-----------|
| `patients` | id, registration_number, name, birth_date, phone |
| `user_roles` | id(=auth.uid), role('patient'\|'admin'), patient_id |
| `sleep_disorders` | patient_id, diagnosis, severity('경미'\|'중등도'\|'심각') |
| `sleep_diary` | patient_id, diary_date(UNIQUE per patient), bedtime, wake_time, sleep_quality(1-5), total_sleep_min, deep/light/rem_sleep_min |
| `treatment_records` | patient_id, visit_date, prescription, treatment_notes, next_visit_date |
| `exam_results` | patient_id, exam_date, exam_type('HRV'\|'InBody'\|'QEEG'), result_data(JSONB), summary |
| `isi_assessments` | patient_id, assessed_at, q1~q7(0-4), total_score |
| `qna` | patient_id, question, answer, is_answered, answered_at |
| `settings` | id(=patient_id), push_enabled, diary_remind, med_alarm, qna_alarm |

**RLS 규칙**: 환자는 자신의 데이터만 조회/수정 가능. 관리자는 모든 데이터 접근 가능.

**sleep_diary 고유 제약**: `(patient_id, diary_date)` 복합 유니크 → upsert 시 `onConflict: 'patient_id,diary_date'` 사용.

---

## 핵심 비즈니스 로직

### 수면 효율 계산 (`src/lib/utils.ts`)

```typescript
calcSleepEfficiency(bedtime, wakeTime, onsetLatency, awakeningCount) → number(%)

// 임계값
// ≥ 85% → 정상 (green)
// 70~84% → 주의 (yellow)
// < 70% → 불량 (red)
```

### ISI 점수 레벨 (`src/lib/utils.ts`)

```typescript
getIsiLevel(score) → { label, color, bg }

// 0~7   → 정상
// 8~14  → 경미
// 15~21 → 중등도
// 22~28 → 심각
```

### 처방 유무 판별

`treatment_records` 테이블에 해당 환자의 레코드가 존재하면 `hasPrescription = true`.
처방 환자에게만 수면 일지 Step 4 (복약 체크) UI와 홈 탭 복약 버튼이 표시된다.

---

## UI 패턴

### 로딩 스피너

```tsx
<div className="flex justify-center py-16">
  <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
</div>
```

### 빈 상태 카드

```tsx
<div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-8 text-center">
  <p className="text-4xl mb-3">🌙</p>
  <p className="text-text-muted">데이터가 없습니다.</p>
</div>
```

### 카드 컨테이너

```tsx
<div className="bg-bg-primary rounded-[--radius-md] shadow-[--shadow-card] p-4">
  ...
</div>
```

### 탭 전환 UI

```tsx
<div className="flex gap-1 bg-bg-tertiary rounded-[--radius-sm] p-1">
  <button className="flex-1 py-2 rounded-[6px] text-sm font-medium bg-bg-primary text-brand-600 shadow-[--shadow-card]">
    활성 탭
  </button>
  <button className="flex-1 py-2 rounded-[6px] text-sm font-medium text-text-muted">
    비활성 탭
  </button>
</div>
```

### 입력 필드

```tsx
<input className="w-full px-3 py-2 rounded-[--radius-sm] border border-bg-tertiary bg-bg-secondary text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-brand-400 text-sm" />
```

### Recharts 사용 시 주의

- Recharts 컴포넌트는 반드시 `'use client'` 파일에서만 사용
- `ResponsiveContainer`로 감싸기
- `Tooltip formatter` 타입: `(v) => [string, string]` (명시적 타입 선언 없이)

---

## 미들웨어 라우팅 규칙 (`src/middleware.ts`)

| 조건 | 동작 |
|------|------|
| 비로그인 + `/login`, `/admin/login` 외 페이지 | `/login`으로 리다이렉트 |
| 비로그인 + `/admin/*` | `/admin/login`으로 리다이렉트 |
| 로그인 + `/login` 접근 | `/home`으로 리다이렉트 |
| 로그인 + `/admin/login` 접근 | `/admin/dashboard`로 리다이렉트 |
| API 경로 (`/api/*`) | 미들웨어 체크 없이 통과 (Route Handler에서 직접 인증) |

---

## 남은 작업

- [ ] 관리자 계정 생성 (Supabase Auth → user_roles에 `role='admin'` insert)
- [ ] 실제 환자 데이터 등록 및 E2E 테스트
- [ ] PWA manifest 추가 (`public/manifest.json`, `<link rel="manifest">`)
- [ ] 환자용 비밀번호 변경 기능
