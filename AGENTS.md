# 수면장애 클리닉 환자 앱 — Codex 인수인계 문서

> 이 문서는 Codex(또는 다른 AI 에이전트)가 프로젝트에 처음 투입됐을 때  
> 맥락 파악 없이 바로 개발을 이어갈 수 있도록 작성된 인수인계 문서입니다.  
> API 키·비밀번호·실제 환자정보 등 민감한 값은 이 문서에 기록하지 않습니다.

---

## 1. 프로젝트 개요

### 한 줄 요약

수면장애 클리닉 환자가 스마트폰으로 수면 일지를 기록하고, 원장이 웹에서 환자 데이터를 관리하는 **모바일 우선 풀스택 웹앱**.

### 배경과 목적

수면장애 클리닉에서는 환자의 매일 수면 상태, 복약 이력, 검사 결과를 꾸준히 추적해야 한다. 기존에는 종이 설문지나 카카오톡 등 비공식 채널로 수집하던 데이터를 디지털화하여:

- 환자가 매일 앱으로 수면 일지를 작성
- 원장이 대시보드에서 전체 환자 데이터를 한눈에 관리
- 검사 결과(HRV·InBody·QEEG)와 처방 이력을 체계적으로 기록

하는 시스템을 구축하는 것이 목표다.

### 서비스 구성

| 구분 | 대상 | 접근 경로 |
|------|------|-----------|
| 환자 앱 | 클리닉 등록 환자 | `https://patient-sleep-app.vercel.app/` |
| 관리자 대시보드 | 원장(관리자) | `https://patient-sleep-app.vercel.app/admin` |

두 서비스는 **같은 Next.js 앱** 안에 라우트 그룹으로 분리되어 있으며, Supabase RLS(Row Level Security)로 데이터 접근 권한을 구분한다.

### 주요 정보

| 항목 | 내용 |
|------|------|
| 프로덕션 URL | `https://patient-sleep-app.vercel.app` |
| 배포 플랫폼 | Vercel (서울 리전 `icn1`) |
| 데이터베이스 | Supabase (PostgreSQL + Auth + RLS) |
| Supabase 프로젝트 ID | `aalzgqtydeilklzufxcn` |
| 현재 작업 브랜치 | `claude/document-project-status-3Bm9S` |
| 기본(배포) 브랜치 | `main` |

### 개발 현황

환자 앱 전체 기능과 관리자 대시보드가 구현 완료됐으며, Vercel 배포까지 완료된 상태다.  
남은 작업은 관리자 계정 최초 생성, PWA 지원, 환자용 비밀번호 변경 기능 등 후속 작업이다.

---

## 2. 환자 앱 주요 기능

환자 앱은 모바일 우선으로 설계된 PWA 형태의 웹앱이다. 하단 탭바(BottomTabBar)로 5개 탭을 전환한다.

### 탭 구성

| 탭 | 경로 | 설명 |
|----|------|------|
| 홈 | `/home` | 오늘 일지 작성 진입, 복약 체크, 어제 수면 요약, 다음 방문일 |
| 기록 | `/records` | 수면·효율·검사·ISI 차트 및 이력 조회 |
| 처방 | `/prescription` | 현재·과거 처방 내역 확인 |
| 자가진단 | `/isi` | ISI 불면증 자가진단 폼 + 점수 이력 |
| 문의 | `/qna` | 원장에게 문의 작성·답변 확인 |

---

### 2-1. 수면 일지 (`/diary`)

매일 1회 작성하는 4단계 스텝 폼. 하단 탭바에는 없고, 홈 탭의 "오늘 일지 작성" 버튼으로 진입한다.

**Step 1 — 기본 수면 정보**

| 항목 | 입력 방식 | 비고 |
|------|-----------|------|
| 취침 시각 | time input | 기본값 23:00 |
| 기상 시각 | time input | 기본값 07:00 |
| 잠드는 데 걸린 시간 | 4개 버튼 선택 | 0~10분 / 10~30분 / 30~60분 / 60분 이상 |
| 밤중 각성 횟수 | 4개 버튼 선택 | 없음 / 1회 / 2회 / 3회 이상 |
| 수면 중 특이사항 | textarea | 최대 200자 |

