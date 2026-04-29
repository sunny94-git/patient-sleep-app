@AGENTS.md

# 수면장애 클리닉 환자 앱 — 프로젝트 현황

## 개요

수면장애 클리닉 환자용 모바일 웹앱 + 관리자 대시보드.
환자가 수면 일지를 작성하고, 원장이 데이터를 관리하는 시스템.

- **프로덕션 URL**: https://patient-sleep-app.vercel.app
- **배포 플랫폼**: Vercel (서울 리전 icn1)
- **DB**: Supabase (프로젝트 ID: `aalzgqtydeilklzufxcn`)
- **관리자 계정**: `admin@clinic.com` (Supabase Auth + user_roles 등록 완료)

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router, TypeScript) |
| 스타일링 | Tailwind CSS v4 (CSS-based config, `@theme inline`) |
| DB / Auth | Supabase (`@supabase/ssr`, cookie 기반 세션) |
| 차트 | Recharts |
| 폰트 | Pretendard Variable (CDN) |
| 배포 | Vercel |

---

## 환경 변수 (`.env.local` — git 제외)

```
NEXT_PUBLIC_SUPABASE_URL=https://aalzgqtydeilklzufxcn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...   # Web Push VAPID 공개키
VAPID_PRIVATE_KEY=...              # Web Push VAPID 개인키 (서버 전용)
```

Vercel Environment Variables에도 동일하게 등록 필요 (Production & Preview).

> ⚠️ VAPID 키 사용을 위해 `push_subscriptions_migration.sql`을 Supabase SQL Editor에서 실행해야 함.

---

## DB 스키마

10개 테이블 (기존 9개 + `push_subscriptions`):

| 테이블 | 설명 |
|--------|------|
| `patients` | 환자 기본 정보 |
| `user_roles` | auth.users ↔ patients 연결, role: `patient` / `admin` |
| `sleep_disorders` | 수면장애 진단 정보 |
| `sleep_diary` | 수면 일지 (환자 작성 + 관리자 입력) |
| `treatment_records` | 처방 내역 |
| `exam_results` | 검사 결과 (HRV / InBody / QEEG) |
| `isi_assessments` | ISI 자가진단 결과 |
| `qna` | 환자 문의 / 원장 답변 |
| `settings` | 알림 설정 |
| `push_subscriptions` | Web Push 구독 정보 (user_id UNIQUE) |

**인증 이메일 규칙**: `{등록번호}@patient.local` (환자), 실제 이메일 (관리자)

> ⚠️ `user_roles` 테이블에 INSERT RLS 정책 없음 — 환자 등록 시 반드시 `adminClient`(service_role)로 삽입해야 함.

---

## 파일 구조

```
src/
├── app/
│   ├── not-found.tsx                     # 전역 404 페이지
│   ├── error.tsx                         # 전역 에러 페이지
│   ├── layout.tsx
│   ├── page.tsx                          # / → 역할별 리다이렉트
│   ├── globals.css
│   ├── login/page.tsx
│   │
│   ├── (patient)/
│   │   ├── error.tsx                     # 환자 앱 에러 페이지
│   │   ├── layout.tsx
│   │   ├── home/page.tsx                 # 홈 탭 (Web Push 구독 포함)
│   │   ├── diary/page.tsx
│   │   ├── records/page.tsx              # 기록 탭 (수면/효율/검사/ISI/복약 5개 서브탭)
│   │   ├── prescription/page.tsx
│   │   ├── isi/page.tsx
│   │   ├── settings/page.tsx
│   │   └── qna/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── login/page.tsx
│   │   └── (dashboard)/
│   │       ├── error.tsx                 # 관리자 에러 페이지
│   │       ├── layout.tsx
│   │       ├── dashboard/page.tsx        # 대시보드 (주의환자 카드 포함)
│   │       ├── patients/
│   │       │   ├── page.tsx              # 환자 목록 (페이지네이션 + 일지 배지)
│   │       │   ├── new/page.tsx          # 환자 등록 (등록번호 중복 확인)
│   │       │   └── [id]/
│   │       │       ├── page.tsx          # 환자 상세 (진단 CRUD + 처방 수정/삭제 + ISI 탭)
│   │       │       ├── edit/page.tsx
│   │       │       ├── sleep/page.tsx
│   │       │       └── exam/page.tsx
│   │       └── qna/page.tsx
│   │
│   └── api/
│       ├── push/subscribe/route.ts       # POST/DELETE: Web Push 구독 등록/해제
│       ├── records/medication/route.ts   # GET: 복약 이력 (최근 N일)
│       ├── [기존 환자 API 동일]
│       └── admin/
│           ├── patients/check/route.ts   # GET: 등록번호 중복 확인
│           ├── patients/[id]/route.ts    # GET/PATCH/DELETE: 환자 상세/수정/삭제
│           ├── patients/[id]/disorders/route.ts       # GET/POST: 진단 목록/추가
│           ├── patients/[id]/disorders/[did]/route.ts # PATCH/DELETE: 진단 수정/삭제
│           ├── patients/[id]/isi/route.ts             # GET: 환자 ISI 이력 (관리자용)
│           ├── patients/[id]/reset-password/route.ts  # POST: 환자 비밀번호 초기화
│           └── [기존 admin API 동일]
│
├── lib/
│   ├── push.ts                           # sendPushToPatient() Web Push 발송 유틸
│   └── supabase/ [기존 동일]
│
└── public/
    ├── sw.js                             # Service Worker (푸시 알림 수신)
    ├── manifest.json
    └── icons/
```

