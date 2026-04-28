@AGENTS.md

# 수면장애 클리닉 환자 앱 — 프로젝트 현황

## 개요

수면장애 클리닉 환자용 모바일 웹앱 + 관리자 대시보드.
환자가 수면 일지를 작성하고, 원장이 데이터를 관리하는 시스템.

- **프로덕션 URL**: https://patient-sleep-app.vercel.app
- **배포 플랫폼**: Vercel (서울 리전 icn1)
- **DB**: Supabase (프로젝트 ID: `aalzgqtydeilklzufxcn`)
- **브랜치**: `claude/document-project-status-3Bm9S` → main 머지 후 배포 완료

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
```

Vercel Environment Variables에도 동일하게 등록됨 (Production & Preview).

---

## DB 스키마 (`supabase_schema.sql`)

9개 테이블:

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

**인증 이메일 규칙**: `{등록번호}@patient.local` (환자), 실제 이메일 (관리자)

---

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx                        # 루트 레이아웃
│   ├── page.tsx                          # / → /home 리다이렉트
│   ├── globals.css                       # Tailwind v4 디자인 토큰
│   ├── login/page.tsx                    # 환자 로그인
│   │
│   ├── (patient)/                        # 환자 보호 라우트 그룹
│   │   ├── layout.tsx                    # BottomTabBar + 패딩
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
│   │       ├── layout.tsx                # 관리자 레이아웃 (사이드바 + 역할 검증)
│   │       ├── dashboard/page.tsx        # 대시보드 (통계)
│   │       ├── patients/
│   │       │   ├── page.tsx              # 환자 목록
│   │       │   ├── new/page.tsx          # 환자 등록
│   │       │   └── [id]/
│   │       │       ├── page.tsx          # 환자 상세 + 처방 추가
│   │       │       ├── edit/page.tsx     # 환자 정보 수정
│   │       │       ├── sleep/page.tsx    # 수면 데이터 입력/조회
│   │       │       └── exam/page.tsx     # 검사 결과 입력/조회
│   │       └── qna/page.tsx              # Q&A 관리 (답변 작성)
│   │
│   └── api/
│       ├── diary/route.ts                # POST: 수면 일지 upsert
│       ├── diary/today/route.ts          # GET: 오늘 일지 + hasPrescription
│       ├── home/summary/route.ts         # GET: 홈 요약 데이터
│       ├── medication/check/route.ts     # PATCH: 복약 체크 토글
│       ├── settings/route.ts             # GET/PATCH: 알림 설정
│       ├── prescriptions/route.ts        # GET: 처방 내역
│       ├── isi/route.ts                  # GET/POST: ISI 자가진단
│       ├── qna/route.ts                  # GET/POST: 문의
│       ├── qna/[id]/route.ts             # GET: 문의 상세
│       └── records/
│           ├── sleep/route.ts            # GET: 수면 일지 (7d/30d/90d)
│           ├── efficiency/route.ts       # GET: 수면 효율 계산
│           ├── exams/[type]/route.ts     # GET: 검사 결과
│           └── isi/route.ts              # GET: ISI 이력
│       └── admin/
│           ├── stats/route.ts            # GET: 대시보드 통계
│           ├── patients/route.ts         # GET/POST: 환자 목록/등록
│           ├── patients/[id]/route.ts    # GET/PATCH: 환자 상세/수정
│           ├── patients/[id]/sleep/      # GET/POST: 수면 데이터
│           ├── patients/[id]/exam/       # GET/POST: 검사 결과
│           ├── patients/[id]/prescriptions/         # POST
│           ├── patients/[id]/prescriptions/[pid]/   # PATCH/DELETE
│           ├── qna/route.ts              # GET: Q&A 전체 목록
│           └── qna/[id]/route.ts         # PATCH: 답변 등록
│
├── components/
│   ├── layout/BottomTabBar.tsx           # 환자 하단 탭바 (5탭)
│   ├── admin/AdminSidebar.tsx            # 관리자 사이드바
│   └── ui/button.tsx                     # CVA 기반 버튼 컴포넌트
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # createClient (브라우저)
│   │   ├── server.ts                     # createClient + createAdminClient (서버)
│   │   └── admin-guard.ts                # requireAdmin() 유틸
│   └── utils.ts                          # cn(), calcSleepEfficiency(), getIsiLevel()
│
├── middleware.ts                          # 인증 보호 (환자/관리자 분리)
└── types/index.ts                         # DB 타입 인터페이스
```