**Step 2 — 수면 질 평가**

| 항목 | 입력 방식 | 범위 |
|------|-----------|------|
| 수면의 질 | 슬라이더 | 1(매우 나쁨) ~ 5(매우 좋음) |
| 아침 피로감 | 슬라이더 | 1(매우 상쾌) ~ 5(매우 피곤) |
| 낮 졸음 | 3개 버튼 선택 | 없음 / 약간 / 심함 |

**Step 3 — 추가 기록**

| 항목 | 입력 방식 |
|------|-----------|
| 낮잠 여부 | 토글 (on 시 낮잠 시간 분 단위 입력) |
| 꿈 | 3개 버튼 선택 (없음 / 기억 안남 / 꿈꿈) |
| 카페인 섭취 | 4개 버튼 선택 (없음 / 1잔 / 2잔 / 3잔 이상) |
| 음주 여부 | 토글 |
| 오늘 컨디션 | 슬라이더 (1~5) |
| 메모 | textarea |

**Step 4 — 복약 체크** _(처방 환자만 표시)_

한약·양약 각 4타이밍(아침·점심·저녁·취침 전) 체크박스. `hasPrescription = true`인 환자만 이 단계가 노출된다.

**저장 로직**

- API: `POST /api/diary`
- `diary_date = 오늘` 기준으로 upsert (`patient_id + diary_date` 복합 유니크)
- 제출 성공 시 완료 애니메이션 후 `/home`으로 리다이렉트

---

### 2-2. 복약 관리 (홈 탭 내)

처방을 받은 환자(`hasPrescription = true`)에게만 홈 탭에 복약 체크 UI가 표시된다.

- **한약**: 아침·점심·저녁·취침 전 4개 버튼
- **양약**: 아침·점심·저녁·취침 전 4개 버튼
- 버튼 탭 시 즉시 `PATCH /api/medication/check` 호출 → `sleep_diary` 테이블의 해당 필드를 토글
- 오늘 일지가 없으면 자동으로 오늘 날짜로 upsert

---

### 2-3. 기록 탭 (`/records`) — 4개 서브탭

#### 수면 탭
- **수면 시간 바 차트**: 최근 30일 `total_sleep_min` → 시간 단위 변환
- **수면 단계 누적 바 차트**: `deep_sleep_min` / `light_sleep_min` / `rem_sleep_min`
- **만족도·컨디션 선 차트**: `sleep_quality` / `condition` (1~5점)
- 데이터 없으면 빈 상태 안내 (관리자가 입력해야 표시됨)

#### 효율 탭
- **수면 효율 선 차트**: `calcSleepEfficiency()` 서버사이드 계산 후 반환
- 기준선: 85%(정상) / 70%(주의) 점선 표시
- 30일 / 90일 범위 전환 버튼
- 평균 효율 배지 (정상·주의·불량 색상 구분)

#### 검사 탭
- HRV / InBody / QEEG 서브탭 전환
- 각 검사 결과 카드: `result_data` JSONB 항목을 그리드로 표시 + 원장 코멘트(`summary`)
- 관리자가 `/admin/patients/[id]/exam`에서 입력한 데이터를 조회

#### ISI 탭
- **점수 추이 선 차트**: 7 / 14 / 21 기준선으로 단계 구분
- 최신 점수 배지 (정상·경미·중등도·심각)
- 검사 이력 목록 (날짜 + 점수 + 레벨)

---

### 2-4. 문의 (`/qna`)

**문의 내역 탭**
- 문의 목록: 질문 미리보기, 답변 상태 배지(대기중/답변완료)
- 카드 클릭 → `/qna/[id]` 상세 페이지