---

## 구현 완료 목록

### 환자 앱
- [x] 로그인 (`/login`)
- [x] 홈 탭 (`/home`) — Web Push 구독 토글 포함
- [x] 수면 일지 4-Step 폼 (`/diary`)
- [x] 기록 탭 (`/records`) — 수면/효율/검사/ISI/**복약** 5개 서브탭
- [x] 처방 탭 (`/prescription`)
- [x] ISI 자가진단 (`/isi`)
- [x] 문의 탭 (`/qna`)
- [x] 설정 탭 (`/settings`) — 비밀번호 변경 + 로그아웃
- [x] 에러 페이지 (`error.tsx`, `not-found.tsx`)

### 관리자 대시보드
- [x] 관리자 로그인 (`/admin/login`)
- [x] 대시보드 (`/admin/dashboard`) — 통계 카드 + **주의환자 카드** (7일 미작성 / 수면효율 저하)
- [x] 환자 목록 (`/admin/patients`) — 검색 + **서버사이드 페이지네이션** + **일지 배지**
- [x] 환자 등록 (`/admin/patients/new`) — **등록번호 중복 확인** 포함
- [x] 환자 상세 (`/admin/patients/[id]`) — **진단 CRUD** + **처방 수정/삭제** + **ISI 이력 탭**
- [x] 환자 정보 수정 / 수면 데이터 / 검사 결과 입력
- [x] Q&A 관리 — 답변 시 **Web Push 알림 발송**
- [x] 환자 삭제 (`DELETE /api/admin/patients/[id]`)
- [x] 환자 비밀번호 초기화 (`POST /api/admin/patients/[id]/reset-password`)

### 인프라
- [x] Supabase 스키마 — RLS 적용, 10개 테이블
- [x] Vercel 배포 + 환경 변수 등록
- [x] PWA manifest + 아이콘
- [x] Web Push (VAPID) — `web-push` 패키지, `public/sw.js` Service Worker
  - Q&A 답변 등록 시 환자에게 푸시 알림 발송
  - `push_subscriptions` 테이블 (별도 migration SQL)

---

## 버그 수정 이력

| 버그 | 원인 | 수정 |
|------|------|------|
| `ERR_TOO_MANY_REDIRECTS` | 미들웨어와 admin layout 간 리다이렉트 루프 | 미들웨어에서 `/admin/login` 자동 리다이렉트 제거, admin layout에서 비-admin signOut 후 리다이렉트 |
| 루트 `/` Next.js 기본 템플릿 노출 | `page.tsx`가 리다이렉트 없이 기본 페이지 렌더링 | `page.tsx`를 역할 기반 리다이렉트로 교체 |
| 환자 등록 후 `/home` 크래시 | `user_roles` INSERT RLS 정책 없어 역할 삽입 실패 | `adminClient`(service_role)로 변경, 실패 시 롤백 추가 |

---

## 주요 설계 결정

- **Tailwind v4**: `tailwind.config.ts` 없음. `globals.css`의 `@theme inline`에서 모든 디자인 토큰 정의
- **Supabase SSR**: 서버/클라이언트 분리. 서버 컴포넌트에서 `createClient()`, 클라이언트에서 `createClient()` (각각 다른 파일)
- **관리자 가드**: `requireAdmin()` → `user_roles.role === 'admin'` 체크, 모든 admin API에 적용
- **user_roles INSERT**: RLS 정책 없음 → 반드시 `adminClient`(service_role) 사용
- **수면 효율**: `calcSleepEfficiency()` 서버사이드 계산, 임계값 ≥85% 정상 / 70~85% 주의 / <70% 위험
- **ISI 레벨**: 0–7 정상 / 8–14 경미 / 15–21 중등도 / 22–28 심각
- **처방 유무**: `treatment_records` 존재 여부로 `hasPrescription` 판별 → 복약 체크 UI 표시
- **Web Push**: VAPID 키 + `web-push` npm 패키지. 구독 정보는 `push_subscriptions` 테이블에 저장. Q&A 답변 등록 시 `src/lib/push.ts`의 `sendPushToPatient()`로 발송. 예약 알림(일지/복약)은 미구현 (cron 인프라 필요)

---

## 남은 작업

- [x] 관리자 수면장애 진단 CRUD ✅
- [x] 처방 수정·삭제 UI ✅
- [x] 관리자에서 환자 ISI 조회 ✅
- [x] 환자 목록 서버사이드 페이지네이션 ✅
- [x] 커스텀 에러 페이지 (`error.tsx`, `not-found.tsx`) ✅
- [x] 환자 비활성화·삭제 + 비밀번호 초기화 ✅
- [x] Web Push 알림 실제 동작 (Q&A 답변 시) ✅
- [x] 대시보드 주의환자 카드 (7일 미작성 / 수면효율 저하) ✅
- [x] 환자 등록 등록번호 중복 확인 ✅
- [x] 기록 탭 복약 이력 탭 ✅
- [ ] 수면 일지 날짜별 수정 (관리자)
- [ ] CSV 데이터 내보내기
- [ ] Q&A 텍스트 검색
- [ ] 비활동 자동 로그아웃
