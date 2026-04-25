# 수면장애 환자 관리 시스템 — 프로젝트 현황

## 프로젝트 개요

**소속:** 원광대학교 광주한방병원 수면장애 클리닉  
**목적:** 외래 진료 후 귀가한 환자의 수면 상태·복약 여부를 재택에서 지속 모니터링하는 웹 기반 플랫폼  
**대상:** 환자(수면 일지·복약 체크·Q&A) + 관리자(전체 환자 대시보드·데이터 입력·Q&A 응대)  
**현재 단계:** 설계 완료 / 구현 미착수

---

## 현재 파일 구조

```
patient-sleep-app/
├── CLAUDE.md                                   ← 이 파일
├── 260422_수면장애_환자관리_PRD.md               ← 전체 제품 요구사항 (PRD)
├── 260422_환자 앱 디자인 시스템.md               ← 환자 앱 디자인 토큰·컴포넌트 가이드
├── 260422_환자 앱 화면별 상세 설계서.md           ← 환자 앱 화면별 API·DB 설계
├── 260423_관리자 대시보드 디자인 시스템.md        ← 관리자 대시보드 디자인 가이드
├── 260423_관리자용 대시보드 화면별 상세 설계서.md  ← 관리자 화면별 API·DB 설계
└── generated-image-*.png                       ← 화면 목업 이미지 (8장)
```

> 실제 Next.js 코드는 아직 없음. 모든 파일이 기획·설계 문서임.

---

## 기술 스택 (확정)

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js (App Router) |
| 스타일링 | Tailwind CSS + shadcn/ui |
| 차트 | Recharts |
| 상태 관리 | Zustand 또는 Redux Toolkit |
| DB / 인증 | Supabase (PostgreSQL + Supabase Auth) |
| 배포 | Vercel |
| 폰트 | Pretendard (한글) + Inter (영문/숫자) |
| 아이콘 | lucide-react |

---

## 디자인 시스템 요약

### 컬러 팔레트 (환자 앱·관리자 대시보드 공유)

| 용도 | HEX |
|------|-----|
| Primary (버튼·강조) | `#4A90D9` (Blue 500) |
| 페이지 배경 | `#F5F7FA` (Gray 50) |
| 카드 배경 | `#FFFFFF` |
| 주 텍스트 | `#1A202C` (Gray 900) |
| 성공 (수면 효율 ≥85%) | `#22C55E` |
| 주의 (70~85%) | `#EAB308` |
| 위험 (<70%, ISI 심각) | `#EF4444` |

### 수면 단계 차트 색상

| 단계 | HEX |
|------|-----|
| 깊은 수면 (Deep) | `#2563EB` |
| 얕은 수면 (Light) | `#60A5FA` |
| REM | `#93C5FD` |
| 깨어있음 | `#BFDBFE` |

---

## DB 스키마 (Supabase / PostgreSQL)

| 테이블 | 역할 |
|--------|------|
| `patients` | 환자 기본 정보 (등록번호·이름·생년월일·연락처) |
| `sleep_disorders` | 진단명·중증도·발병일 |
| `treatment_records` | 처방명·복약 지시·다음 방문일 |
| `sleep_diary` | 수면 일지 (환자 입력) + 웨어러블/PSG 데이터 (관리자 입력) |
| `exam_results` | HRV·InBody·QEEG 검사 결과 (JSONB) |
| `isi_assessments` | ISI 7문항 자가진단 결과 |
| `qna` | 환자 문의 + 관리자 답변 |
| `settings` | 알림 ON/OFF 설정 (기본 OFF) |
| `user_roles` | 환자/관리자 역할 구분 (Supabase Auth 연동) |

**핵심 비즈니스 규칙:**
- 복약 체크 메뉴는 `treatment_records`에 활성 처방이 있는 환자에게만 노출
- 수면 효율 = 실제 수면 시간 ÷ (기상 시간 - 취침 시간) × 100 (프론트 계산)
- ISI 합산 점수는 DB Generated Column (`q1+q2+...+q7`)
- 관리자의 수면 일지 수정 시 `updated_by` + `updated_at` 자동 기록 (환자에게 미노출)

---

## 환자 앱 (모바일 우선, PWA)

### 하단 탭 5개

| 탭 | 핵심 기능 |
|----|-----------|
| 🏠 홈 | 오늘의 수면 일지 작성, 복약 체크, 어제 수면 요약, 알림 설정 |
| 📊 기록 | 수면/효율/검사(HRV·QEEG·InBody)/ISI 서브탭 + 차트 |
| 💊 처방 | 현재 처방 카드 + 지난 처방 이력 |
| 📋 자가진단 | ISI 7문항 입력·제출·점수 이력 그래프 |
| 💬 문의 | Q&A 작성·답변 확인 |

### 수면 일지 입력 플로우 (4 Step)

1. 기본 수면 정보 — 취침·기상 시간, 잠들기까지 시간, 야간 각성
2. 수면의 질 평가 — 만족도·피로도·낮 졸림 (슬라이더·버튼)
3. 추가 상태 기록 — 낮잠·꿈·카페인·음주·컨디션
4. 복약 체크 — 한약·양약 각 4회차 (처방 환자만)

### 인증

- 등록번호 + 비밀번호 로그인
- JWT 액세스 토큰 1시간, 리프레시 토큰 7일
- 비활동 30분 자동 로그아웃

---

## 관리자 대시보드 (데스크탑 우선)

### 사이드바 메뉴 7개