**새 문의 탭**
- textarea 폼, 최대 1,000자
- `POST /api/qna` → 제출 완료 애니메이션

**상세 페이지 (`/qna/[id]`)**
- 질문 전문 + 원장 답변 표시
- 미답변 시 "대기 중" 안내

---

### 2-5. 검사 결과 조회 (`/records` → 검사 탭)

환자는 직접 검사 결과를 입력할 수 없고, 관리자가 입력한 결과만 조회한다.  
검사 유형별(HRV·InBody·QEEG) 서브탭으로 구분되어 표시된다.

---

### 2-6. ISI 자가진단 (`/isi`)

**자가진단 하기 탭**
- 7문항 × 0~4점 척도 버튼 선택
- 실시간 총점 미리보기 (0~28점)
- 전문항 완료 시 "제출하기" 버튼 활성화
- `POST /api/isi` → 제출 후 이력 탭으로 자동 전환

| 문항 | 내용 |
|------|------|
| Q1 | 잠들기 어려움 |
| Q2 | 수면 유지 어려움 |
| Q3 | 너무 일찍 깸 |
| Q4 | 수면 패턴 만족도 |
| Q5 | 수면 문제로 인한 일상 영향 |
| Q6 | 삶의 질 저하 |
| Q7 | 수면 문제에 대한 걱정 |

**ISI 점수 레벨**

| 점수 | 레벨 | 색상 |
|------|------|------|
| 0–7 | 정상 | 초록 |
| 8–14 | 경미한 불면증 | 노랑 |
| 15–21 | 중등도 불면증 | 주황 |
| 22–28 | 심각한 불면증 | 빨강 |

**검사 이력 탭**
- 점수 추이 선 차트 (2회 이상일 때 표시)
- 이력 목록: 날짜·점수·레벨 배지

---

## 3. 관리자 대시보드 주요 기능

관리자(원장)는 `/admin/login`으로 이메일 로그인 후 사이드바 기반 대시보드를 사용한다.  
사이드바 메뉴: 대시보드 / 환자 목록 / Q&A 관리

---

### 3-1. 대시보드 (`/admin/dashboard`)

접속 시 가장 먼저 보이는 통계 화면.

| 통계 카드 | 데이터 소스 |
|-----------|------------|
| 전체 환자 수 | `patients` 테이블 count |
| 오늘 일지 작성 수 | `sleep_diary` where `diary_date = 오늘` count |
| 주간 일지 작성 수 | `sleep_diary` where `diary_date >= 7일 전` count |
| 미답변 Q&A 수 | `qna` where `is_answered = false` count |

각 카드를 클릭하면 해당 관리 페이지로 이동한다. 빠른 메뉴(환자 등록 / 환자 목록 / Q&A 관리) 바로가기도 제공한다.

---

### 3-2. 환자 개인 관리

#### 환자 목록 (`/admin/patients`)
- 전체 환자를 등록일 역순으로 테이블에 표시
- 이름 또는 등록번호로 실시간 검색
- 이름 클릭 → 환자 상세 페이지 이동
- 우측 상단 "+ 환자 등록" 버튼

#### 환자 등록 (`/admin/patients/new`)
- 입력 항목: 이름(필수), 등록번호(필수), 초기 비밀번호(필수), 생년월일, 연락처
- 저장 시 처리 순서:
  1. `createAdminClient()`로 Supabase Auth에 `{등록번호}@patient.local` 계정 생성
  2. `patients` 테이블에 환자 기본 정보 insert
  3. `user_roles` 테이블에 `role = 'patient'`, `patient_id` 연결
  4. 실패 시 Auth 계정 롤백 후 에러 반환
- 등록 완료 시 해당 환자 상세 페이지로 이동

#### 환자 상세 (`/admin/patients/[id]`)
- 기본 정보: 등록번호, 생년월일, 연락처, 등록일
- 수면장애 진단 목록: 진단명 + 중증도 배지 (경미·중등도·심각)
- 다음 방문 예정일 (최근 처방의 `next_visit_date`)
- 수면 데이터 / 검사 결과 바로가기 카드
- 처방 내역 목록 + 인라인 처방 추가 폼