---

## 구현 완료 목록

### 환자 앱
- [x] 로그인 (`/login`) — 등록번호 + 비밀번호, `{번호}@patient.local` 변환
- [x] 홈 탭 (`/home`) — 인사말, 오늘 일지 버튼, 복약 체크, 어제 수면 요약, 다음 방문일, 알림 토글
- [x] 수면 일지 4-Step 폼 (`/diary`) — 기본정보 → 수면의 질 → 추가상태 → 복약(처방자만)
- [x] 기록 탭 (`/records`) — 수면/효율/검사/ISI 4개 서브탭 + Recharts 차트
- [x] 처방 탭 (`/prescription`) — 현재 처방 카드 + 지난 처방 아코디언
- [x] ISI 자가진단 (`/isi`) — 7문항 폼 + 점수 추이 차트 + 이력
- [x] 문의 탭 (`/qna`) — 목록/작성/상세 페이지

### 관리자 대시보드
- [x] 관리자 로그인 (`/admin/login`) — 이메일 로그인 + 역할 검증
- [x] 대시보드 (`/admin/dashboard`) — 통계 카드 (전체환자/오늘일지/주간일지/미답변Q&A)
- [x] 환자 목록 (`/admin/patients`) — 테이블, 이름/등록번호 검색
- [x] 환자 등록 (`/admin/patients/new`) — Auth 계정 생성 + DB 연동
- [x] 환자 상세 (`/admin/patients/[id]`) — 기본정보, 진단, 처방 인라인 추가
- [x] 환자 정보 수정 (`/admin/patients/[id]/edit`)
- [x] 수면 데이터 입력 (`/admin/patients/[id]/sleep`) — 날짜별 upsert + 테이블 조회
- [x] 검사 결과 입력 (`/admin/patients/[id]/exam`) — HRV/InBody/QEEG JSON 입력
- [x] Q&A 관리 (`/admin/qna`) — 미답변 필터, 인라인 답변 작성

### 인프라
- [x] Supabase 스키마 (`supabase_schema.sql`) — RLS 적용, 9개 테이블
- [x] Vercel 배포 — https://patient-sleep-app.vercel.app
- [x] 환경 변수 Vercel 등록 (Production & Preview)
- [x] Supabase Auth Redirect URL 등록

---

## 주요 설계 결정

- **Tailwind v4**: `tailwind.config.ts` 없음. `globals.css`의 `@theme inline`에서 모든 디자인 토큰 정의
- **Supabase SSR**: 서버/클라이언트 분리. 서버 컴포넌트에서 `createClient()`, 클라이언트에서 `createClient()` (각각 다른 파일)
- **관리자 가드**: `requireAdmin()` → `user_roles.role === 'admin'` 체크, 모든 admin API에 적용
- **수면 효율**: `calcSleepEfficiency()` 서버사이드 계산, 임계값 ≥85% 정상 / 70~85% 주의 / <70% 위험
- **ISI 레벨**: 0–7 정상 / 8–14 경미 / 15–21 중등도 / 22–28 심각
- **처방 유무**: `treatment_records` 존재 여부로 `hasPrescription` 판별 → 복약 체크 UI 표시

---

## 남은 작업

- [ ] 관리자 계정 Supabase에 직접 생성 (SQL 또는 대시보드)
- [ ] 실제 환자 데이터 등록 테스트
- [ ] PWA manifest 추가 (홈 화면 추가 지원)
- [ ] 비밀번호 변경 기능 (환자용)