| 메뉴 | 핵심 기능 |
|------|-----------|
| 📊 대시보드 | 일지 미작성·복약 순응도↓·재방문 임박·미답변 Q&A 카드 + 미활동 환자 알림 |
| 👥 환자 목록 | 전체 환자 테이블, 검색·필터·정렬, CSV 내보내기 |
| 🔍 환자 상세 | 수면 차트, 복약 캘린더, 검사 결과, ISI 이력, 수면 일지 수정 |
| ✏️ 환자 등록/수정 | 신규 환자 등록, 진단·처방·재방문 일정 입력 |
| 📋 수면 데이터 입력 | 웨어러블/PSG 측정값 (총 수면·깊은·얕은·REM) 입력 |
| 🔬 검사 결과 입력 | HRV·QEEG·InBody 수치 + 원장 코멘트 입력 |
| 💬 Q&A 관리 | 전체 문의 목록, 미답변 우선 필터, 답변 작성 |

### 인증

- 이메일 + 비밀번호 + 2FA OTP
- 비활동 15분 자동 로그아웃

---

## API 구조 요약

### 환자용 API (`/api/...`)

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
GET    /api/home/summary
PATCH  /api/medication/check
GET    /api/settings
PATCH  /api/settings
POST   /api/diary
GET    /api/diary/today
PUT    /api/diary/:id
GET    /api/records/sleep
GET    /api/records/efficiency
GET    /api/records/exams/hrv
GET    /api/records/exams/qeeg
GET    /api/records/exams/inbody
GET    /api/records/isi
GET    /api/prescriptions/current
GET    /api/prescriptions/history
POST   /api/isi/submit
GET    /api/isi/history
GET    /api/isi/latest
GET    /api/qna
GET    /api/qna/:id
POST   /api/qna
```

### 관리자용 API (`/api/admin/...`)

```
POST   /api/auth/admin/login
POST   /api/auth/admin/verify-otp
GET    /api/admin/dashboard/summary
GET    /api/admin/dashboard/inactive
GET    /api/admin/dashboard/visits
GET    /api/admin/dashboard/low-efficiency
GET    /api/admin/patients
POST   /api/admin/patients
GET    /api/admin/patients/:id
PUT    /api/admin/patients/:id
DELETE /api/admin/patients/:id
POST   /api/admin/patients/:id/prescription
GET    /api/admin/patients/:id/sleep
GET    /api/admin/patients/:id/efficiency
GET    /api/admin/patients/:id/medication
GET    /api/admin/patients/:id/exams/:type
GET    /api/admin/patients/:id/isi
PUT    /api/admin/diary/:diaryId
POST   /api/admin/sleep-data
PUT    /api/admin/sleep-data/:patientId/:date
POST   /api/admin/exams
PUT    /api/admin/exams/:id
DELETE /api/admin/exams/:id
GET    /api/admin/qna
GET    /api/admin/qna/:id
POST   /api/admin/qna/:id/answer
PUT    /api/admin/qna/:id/answer
```

---

## 권장 Next.js 디렉토리 구조 (구현 시작 전 참고)

```
src/
├── app/
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── (patient)/                  # 환자 인증 그룹
│   │   ├── layout.tsx              # 하단 탭 내비게이션
│   │   ├── home/page.tsx
│   │   ├── diary/page.tsx
│   │   ├── records/page.tsx
│   │   ├── prescription/page.tsx
│   │   ├── isi/page.tsx
│   │   └── qna/[id]/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   └── (dashboard)/            # 관리자 인증 그룹
│   │       ├── layout.tsx          # 사이드바
│   │       ├── dashboard/page.tsx
│   │       ├── patients/page.tsx
│   │       ├── patients/[id]/page.tsx
│   │       ├── sleep-data/page.tsx
│   │       ├── exams/page.tsx
│   │       └── qna/page.tsx
│   └── api/
│       ├── auth/
│       ├── admin/
│       └── ...
├── components/
│   ├── ui/                         # shadcn/ui
│   ├── charts/                     # Recharts 래퍼
│   ├── forms/
│   ├── admin/
│   └── layout/
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   └── sleep-utils.ts              # 수면 효율 계산
└── types/index.ts
```

---

## 개발 단계 현황

| Phase | 내용 | 상태 |
|-------|------|------|
| 기획·설계 | PRD, 디자인 시스템, 화면별 상세 설계서 | ✅ 완료 |
| Phase 1 | Next.js 프로젝트 생성, Supabase 스키마, 인증 구현 | ⬜ 미착수 |
| Phase 2 | 환자 앱 (홈·기록·처방·자가진단·문의) | ⬜ 미착수 |
| Phase 3 | 관리자 대시보드 (전 메뉴) | ⬜ 미착수 |
| Phase 4 | 테스트·보안 점검·Vercel 배포 | ⬜ 미착수 |

---

## 보안 요구사항 (구현 시 필수)

- Supabase RLS: 환자는 `patient_id = auth.uid()` 조건으로 본인 데이터만 접근
- 개인정보(이름·생년월일·연락처) AES-256 암호화 저장
- 로그인 5회 실패 시 10분 잠금
- Rate Limiting 적용
- 관리자 모든 조회·수정·삭제 감사 로그 1년 이상 보존
- 환경변수로 API 키·DB 접속 정보 관리 (하드코딩 금지)

---

## ISI 점수 해석 기준

| 점수 | 단계 | 색상 |
|------|------|------|
| 0 ~ 7 | 없음 | 🟢 Green |
| 8 ~ 14 | 경미 | 🟡 Yellow |
| 15 ~ 21 | 중등도 | 🟠 Orange |
| 22 ~ 28 | 심각 | 🔴 Red |

## 수면 효율 기준

| 수치 | 상태 | 색상 |
|------|------|------|
| ≥ 85% | 정상 | 🟢 Green (`#22C55E`) |
| 70 ~ 85% | 주의 | 🟡 Yellow (`#EAB308`) |
| < 70% | 불량 | 🔴 Red (`#EF4444`) |