#### 환자 정보 수정 (`/admin/patients/[id]/edit`)
- 수정 가능 항목: 이름, 생년월일, 연락처
- 등록번호는 변경 불가 (로그인 ID이므로)

---

### 3-3. 처방 입력 (`/admin/patients/[id]` 인라인 폼)

환자 상세 페이지 내 "처방 추가" 버튼으로 인라인 폼 토글.

| 항목 | 필수 여부 |
|------|-----------|
| 방문일 | 필수 |
| 다음 방문일 | 선택 |
| 처방 내용 | 선택 |
| 원장 코멘트 | 선택 |

저장하면 `treatment_records` 테이블에 insert. 환자 앱 처방 탭과 홈 탭의 "다음 방문일"에 즉시 반영된다.  
처방이 1건 이상 존재하는 환자는 수면 일지 Step 4(복약 체크)가 활성화된다.

---

### 3-4. 수면 데이터 입력 (`/admin/patients/[id]/sleep`)

환자가 직접 입력할 수 없는 **수면 측정 장비 데이터**를 관리자가 대신 입력하는 화면.

**입력 항목**

| 항목 | 설명 |
|------|------|
| 날짜 | 필수, 해당 날짜의 기록에 upsert |
| 취침 시각 / 기상 시각 | HH:MM 형식 |
| 총 수면 (분) | 전체 수면 시간 |
| 깊은 수면 (분) | deep sleep |
| 얕은 수면 (분) | light sleep |
| REM 수면 (분) | REM sleep |
| 수면의 질 (1~5) | 관리자 평가 또는 장비 측정값 |
| 아침 피로도 (1~5) | 관리자 평가 |
| 원장 메모 | 내부용, 환자에게 미표시 |

- `(patient_id, diary_date)` 기준 upsert → 같은 날짜 재입력 시 덮어씀
- 하단 테이블에서 최근 90일 데이터를 날짜 역순으로 조회
- 환자 앱 기록 탭의 수면·효율 차트 데이터 소스가 됨

---

### 3-5. 검사 결과 입력 (`/admin/patients/[id]/exam`)

HRV·InBody·QEEG 검사 결과를 JSON 형태로 입력하는 화면.

**검사 유형별 기본 템플릿**

| 유형 | 기본 항목 |
|------|-----------|
| HRV | SDNN, RMSSD, LF, HF, LF/HF ratio, mean HR |
| InBody | weight_kg, muscle_kg, fat_kg, fat_pct, BMI, InBody_score |
| QEEG | delta_pct, theta_pct, alpha_pct, beta_pct, gamma_pct |

- 검사 유형 선택 시 해당 템플릿이 JSON 에디터에 자동 입력됨
- JSON 에디터에서 항목 이름·값 자유 편집 가능
- 원장 코멘트(`summary`)는 환자 앱 검사 탭에 표시됨
- 유형별 서브탭으로 기존 결과 카드 형태로 조회

---

### 3-6. 문의사항 답변 관리 (`/admin/qna`)

환자가 보낸 문의를 조회하고 인라인으로 답변을 작성하는 화면.

- **필터**: 전체 / 미답변 / 답변완료 탭 전환
- **미답변 건수** 페이지 상단에 빨간 텍스트로 표시
- 각 문의 카드 클릭 시 확장 → 질문 전문 + 답변 textarea 노출
- 답변 등록 시 `qna` 테이블 업데이트:
  - `answer`, `is_answered = true`, `answered_by`, `answered_at` 일괄 저장
- 이미 답변된 문의는 기존 답변 내용을 읽기 전용으로 표시 (재답변 불가)

---

## 4. 현재 구현 완료된 기능

### 환자 앱

| # | 기능 | 경로 | 주요 파일 |
|---|------|------|-----------|
| 1 | 환자 로그인 | `/login` | `src/app/login/page.tsx` |
| 2 | 홈 탭 | `/home` | `src/app/(patient)/home/page.tsx` |
| 3 | 수면 일지 4-Step 폼 | `/diary` | `src/app/(patient)/diary/page.tsx` |
| 4 | 기록 탭 (수면/효율/검사/ISI) | `/records` | `src/app/(patient)/records/page.tsx` |
| 5 | 처방 탭 | `/prescription` | `src/app/(patient)/prescription/page.tsx` |
| 6 | ISI 자가진단 | `/isi` | `src/app/(patient)/isi/page.tsx` |
| 7 | 문의 목록·작성 | `/qna` | `src/app/(patient)/qna/page.tsx` |
| 8 | 문의 상세 | `/qna/[id]` | `src/app/(patient)/qna/[id]/page.tsx` |

**환자 앱 세부 구현 내역**

- **로그인**: 등록번호 + 비밀번호 입력, `{등록번호}@patient.local`로 Supabase Auth 인증
- **홈 탭**: 환자 이름 인사말, 오늘 일지 작성 버튼(작성 완료 시 체크 표시), 복약 체크 버튼(처방 환자만), 어제 수면 요약(취침·기상·수면효율), 다음 방문일, 알림 설정 토글
- **수면 일지**: 4단계 스텝 폼, 진행 표시 바, 처방 환자에게만 Step 4 노출, 제출 후 성공 애니메이션
- **기록 탭 — 수면**: 수면 시간 바 차트, 수면 단계(깊은·얕은·REM) 누적 바 차트, 만족도·컨디션 선 차트 (Recharts)
- **기록 탭 — 효율**: 수면 효율 선 차트, 85%·70% 기준선, 30d/90d 범위 전환, 평균 효율 배지
- **기록 탭 — 검사**: HRV·InBody·QEEG 서브탭, result_data JSONB 항목 그리드 표시, 원장 코멘트
- **기록 탭 — ISI**: 점수 추이 선 차트(7·14·21 기준선), 최신 점수 배지, 이력 목록
- **처방 탭**: 최근 처방 카드(파란 헤더), 지난 처방 아코디언(+/- 토글)
- **ISI 자가진단**: 7문항 0~4점 버튼 선택, 실시간 총점 미리보기, 제출 후 이력 탭 자동 전환
- **문의**: 목록·상세·새 문의 작성, 답변 상태 배지(대기중/답변완료), 1000자 제한

---

### 관리자 대시보드

| # | 기능 | 경로 | 주요 파일 |
|---|------|------|-----------|
| 1 | 관리자 로그인 | `/admin/login` | `src/app/admin/login/page.tsx` |
| 2 | 대시보드 | `/admin/dashboard` | `src/app/admin/(dashboard)/dashboard/page.tsx` |
| 3 | 환자 목록 | `/admin/patients` | `src/app/admin/(dashboard)/patients/page.tsx` |
| 4 | 환자 등록 | `/admin/patients/new` | `src/app/admin/(dashboard)/patients/new/page.tsx` |
| 5 | 환자 상세 + 처방 추가 | `/admin/patients/[id]` | `src/app/admin/(dashboard)/patients/[id]/page.tsx` |
| 6 | 환자 정보 수정 | `/admin/patients/[id]/edit` | `src/app/admin/(dashboard)/patients/[id]/edit/page.tsx` |
| 7 | 수면 데이터 입력 | `/admin/patients/[id]/sleep` | `src/app/admin/(dashboard)/patients/[id]/sleep/page.tsx` |
| 8 | 검사 결과 입력 | `/admin/patients/[id]/exam` | `src/app/admin/(dashboard)/patients/[id]/exam/page.tsx` |
| 9 | Q&A 관리 | `/admin/qna` | `src/app/admin/(dashboard)/qna/page.tsx` |

**관리자 세부 구현 내역**

- **로그인**: 이메일 + 비밀번호, `user_roles.role = 'admin'` 검증, 환자 계정으로 접근 시 거부
- **대시보드**: 4개 통계 카드(클릭 시 해당 메뉴 이동), 빠른 메뉴 3개
- **환자 목록**: 이름/등록번호 실시간 검색, 등록일 역순 정렬, 총 인원 표시
- **환자 등록**: Supabase Auth 계정 자동 생성, 실패 시 Auth 계정 롤백
- **환자 상세**: 기본정보·진단 목록·처방 이력 한 페이지, 처방 인라인 추가 폼
- **수면 데이터**: 날짜 기준 upsert, 최근 90일 테이블 조회
- **검사 결과**: 유형별 JSON 템플릿 자동 입력, 유형별 서브탭 조회
- **Q&A 관리**: 전체/미답변/답변완료 필터, 인라인 textarea 답변 작성

---

### API Route Handler

**환자용 (`/api/...`)**

| 엔드포인트 | 메서드 | 기능 |
|------------|--------|------|
| `/api/diary` | POST | 수면 일지 upsert |
| `/api/diary/today` | GET | 오늘 일지 + hasPrescription |
| `/api/home/summary` | GET | 홈 요약 (이름·처방·수면 요약·설정) |
| `/api/medication/check` | PATCH | 복약 체크 토글 |
| `/api/settings` | GET / PATCH | 알림 설정 조회·수정 |
| `/api/prescriptions` | GET | 처방 내역 목록 |
| `/api/isi` | GET / POST | ISI 이력 조회 / 새 검사 제출 |
| `/api/qna` | GET / POST | 문의 목록 조회 / 새 문의 작성 |
| `/api/qna/[id]` | GET | 문의 상세 |
| `/api/records/sleep` | GET | 수면 일지 (`?range=7d\|30d\|90d`) |
| `/api/records/efficiency` | GET | 수면 효율 계산 (`?range=30d\|90d`) |
| `/api/records/exams/[type]` | GET | 검사 결과 (`type`: hrv·inbody·qeeg) |
| `/api/records/isi` | GET | ISI 점수 이력 |

**관리자용 (`/api/admin/...`)**

| 엔드포인트 | 메서드 | 기능 |
|------------|--------|------|
| `/api/admin/stats` | GET | 대시보드 통계 4종 |
| `/api/admin/patients` | GET / POST | 환자 목록 / 환자 등록 |
| `/api/admin/patients/[id]` | GET / PATCH | 환자 상세 / 정보 수정 |
| `/api/admin/patients/[id]/sleep` | GET / POST | 수면 데이터 조회 / 입력 |
| `/api/admin/patients/[id]/exam` | GET / POST | 검사 결과 조회 / 입력 |
| `/api/admin/patients/[id]/prescriptions` | POST | 처방 추가 |
| `/api/admin/patients/[id]/prescriptions/[pid]` | PATCH / DELETE | 처방 수정 / 삭제 |
| `/api/admin/qna` | GET | Q&A 전체 목록 (환자 정보 join) |
| `/api/admin/qna/[id]` | PATCH | 답변 등록 |

---

### 공통 인프라

- **Supabase 스키마** (`supabase_schema.sql`): 9개 테이블, RLS 정책, updated_at 트리거 완비
- **미들웨어** (`src/middleware.ts`): 비로그인 접근 차단, 환자·관리자 경로 분리
- **디자인 시스템** (`src/app/globals.css`): Tailwind v4 `@theme inline` 토큰 정의
- **공통 유틸** (`src/lib/utils.ts`): `cn()`, `calcSleepEfficiency()`, `getIsiLevel()`, `getSleepEfficiencyLevel()`
- **관리자 가드** (`src/lib/supabase/admin-guard.ts`): `requireAdmin()` — 모든 admin API에 적용
- **Vercel 배포**: `https://patient-sleep-app.vercel.app`, 환경 변수 등록 완료
- **Supabase Auth Redirect URL**: 프로덕션 URL 등록 완료

