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

환자 앱 전체 기능 + 관리자 대시보드 + 모든 계획된 부가 기능까지 구현 완료. Vercel 배포 중.  
수면 일지 날짜별 수정, 검사 결과 수정·삭제, CSV 내보내기, Q&A 텍스트 검색, 15분 비활동 자동 로그아웃까지 완료. 남은 예정 작업 없음.

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

### 2-3. 기록 탭 (`/records`) — 5개 서브탭

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

#### 복약 탭 (처방 환자 한정)
- **한약 복약 이력 그리드**: 최근 30일 × 4타이밍(아침/점심/저녁/취침) 복약 체크 상태 시각화
- **양약 복약 이력 그리드**: 동일 형식
- 타이밍별 ✓(초록)/✗(빨강) 도트 표시
- 한약/양약 각각 복약률(%) 배지 (≥80% 초록 / ≥50% 노랑 / 미만 빨강)
- 처방이 없거나 복약 기록이 없으면 빈 상태 안내
- API: `GET /api/records/medication?days=30`

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

**주의환자 카드** (통계 카드 아래)
- **최근 7일 일지 미작성 환자**: 최근 7일간 `sleep_diary` 기록이 없는 환자 목록 + 이름/등록번호 링크
- **수면 효율 저하 환자**: 최근 7일 일지 기준 평균 `calcSleepEfficiency()` < 85% 환자 목록 + 평균 효율 표시

---

### 3-2. 환자 개인 관리

#### 환자 목록 (`/admin/patients`)
- 전체 환자를 등록일 역순으로 테이블에 표시 (서버사이드 페이지네이션, 20건/페이지)
- 이름 또는 등록번호로 실시간 검색 (300ms 디바운스)
- **최근 일지 배지**: 7일 이내 초록 / 14일 이내 노랑 / 이후 빨강 / 미작성 빨강
- 이름 클릭 → 환자 상세 페이지 이동
- 우측 상단 "+ 환자 등록" 버튼

#### 환자 등록 (`/admin/patients/new`)
- 입력 항목: 이름(필수), 등록번호(필수), 초기 비밀번호(필수), 생년월일, 연락처
- **등록번호 중복 확인**: 입력 시 400ms 디바운스로 `GET /api/admin/patients/check` 호출, 실시간 가용/불가 피드백
- 저장 시 처리 순서:
  1. `createAdminClient()`로 Supabase Auth에 `{등록번호}@patient.local` 계정 생성
  2. `patients` 테이블에 환자 기본 정보 insert
  3. `user_roles` 테이블에 `role = 'patient'`, `patient_id` 연결
  4. 실패 시 Auth 계정 롤백 후 에러 반환
- 등록 완료 시 해당 환자 상세 페이지로 이동

#### 환자 상세 (`/admin/patients/[id]`)
- 기본 정보: 등록번호, 생년월일, 연락처, 등록일
- **수면장애 진단 CRUD**: 진단 목록 + 인라인 추가/수정/삭제 (진단명·중증도·발병일·메모)
- 다음 방문 예정일 (최근 처방의 `next_visit_date`)
- 수면 데이터 / 검사 결과 바로가기 카드
- 처방 내역 목록 + 인라인 처방 추가 폼 + **처방 수정·삭제 버튼**
- **ISI 이력 탭**: 환자의 ISI 자가진단 점수 이력 및 추이 차트
- **환자 삭제 버튼**: 환자 계정 + 관련 데이터 전체 삭제 (확인 후 실행)
- **비밀번호 초기화 버튼**: 관리자가 환자 비밀번호를 새 값으로 재설정

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

### 3-4. 수면 데이터 입력·수정 (`/admin/patients/[id]/sleep`)

환자가 직접 입력할 수 없는 **수면 측정 장비 데이터**를 관리자가 대신 입력·수정하는 화면.

**입력 항목**

| 항목 | 설명 |
|------|------|
| 날짜 | 필수, 해당 날짜의 기록에 upsert |
| 취침 시각 / 기상 시각 | HH:MM 형식 |
| 잠드는 데 걸린 시간 | 0~10분 / 10~30분 / 30~60분 / 60분 이상 |
| 밤중 각성 횟수 | 없음 / 1회 / 2회 / 3회 이상 |
| 총 수면 (분) | 전체 수면 시간 |
| 깊은 수면 (분) | deep sleep |
| 얕은 수면 (분) | light sleep |
| REM 수면 (분) | REM sleep |
| 수면의 질 / 아침 피로도 / 컨디션 (1~5) | 평가 지표 |
| 낮 졸음 | 없음 / 약간 / 심함 |
| 낮잠 / 낮잠 시간 | 있음 시 분 단위 추가 입력 |
| 꿈 / 카페인 / 음주 | 환자 생활 습관 항목 |
| 환자 메모 / 원장 메모 | 원장 메모는 내부용, 환자에게 미표시 |

- `(patient_id, diary_date)` 기준 upsert → 같은 날짜 재입력 시 덮어씀
- 하단 테이블 행의 **수정 버튼** 클릭 시 해당 날짜 데이터가 폼에 채워져 인라인 수정 가능
- 수정 모드에서는 날짜 필드가 비활성화되어 날짜 변경 불가
- 하단 테이블에서 최근 90일 데이터를 날짜 역순으로 조회
- 환자 앱 기록 탭의 수면·효율 차트 데이터 소스가 됨

---

### 3-5. 검사 결과 입력·수정·삭제 (`/admin/patients/[id]/exam`)

HRV·InBody·QEEG 검사 결과를 JSON 형태로 입력·수정·삭제하는 화면.

**검사 유형별 기본 템플릿**

| 유형 | 기본 항목 |
|------|-----------|
| HRV | SDNN, RMSSD, LF, HF, LF/HF ratio, mean HR |
| InBody | weight_kg, muscle_kg, fat_kg, fat_pct, BMI, InBody_score |
| QEEG | delta_pct, theta_pct, alpha_pct, beta_pct, gamma_pct |

- 검사 유형 선택 시 해당 템플릿이 JSON 에디터에 자동 입력됨 (신규 입력 시만)
- JSON 에디터에서 항목 이름·값 자유 편집 가능
- 원장 코멘트(`summary`)는 환자 앱 검사 탭에 표시됨
- 유형별 서브탭으로 기존 결과 카드 형태로 조회
- 각 카드에 **수정 버튼**: 클릭 시 해당 결과를 폼에 채워 인라인 수정
- 각 카드에 **삭제 버튼**: 확인 다이얼로그 없이 즉시 삭제 (`DELETE /api/admin/patients/[id]/exam/[eid]`)
- API: `PATCH/DELETE /api/admin/patients/[id]/exam/[eid]`

---

### 3-6. 문의사항 답변 관리 (`/admin/qna`)

환자가 보낸 문의를 조회하고 인라인으로 답변을 작성하는 화면.

- **텍스트 검색**: 질문 내용·환자명·등록번호로 실시간 클라이언트사이드 필터링
- **필터**: 전체 / 미답변 / 답변완료 탭 전환 (검색과 조합 가능)
- **미답변 건수** 페이지 상단에 빨간 텍스트로 표시
- 각 문의 카드 클릭 시 확장 → 질문 전문 + 답변 textarea 노출
- 답변 등록 시 `qna` 테이블 업데이트:
  - `answer`, `is_answered = true`, `answered_by`, `answered_at` 일괄 저장
- 이미 답변된 문의는 기존 답변 내용을 읽기 전용으로 표시 (재답변 불가)
- **답변 등록 시 Web Push 알림 발송**: 환자의 `qna_alarm` 설정이 활성화된 경우 즉시 푸시

---

## 4. 현재 구현 완료된 기능

### 환자 앱

| # | 기능 | 경로 | 주요 파일 |
|---|------|------|-----------|
| 1 | 환자 로그인 | `/login` | `src/app/login/page.tsx` |
| 2 | 홈 탭 | `/home` | `src/app/(patient)/home/page.tsx` |
| 3 | 수면 일지 4-Step 폼 | `/diary` | `src/app/(patient)/diary/page.tsx` |
| 4 | 기록 탭 (수면/효율/검사/ISI/복약) | `/records` | `src/app/(patient)/records/page.tsx` |
| 5 | 처방 탭 | `/prescription` | `src/app/(patient)/prescription/page.tsx` |
| 6 | ISI 자가진단 | `/isi` | `src/app/(patient)/isi/page.tsx` |
| 7 | 문의 목록·작성 | `/qna` | `src/app/(patient)/qna/page.tsx` |
| 8 | 문의 상세 | `/qna/[id]` | `src/app/(patient)/qna/[id]/page.tsx` |
| 9 | 설정 (비밀번호 변경 + 로그아웃) | `/settings` | `src/app/(patient)/settings/page.tsx` |

**환자 앱 세부 구현 내역**

- **로그인**: 등록번호 + 비밀번호 입력, `{등록번호}@patient.local`로 Supabase Auth 인증
- **홈 탭**: 환자 이름 인사말, 오늘 일지 작성 버튼(작성 완료 시 체크 표시), 복약 체크 버튼(처방 환자만), 어제 수면 요약(취침·기상·수면효율), 다음 방문일, Web Push 알림 토글 (마스터 토글 + 서브 토글)
- **수면 일지**: 4단계 스텝 폼, 진행 표시 바, 처방 환자에게만 Step 4 노출, 제출 후 성공 애니메이션
- **기록 탭 — 수면**: 수면 시간 바 차트, 수면 단계(깊은·얕은·REM) 누적 바 차트, 만족도·컨디션 선 차트 (Recharts)
- **기록 탭 — 효율**: 수면 효율 선 차트, 85%·70% 기준선, 30d/90d 범위 전환, 평균 효율 배지
- **기록 탭 — 검사**: HRV·InBody·QEEG 서브탭, result_data JSONB 항목 그리드 표시, 원장 코멘트
- **기록 탭 — ISI**: 점수 추이 선 차트(7·14·21 기준선), 최신 점수 배지, 이력 목록
- **기록 탭 — 복약**: 한약·양약 30일 복약 이력 그리드, 4타이밍별 ✓/✗ 도트, 복약률 배지
- **처방 탭**: 최근 처방 카드(파란 헤더), 지난 처방 아코디언(+/- 토글)
- **ISI 자가진단**: 7문항 0~4점 버튼 선택, 실시간 총점 미리보기, 제출 후 이력 탭 자동 전환
- **문의**: 목록·상세·새 문의 작성, 답변 상태 배지(대기중/답변완료), 1000자 제한
- **설정**: 비밀번호 변경(현재 비밀번호 확인 후 변경), 로그아웃 버튼, 토스트 메시지
- **에러 페이지**: `error.tsx` (다시 시도 버튼), `not-found.tsx` (홈으로 돌아가기)

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
- **대시보드**: 4개 통계 카드 + 주의환자 카드 2종 (7일 미작성 / 수면효율 저하), 빠른 메뉴 3개
- **환자 목록**: 이름/등록번호 실시간 검색, 서버사이드 페이지네이션(20건/페이지), 일지 배지
- **환자 등록**: 등록번호 실시간 중복 확인, Supabase Auth 계정 자동 생성, 실패 시 Auth 계정 롤백
- **환자 상세**: 기본정보·진단 CRUD·처방 수정/삭제·ISI 이력 탭, 환자 삭제, 비밀번호 초기화
- **수면 데이터**: 날짜 기준 upsert, 행 수정 버튼으로 인라인 편집, 최근 90일 테이블 조회
- **검사 결과**: 유형별 JSON 템플릿 자동 입력, 유형별 서브탭 조회, 카드별 수정·삭제 버튼
- **Q&A 관리**: 전체/미답변/답변완료 필터, 텍스트 검색, 인라인 textarea 답변 작성, 답변 시 Web Push 발송
- **CSV 내보내기**: 환자 상세 헤더의 "CSV 내보내기" 버튼 → 수면 일지 전 항목 다운로드 (BOM 포함, Excel 호환)
- **에러 페이지**: 관리자 레이아웃 내 전용 `error.tsx`

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
| `/api/records/medication` | GET | 복약 이력 (`?days=30`) |
| `/api/push/subscribe` | POST / DELETE | Web Push 구독 등록 / 해제 |

**관리자용 (`/api/admin/...`)**

| 엔드포인트 | 메서드 | 기능 |
|------------|--------|------|
| `/api/admin/stats` | GET | 대시보드 통계 (주의환자 포함) |
| `/api/admin/patients` | GET / POST | 환자 목록(페이지네이션) / 환자 등록 |
| `/api/admin/patients/check` | GET | 등록번호 중복 확인 |
| `/api/admin/patients/[id]` | GET / PATCH / DELETE | 환자 상세 / 정보 수정 / 삭제 |
| `/api/admin/patients/[id]/reset-password` | POST | 환자 비밀번호 초기화 |
| `/api/admin/patients/[id]/disorders` | GET / POST | 진단 목록 / 진단 추가 |
| `/api/admin/patients/[id]/disorders/[did]` | PATCH / DELETE | 진단 수정 / 삭제 |
| `/api/admin/patients/[id]/isi` | GET | 환자 ISI 이력 (관리자용) |
| `/api/admin/patients/[id]/sleep` | GET / POST | 수면 데이터 조회 / 입력·수정 (upsert) |
| `/api/admin/patients/[id]/exam` | GET / POST | 검사 결과 조회 / 입력 |
| `/api/admin/patients/[id]/exam/[eid]` | PATCH / DELETE | 검사 결과 수정 / 삭제 |
| `/api/admin/patients/[id]/export` | GET | 수면 일지 CSV 내보내기 |
| `/api/admin/patients/[id]/prescriptions` | POST | 처방 추가 |
| `/api/admin/patients/[id]/prescriptions/[pid]` | PATCH / DELETE | 처방 수정 / 삭제 |
| `/api/admin/qna` | GET | Q&A 전체 목록 (환자 정보 join) |
| `/api/admin/qna/[id]` | PATCH | 답변 등록 (Web Push 발송 포함) |

---

### 공통 인프라

- **Supabase 스키마** (`supabase_schema.sql`): 9개 테이블, RLS 정책, updated_at 트리거 완비
- **미들웨어** (`src/middleware.ts`): 비로그인 접근 차단, 환자·관리자 경로 분리
- **디자인 시스템** (`src/app/globals.css`): Tailwind v4 `@theme inline` 토큰 정의
- **공통 유틸** (`src/lib/utils.ts`): `cn()`, `calcSleepEfficiency()`, `getIsiLevel()`, `getSleepEfficiencyLevel()`
- **관리자 가드** (`src/lib/supabase/admin-guard.ts`): `requireAdmin()` — 모든 admin API에 적용
- **비활동 로그아웃** (`src/components/InactivityGuard.tsx`): 15분 무조작 시 `signOut()` 후 로그인 페이지 이동. 환자 레이아웃(`/login`)·관리자 레이아웃(`/admin/login`) 양쪽에 적용. 감지 이벤트: `mousemove`, `keydown`, `mousedown`, `touchstart`, `scroll`
- **Vercel 배포**: `https://patient-sleep-app.vercel.app`, 환경 변수 등록 완료
- **Supabase Auth Redirect URL**: 프로덕션 URL 등록 완료
- **관리자 계정**: `admin@clinic.com` Supabase Auth + `user_roles` 등록 완료
- **PWA manifest**: `public/manifest.json` + `public/icons/` SVG 아이콘 2종
- **Web Push**: `web-push` npm 패키지 + VAPID 키 + `public/sw.js` Service Worker + `src/lib/push.ts` 발송 유틸
- **에러 페이지**: `src/app/not-found.tsx`, `src/app/error.tsx`, 라우트 그룹별 `error.tsx` 4종
- **push_subscriptions 테이블**: `push_subscriptions_migration.sql` — Supabase SQL Editor에서 수동 실행 필요

---

## 5. 아직 미완성인 기능

### 5-1. 운영 준비

#### 관리자 계정 ✅ 완료
`admin@clinic.com` 계정이 Supabase Auth에 생성됐고 `user_roles`에 `role='admin'`으로 등록됨.

---

### 5-2. 환자 앱 미완성 기능

#### 푸시 알림 — 일지/복약 예약 알림 ⚠️ 부분 구현
- 구현됨: Q&A 답변 시 즉시 푸시 발송 (`src/lib/push.ts`, `public/sw.js`)
- 미구현: 수면 일지 작성 리마인더, 복약 시간 알림 (예약 발송은 cron 인프라 필요)
- 홈 탭 알림 토글 UI + `settings` DB 저장은 동작하지만 예약 푸시는 발송 안 됨

---

### 5-3. 관리자 대시보드 미완성 기능

#### 검사 결과 수정·삭제 ✅ 완료
- `PATCH/DELETE /api/admin/patients/[id]/exam/[eid]` 추가
- 각 검사 결과 카드에 수정·삭제 버튼 추가

---

### 5-4. PWA 지원 ✅ 완료

- `public/manifest.json` 생성 완료 (name: "수면클리닉", start_url: "/home", theme_color: "#4A90D9")
- `public/icons/icon-192.svg`, `icon-512.svg` 달 모양 SVG 아이콘 생성 완료
- 모바일 브라우저에서 "홈 화면에 추가" 시 앱 이름·아이콘 표시됨

---

### 5-5. 기타 개선 사항

| 항목 | 현황 | 비고 |
|------|------|------|
| 환자 목록 페이지네이션 | ✅ 완료 (20건/페이지, 서버사이드) | — |
| 수면 일지 날짜별 수정 (관리자) | ✅ 완료 — 행 수정 버튼, 전 항목 인라인 편집 | — |
| 검사 결과 수정·삭제 | ✅ 완료 — 카드별 수정·삭제 버튼 | — |
| CSV 데이터 내보내기 | ✅ 완료 — 수면 일지 전 항목, Excel BOM | — |
| Q&A 텍스트 검색 | ✅ 완료 — 질문·환자명·등록번호 검색 | — |
| 비활동 자동 로그아웃 | ✅ 완료 — 15분, 환자·관리자 공통 | — |
| 관리자 복약 현황 조회 | 별도 화면 없음 | CSV 내보내기로 대체 가능 |
| 에러 페이지 | ✅ 완료 — 커스텀 `error.tsx`, `not-found.tsx` 4종 | — |

---

## 6. 기술 스택

### 핵심 프레임워크 및 런타임

| 항목 | 버전 | 비고 |
|------|------|------|
| Next.js | 16.2.4 | App Router, TypeScript, Turbopack |
| React | 19.2.4 | Server Components 기본값 |
| TypeScript | ^5 | strict 모드 |
| Node.js | 20+ | Vercel 런타임 |

### 스타일링

| 항목 | 버전 | 비고 |
|------|------|------|
| Tailwind CSS | ^4 | CSS-based config, `tailwind.config.ts` 없음 |
| @tailwindcss/postcss | ^4 | PostCSS 플러그인 |
| tailwind-merge | ^3.5.0 | 클래스 충돌 방지 (`cn()` 유틸에서 사용) |
| clsx | ^2.1.1 | 조건부 클래스 조합 |
| Pretendard Variable | CDN | 한국어 폰트, `globals.css` 최상단 import |

> **Tailwind v4 핵심 차이**: `tailwind.config.ts` 파일이 없다. 모든 커스텀 토큰은  
> `src/app/globals.css`의 `@theme inline { ... }` 블록 안에 CSS 변수로 선언한다.  
> 클래스에서 `bg-brand-500`, `rounded-[--radius-md]`, `shadow-[--shadow-card]` 형태로 참조.

### 데이터베이스 및 인증

| 항목 | 버전 | 비고 |
|------|------|------|
| @supabase/ssr | ^0.10.2 | 서버·클라이언트 분리 클라이언트 |
| @supabase/supabase-js | ^2.104.1 | Admin Client (service_role) |

> Supabase는 **두 가지 클라이언트**를 구분해서 사용한다:
> - `src/lib/supabase/server.ts` → 서버 컴포넌트·Route Handler 전용
> - `src/lib/supabase/client.ts` → `'use client'` 컴포넌트 전용  
> 혼용 시 빌드 에러 발생. 반드시 import 경로 확인 후 사용할 것.

### UI 컴포넌트

| 항목 | 버전 | 비고 |
|------|------|------|
| lucide-react | ^1.11.0 | 아이콘 (ChevronLeft, Moon, Bell 등) |
| class-variance-authority | ^0.7.1 | 버튼 variant 관리 (`src/components/ui/button.tsx`) |
| @radix-ui/react-slot | ^1.2.4 | CVA 버튼 `asChild` prop 지원 |
| @radix-ui/react-dialog | ^1.1.15 | (설치됨, 현재 미사용) |
| @radix-ui/react-switch | ^1.2.6 | (설치됨, 현재 미사용) |
| @radix-ui/react-tabs | ^1.1.13 | (설치됨, 현재 미사용) |
| @radix-ui/react-toast | ^1.2.15 | (설치됨, 현재 미사용) |

### 차트

| 항목 | 버전 | 비고 |
|------|------|------|
| Recharts | ^3.8.1 | 수면/효율/ISI 차트 |

> Recharts는 반드시 `'use client'` 파일에서만 사용한다.  
> 사용 컴포넌트: `BarChart`, `LineChart`, `ReferenceLine`, `ResponsiveContainer`, `Tooltip`.  
> `Tooltip formatter` 타입은 명시적 선언 없이 `(v) => [...]` 형태로 작성한다.

### 상태 관리

| 항목 | 버전 | 비고 |
|------|------|------|
| zustand | ^5.0.12 | 설치됨, 현재 미사용 (향후 전역 상태 필요 시 활용) |

> 현재는 각 페이지 컴포넌트의 `useState` + `fetch`로만 상태를 관리한다.

### 배포 및 인프라

| 항목 | 내용 |
|------|------|
| Vercel | 호스팅 플랫폼, 서울 리전 `icn1` |
| Supabase | PostgreSQL DB + Auth + RLS |
| GitHub | `sunny94-git/patient-sleep-app` |

### 개발 도구

| 항목 | 버전 | 비고 |
|------|------|------|
| ESLint | ^9 | `eslint-config-next` 16.2.4 |
| @types/react | ^19 | |
| @types/node | ^20 | |

### 개발 명령어

```bash
npm run dev      # 개발 서버 시작 (localhost:3000, Turbopack)
npm run build    # 프로덕션 빌드 + TypeScript 타입 검사
npm run start    # 프로덕션 빌드 로컬 실행
npm run lint     # ESLint 검사
```

> 코드 수정 후 반드시 `npm run build`로 TypeScript 오류 없음을 확인하고 커밋한다.

---

## 7. 주요 폴더/파일 구조

### 프로젝트 루트

```
patient-sleep-app/
├── src/                        # 전체 소스코드
├── public/                     # 정적 파일 (manifest.json + SVG 아이콘 + sw.js 포함)
├── supabase_schema.sql         # DB 초기화 스크립트 (재실행 가능, idempotent)
├── push_subscriptions_migration.sql  # push_subscriptions 테이블 생성 (수동 실행 필요)
├── vercel.json                 # Vercel 배포 설정 (리전: icn1)
├── AGENTS.md                   # 이 파일 — Codex 인수인계 문서
├── CLAUDE.md                   # Claude 세션용 프로젝트 현황 문서
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

### `src/` 전체 구조

```
src/
├── middleware.ts               # 인증 라우팅 게이트웨이
├── types/
│   └── index.ts                # DB 테이블 대응 TypeScript 인터페이스 9종
│
├── lib/
│   ├── utils.ts                # 공통 유틸 함수
│   └── supabase/
│       ├── client.ts           # 브라우저 전용 Supabase 클라이언트
│       ├── server.ts           # 서버 전용 클라이언트 + Admin 클라이언트
│       └── admin-guard.ts      # requireAdmin() — 관리자 API 인증 유틸
│
├── components/
│   ├── InactivityGuard.tsx     # 15분 비활동 자동 로그아웃 클라이언트 컴포넌트
│   ├── ui/
│   │   └── button.tsx          # CVA 기반 공통 버튼 (variant: primary/secondary/ghost/danger)
│   ├── layout/
│   │   └── BottomTabBar.tsx    # 환자 하단 탭바 6개 (홈·기록·처방·자가진단·문의·설정)
│   └── admin/
│       └── AdminSidebar.tsx    # 관리자 사이드바 (대시보드·환자목록·Q&A·로그아웃)
│
├── lib/
│   ├── push.ts                 # sendPushToPatient() — Web Push 발송 유틸 (patient_id → 구독 조회 → 전송)
│
└── app/
    ├── globals.css             # Tailwind v4 @theme inline 디자인 토큰 전체 정의
    ├── layout.tsx              # 루트 레이아웃 (메타데이터, manifest 링크, 뷰포트)
    ├── page.tsx                # / → 역할 기반 리다이렉트 (admin→/admin/dashboard, 환자→/home)
    ├── not-found.tsx           # 전역 404 페이지 (달 아이콘 + 홈으로 돌아가기)
    ├── error.tsx               # 전역 에러 페이지 (다시 시도 버튼)
    ├── favicon.ico
    │
    ├── login/
    │   └── page.tsx            # 환자 로그인 (등록번호 + 비밀번호)
    │
    ├── (patient)/              # 라우트 그룹 — URL에 영향 없음, 인증 보호
    │   ├── error.tsx           # 환자 앱 에러 페이지 (pb-20 탭바 패딩)
    │   ├── layout.tsx          # BottomTabBar + InactivityGuard(→/login) 삽입
    │   ├── home/
    │   │   └── page.tsx        # 홈 탭 (Web Push 구독 토글 포함)
    │   ├── diary/
    │   │   └── page.tsx        # 수면 일지 4-Step 폼
    │   ├── records/
    │   │   └── page.tsx        # 기록 탭 (수면·효율·검사·ISI·복약 서브탭 + Recharts)
    │   ├── prescription/
    │   │   └── page.tsx        # 처방 탭
    │   ├── isi/
    │   │   └── page.tsx        # ISI 자가진단 (폼 + 이력)
    │   ├── qna/
    │   │   ├── page.tsx        # 문의 목록·새 문의 작성
    │   │   └── [id]/
    │   │       └── page.tsx    # 문의 상세·원장 답변 표시
    │   └── settings/
    │       └── page.tsx        # 비밀번호 변경 + 로그아웃
    │
    ├── admin/
    │   ├── page.tsx            # /admin → /admin/dashboard 리다이렉트
    │   ├── login/
    │   │   └── page.tsx        # 관리자 로그인 (이메일 + 비밀번호 + role 검증)
    │   └── (dashboard)/        # 라우트 그룹 — 관리자 레이아웃 적용
    │       ├── error.tsx       # 관리자 에러 페이지
    │       ├── layout.tsx      # AdminSidebar + role=admin 검증 + InactivityGuard(→/admin/login)
    │       ├── dashboard/
    │       │   └── page.tsx    # 통계 대시보드 (주의환자 카드 포함)
    │       ├── patients/
    │       │   ├── page.tsx    # 환자 목록 + 검색 + 페이지네이션 + 일지 배지
    │       │   ├── new/
    │       │   │   └── page.tsx    # 환자 등록 (등록번호 중복 확인)
    │       │   └── [id]/
    │       │       ├── page.tsx    # 환자 상세 (진단 CRUD + 처방 수정/삭제 + ISI 탭 + 삭제/비번초기화 + CSV 내보내기)
    │       │       ├── edit/
    │       │       │   └── page.tsx    # 환자 정보 수정
    │       │       ├── sleep/
    │       │       │   └── page.tsx    # 수면 데이터 입력·날짜별 수정
    │       │       └── exam/
    │       │           └── page.tsx    # 검사 결과 입력·수정·삭제
    │       └── qna/
    │           └── page.tsx    # Q&A 관리 (텍스트 검색·필터·인라인 답변·Web Push 발송)
    │
    └── api/                    # Route Handlers — 모두 서버 실행
        ├── diary/
        │   ├── route.ts        # POST: 수면 일지 upsert
        │   └── today/
        │       └── route.ts    # GET: 오늘 일지 + hasPrescription
        ├── home/
        │   └── summary/
        │       └── route.ts    # GET: 홈 요약 데이터 (이름·처방·수면·설정)
        ├── medication/
        │   └── check/
        │       └── route.ts    # PATCH: 복약 필드 토글
        ├── push/
        │   └── subscribe/
        │       └── route.ts    # POST/DELETE: Web Push 구독 등록·해제
        ├── settings/
        │   └── route.ts        # GET/PATCH: 알림 설정
        ├── prescriptions/
        │   └── route.ts        # GET: 처방 내역 목록
        ├── isi/
        │   └── route.ts        # GET/POST: ISI 이력 조회·제출
        ├── qna/
        │   ├── route.ts        # GET/POST: 문의 목록·작성
        │   └── [id]/
        │       └── route.ts    # GET: 문의 상세
        ├── records/
        │   ├── sleep/
        │   │   └── route.ts    # GET: 수면 일지 (?range=7d|30d|90d)
        │   ├── efficiency/
        │   │   └── route.ts    # GET: 수면 효율 계산 (?range=30d|90d)
        │   ├── exams/
        │   │   └── [type]/
        │   │       └── route.ts    # GET: 검사 결과 (type: hrv·inbody·qeeg)
        │   ├── isi/
        │   │   └── route.ts    # GET: ISI 점수 이력
        │   └── medication/
        │       └── route.ts    # GET: 복약 이력 (?days=30)
        └── admin/
            ├── stats/
            │   └── route.ts    # GET: 대시보드 통계 (주의환자 포함)
            ├── patients/
            │   ├── route.ts    # GET/POST: 환자 목록(페이지네이션)·등록
            │   ├── check/
            │   │   └── route.ts    # GET: 등록번호 중복 확인
            │   └── [id]/
            │       ├── route.ts    # GET/PATCH/DELETE: 환자 상세·수정·삭제
            │       ├── reset-password/
            │       │   └── route.ts    # POST: 환자 비밀번호 초기화
            │       ├── disorders/
            │       │   ├── route.ts    # GET/POST: 진단 목록·추가
            │       │   └── [did]/
            │       │       └── route.ts    # PATCH/DELETE: 진단 수정·삭제
            │       ├── isi/
            │       │   └── route.ts    # GET: 환자 ISI 이력 (관리자용)
            │       ├── sleep/
            │       │   └── route.ts    # GET/POST: 수면 데이터 조회·입력(upsert)
            │       ├── exam/
            │       │   ├── route.ts    # GET/POST: 검사 결과 조회·입력
            │       │   └── [eid]/
            │       │       └── route.ts    # PATCH/DELETE: 검사 결과 수정·삭제
            │       ├── export/
            │       │   └── route.ts    # GET: 수면 일지 CSV 내보내기
            │       └── prescriptions/
            │           ├── route.ts    # POST: 처방 추가
            │           └── [pid]/
            │               └── route.ts    # PATCH/DELETE: 처방 수정·삭제
            └── qna/
                ├── route.ts    # GET: Q&A 전체 목록 (환자 정보 join)
                └── [id]/
                    └── route.ts    # PATCH: 답변 등록 (Web Push 발송 포함)
```

### `public/` 구조

```
public/
├── sw.js           # Service Worker — push 이벤트 수신, 알림 표시, 클릭 시 URL 열기
├── manifest.json   # PWA manifest (name: "수면클리닉", start_url: "/home")
└── icons/
    ├── icon-192.svg
    └── icon-512.svg
```

---

### 핵심 파일 상세

#### `src/middleware.ts`

모든 요청의 진입점. Supabase 세션을 쿠키에서 읽어 인증 상태를 확인한다.

| 조건 | 동작 |
|------|------|
| 비로그인 + `/api/*` 외 비공개 경로 | `/login` 리다이렉트 |
| 비로그인 + `/admin/*` (로그인 제외) | `/admin/login` 리다이렉트 |
| 로그인 + `/login` 접근 | `/home` 리다이렉트 |
| 로그인 + `/admin/login` 접근 | `/admin/dashboard` 리다이렉트 |
| `/api/*` 경로 | 미들웨어 통과, Route Handler에서 직접 인증 |

#### `src/lib/utils.ts`

```ts
cn(...inputs)                          // clsx + tailwind-merge 조합
calcSleepEfficiency(bedtime, wakeTime, onsetLatency, awakeningCount) → number
// → (실제 수면 / 침대 시간) × 100, 잠들기·각성 시간 차감
// → ≥85% 정상 / 70~84% 주의 / <70% 불량

getIsiLevel(score)       → { label, color, bg }   // 0~7·8~14·15~21·22~28
getSleepEfficiencyLevel(pct) → { label, color }    // 정상·주의·불량
```

#### `src/lib/supabase/admin-guard.ts`

```ts
requireAdmin()
// → { error: NextResponse | null, supabase, user }
// 모든 /api/admin/* Route Handler 최상단에서 호출
// role !== 'admin' 이면 error(403) 반환, 이후 로직 실행 안 됨
```

#### `src/types/index.ts`

DB 9개 테이블에 대응하는 TypeScript 인터페이스 정의.  
`Patient`, `UserRole`, `SleepDisorder`, `SleepDiary`, `TreatmentRecord`,  
`ExamResult`, `IsiAssessment`, `Qna`, `Settings`

#### `src/app/globals.css`

Tailwind v4의 모든 커스텀 토큰을 `@theme inline { }` 블록에 CSS 변수로 정의.  
새 색상·크기 추가 시 이 파일에만 추가하면 된다.

```css
/* 주요 토큰 */
--color-brand-500: #4A90D9     → bg-brand-500, text-brand-500
--color-text-primary: #1A202C  → text-text-primary
--color-bg-secondary: #F5F7FA  → bg-bg-secondary
--color-success / warning / caution / danger
--radius-sm / md / lg          → rounded-[--radius-sm] 형태로 사용
--shadow-card / card-hover     → shadow-[--shadow-card] 형태로 사용
```

---

## 8. Supabase 구조

### 8-1. 프로젝트 정보

| 항목 | 값 |
|------|-----|
| 프로젝트 ID | `aalzgqtydeilklzufxcn` |
| DB 초기화 스크립트 | `supabase_schema.sql` (프로젝트 루트) |
| 재실행 가능 여부 | ✅ idempotent — `CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `DROP TRIGGER IF EXISTS` 사용 |

---

### 8-2. 테이블 구조

#### `patients` — 환자 기본 정보

| 컬럼 | 타입 | 제약 |
|------|------|------|
| `id` | uuid PK | `uuid_generate_v4()` |
| `registration_number` | text | NOT NULL, UNIQUE |
| `name` | text | NOT NULL |
| `birth_date` | date | nullable |
| `phone` | text | nullable |
| `created_at` / `updated_at` | timestamptz | auto |

---

#### `user_roles` — Auth ↔ 환자 연결 + 권한

| 컬럼 | 타입 | 제약 |
|------|------|------|
| `id` | uuid PK | `auth.users(id)` 참조, cascade delete |
| `role` | text | `'patient'` 또는 `'admin'` |
| `patient_id` | uuid | `patients(id)` 참조, nullable (관리자는 null) |
| `created_at` | timestamptz | auto |

> **핵심**: 이 테이블이 인증의 중심이다.  
> 모든 API에서 `auth.uid()` → `user_roles` 조회 → `patient_id` 또는 `role` 확인 순으로 권한을 판별한다.

---

#### `sleep_disorders` — 수면장애 진단

| 컬럼 | 타입 | 제약 |
|------|------|------|
| `patient_id` | uuid | NOT NULL, cascade delete |
| `diagnosis` | text | NOT NULL |
| `severity` | text | `'경미'` / `'중등도'` / `'심각'` |
| `onset_date` | date | nullable |
| `notes` | text | nullable |

---

#### `sleep_diary` — 수면 일지 ⭐ 가장 핵심 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `patient_id` + `diary_date` | — | **복합 UNIQUE** — upsert 기준 |
| `bedtime` / `wake_time` | text | `"HH:MM"` 형식 |
| `sleep_onset_latency` | text | `"0~10분"` / `"10~30분"` / `"30~60분"` / `"60분 이상"` |
| `night_awakening_count` | text | `"없음"` / `"1회"` / `"2회"` / `"3회 이상"` |
| `sleep_quality` / `morning_fatigue` / `condition` | int | 1~5 |
| `daytime_sleepiness` | text | `"없음"` / `"약간"` / `"심함"` |
| `nap_taken` | boolean | default false |
| `dream` | text | `"없음"` / `"기억 안남"` / `"꿈꿈"` |
| `caffeine` | text | `"없음"` / `"1잔"` / `"2잔"` / `"3잔 이상"` |
| `alcohol` | boolean | default false |
| `herbal_morning/lunch/evening/bedtime` | boolean | 한약 복약 |
| `western_morning/lunch/evening/bedtime` | boolean | 양약 복약 |
| `total_sleep_min` / `deep_sleep_min` / `light_sleep_min` / `rem_sleep_min` | int | 관리자 입력 (분) |
| `admin_note` | text | 관리자 내부 메모, 환자 미표시 |
| `updated_by` | uuid | 마지막 수정자 (auth.users 참조) |

---

#### `treatment_records` — 처방 내역

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `patient_id` | uuid | NOT NULL, cascade delete |
| `visit_date` | date | 방문일 |
| `prescription` | text | 처방 내용 |
| `treatment_notes` | text | 원장 코멘트 (환자에게 표시) |
| `next_visit_date` | date | 다음 방문 예정일 |
| `created_by` | uuid | 작성 관리자 (auth.users 참조) |

---

#### `exam_results` — 검사 결과

| 컬럼 | 타입 | 제약 |
|------|------|------|
| `exam_type` | text | `'HRV'` / `'InBody'` / `'QEEG'` |
| `result_data` | jsonb | 검사 항목 key-value (자유 형식) |
| `summary` | text | 원장 코멘트 (환자에게 표시) |
| `created_by` | uuid | 작성 관리자 |

---

#### `isi_assessments` — ISI 자가진단

| 컬럼 | 타입 | 제약 |
|------|------|------|
| `q1` ~ `q7` | int | 0~4 범위 check |
| `total_score` | int | 앱에서 계산 후 저장 (0~28) |
| `assessed_at` | timestamptz | 제출 시각 |

---

#### `qna` — 환자 문의

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `question` | text | NOT NULL |
| `answer` | text | nullable (답변 전 null) |
| `is_answered` | boolean | default false |
| `answered_by` | uuid | 답변 관리자 |
| `answered_at` | timestamptz | 답변 시각 |

---

#### `settings` — 알림 설정

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK | `auth.users(id)` 직접 참조 (patient_id 아님) |
| `push_enabled` | boolean | 전체 알림 |
| `diary_remind` | boolean | 수면 일지 작성 알림 |
| `med_alarm` | boolean | 복약 알림 |
| `qna_alarm` | boolean | Q&A 답변 알림 |

> 현재 토글 UI만 구현됨. 실제 푸시 발송 로직은 미구현.

---

### 8-3. 인증 구조

Supabase Auth의 `auth.users` 테이블을 직접 쓰지 않고, `user_roles` 테이블을 통해 역할을 분리한다.

```
auth.users (Supabase 관리)
    │  id (UUID)
    │
    └── user_roles
            ├── role = 'patient'  →  patient_id → patients
            └── role = 'admin'    →  patient_id = NULL
```

**환자 로그인 흐름**
```
1. 환자가 등록번호 입력 (예: "20240001")
2. 프론트에서 이메일로 변환: "20240001@patient.local"
3. supabase.auth.signInWithPassword({ email, password })
4. 세션 쿠키 저장 (@supabase/ssr)
5. API 호출 시: auth.uid() → user_roles.patient_id → 데이터 접근
```

**관리자 로그인 흐름**
```
1. 관리자가 실제 이메일 입력 (예: "admin@clinic.com")
2. supabase.auth.signInWithPassword({ email, password })
3. user_roles.role === 'admin' 검증
4. 실패 시 즉시 signOut() 처리
```

**세션 관리**
- `@supabase/ssr` 패키지가 쿠키 기반으로 세션을 자동 관리
- 서버 컴포넌트·Route Handler에서 `createClient()` (server.ts) 호출로 세션 읽음
- 클라이언트 컴포넌트에서 `createClient()` (client.ts) 호출
- 미들웨어에서 매 요청마다 세션 갱신 처리

---

### 8-4. RLS 정책 요약

모든 테이블에 RLS가 활성화되어 있다. 정책을 통과하지 못하면 빈 결과(`[]`) 또는 에러를 반환한다.

| 테이블 | 환자 권한 | 관리자 권한 |
|--------|-----------|-------------|
| `patients` | 본인 레코드만 SELECT | 전체 SELECT + INSERT + UPDATE + DELETE |
| `user_roles` | 본인 레코드만 SELECT | (별도 정책 없음 — service_role로 관리) |
| `sleep_disorders` | 본인 patient_id만 SELECT | 전체 ALL |
| `sleep_diary` | 본인 patient_id ALL | SELECT + INSERT + UPDATE |
| `treatment_records` | 본인 patient_id SELECT | 전체 ALL |
| `exam_results` | 본인 patient_id SELECT | 전체 ALL |
| `isi_assessments` | 본인 patient_id ALL | SELECT |
| `qna` | 본인 patient_id ALL | 전체 ALL |
| `settings` | `auth.uid() = id` ALL | (별도 정책 없음) |

---

### 8-5. 환자/관리자 권한 분리 방식

#### DB 레벨 (RLS)
RLS 정책의 `using` 절에서 `auth.uid()`로 현재 로그인 사용자를 식별하고, `user_roles` 테이블에서 역할을 확인한다.

```sql
-- 환자: 본인 데이터만
using (patient_id in (
  select patient_id from public.user_roles where id = auth.uid()
))

-- 관리자: 전체 접근
using (exists (
  select 1 from public.user_roles where id = auth.uid() and role = 'admin'
))
```

#### API 레벨 (Route Handler)
- **환자 API**: `auth.getUser()` → `user_roles`에서 `patient_id` 조회 → 해당 patient_id로만 쿼리
- **관리자 API**: `requireAdmin()` → `role !== 'admin'` 이면 403 반환

#### 클라이언트 레벨 (Admin Client)
환자 등록 시에만 `createAdminClient()` (service_role 키)를 사용해 `auth.admin.createUser()`를 호출한다.  
그 외 모든 쿼리는 일반 `createClient()`로 처리하며 RLS가 적용된다.

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY`는 RLS를 우회한다.  
> 반드시 서버 전용 (`src/lib/supabase/server.ts`)에서만 사용하고,  
> 클라이언트 번들(`'use client'` 파일)에 절대 import 하지 말 것.

---

## 9. Vercel 배포 구조

### 9-1. 연결된 프로젝트

| 항목 | 값 |
|------|-----|
| Vercel 프로젝트 이름 | `patient-sleep-app` |
| 프로덕션 URL | `https://patient-sleep-app.vercel.app` |
| 배포 리전 | `icn1` (서울) |
| GitHub 레포 | `sunny94-git/patient-sleep-app` |
| 배포 브랜치 | `main` (main에 push 또는 PR 머지 시 자동 배포) |
| 프레임워크 | Next.js (자동 감지) |

Vercel은 GitHub `main` 브랜치에 변경이 생기면 자동으로 프로덕션 배포를 트리거한다.  
`main` 외 브랜치에 push하면 Preview URL이 생성된다.

---

### 9-2. 필요한 환경 변수

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables에 아래 3개가 등록돼 있어야 한다.  
**값은 이 문서에 기록하지 않는다. Supabase 대시보드에서 직접 확인할 것.**

| 변수 이름 | 범위 | 설명 |
|-----------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview + Development | Supabase 프로젝트 API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview + Development | Supabase anon(public) 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview | Supabase service_role 키 (서버 전용) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Production + Preview + Development | Web Push VAPID 공개키 |
| `VAPID_PRIVATE_KEY` | Production + Preview | Web Push VAPID 개인키 (서버 전용) |

> `NEXT_PUBLIC_` 접두어가 붙은 변수는 클라이언트 번들에 포함된다.  
> `SUPABASE_SERVICE_ROLE_KEY`는 `NEXT_PUBLIC_` 접두어가 없으므로 서버에서만 접근 가능하다.

**로컬 개발 시** `.env.local` 파일에 동일한 변수를 설정한다.  
`.env.local`은 `.gitignore`에 포함돼 있어 커밋되지 않는다.

---

### 9-3. `vercel.json` 설정

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "regions": ["icn1"]
}
```

특별한 리다이렉트·헤더 규칙은 없다. Next.js의 `middleware.ts`에서 모든 라우팅을 처리한다.

---

### 9-4. 빌드·배포 시 주의사항

#### TypeScript 오류는 빌드 실패로 이어진다
Vercel은 `npm run build` (`next build`)를 실행하며, 타입 오류가 있으면 배포가 중단된다.  
코드 수정 후 반드시 로컬에서 `npm run build`로 사전 검증한다.

```bash
npm run build    # 반드시 성공 확인 후 push
```

#### `'use client'` 경계 주의
- **Recharts 컴포넌트**: 반드시 `'use client'` 파일에서만 import
- **Supabase client.ts**: 브라우저 전용 — Server Component에서 import 금지
- **Supabase server.ts**: 서버 전용 — `'use client'` 파일에서 import 금지
- 혼용 시 빌드 오류 또는 런타임 에러 발생

#### 환경 변수 누락 시 빌드 성공 → 런타임 에러
환경 변수가 없어도 빌드는 통과하지만, 실제 요청 시 Supabase 연결 실패로 500 에러가 발생한다.  
Vercel에 환경 변수가 올바르게 등록됐는지 배포 전 반드시 확인한다.

#### Preview 배포와 Supabase Redirect URL
Vercel Preview URL(`https://<branch>-patient-sleep-app.vercel.app`)에서 Supabase Auth가 동작하려면  
Supabase 대시보드 → Authentication → URL Configuration → Redirect URLs에 `https://*.vercel.app/**`가 등록돼 있어야 한다.  
현재 프로덕션 URL과 와일드카드 패턴이 등록된 상태다.

---

## 10. GitHub 작업 방식

### 10-1. 브랜치 구조

| 브랜치 | 용도 |
|--------|------|
| `main` | 프로덕션 배포 브랜치. Vercel이 이 브랜치를 감시하며 자동 배포한다. |

**현재 운영 방식**
- 현재는 `main`에 직접 push하는 방식으로 운영 중 (소규모 클리닉 앱 특성상)
- 코드 수정 후 반드시 `npm run build` 성공 확인 → commit → `git push -u origin main`
- 새로운 큰 기능 추가 시 `feature/기능명` 브랜치를 생성해 작업한다.

---

### 10-2. 커밋 메시지 규칙

`타입: 내용` 형식을 따른다.

| 타입 | 사용 시점 |
|------|-----------|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 개선 |
| `style` | UI·스타일만 변경 |
| `docs` | 문서(`AGENTS.md`, `CLAUDE.md` 등) 수정 |
| `chore` | 패키지 설치, 설정 파일 변경 |

예시:
```
feat: 환자 비밀번호 변경 페이지 추가
fix: 수면 효율 계산 취침 시각 오전/오후 처리 오류 수정
docs: AGENTS.md 섹션 10 작성
```

---

### 10-3. PR 규칙

- PR 제목은 커밋 메시지와 동일한 형식 (`타입: 내용`)
- PR 본문에 변경 내용 요약, 테스트 방법, 스크린샷(UI 변경 시) 포함
- `npm run build` 성공 확인 후 PR 생성
- main 머지 전 Vercel Preview URL에서 동작 검증 권장

---

### 10-4. 레포지토리 정보

| 항목 | 값 |
|------|-----|
| GitHub 레포 | `sunny94-git/patient-sleep-app` |
| 기본(배포) 브랜치 | `main` |
| Vercel 연동 | GitHub 레포 → Vercel 자동 배포 연결됨 |

---

## 11. 개발 시 주의사항

### 11-1. 개인·의료 데이터 민감성

이 앱은 실제 환자의 수면 상태, 복약 이력, 검사 결과, 진단 정보를 다룬다.

- **테스트 데이터 사용**: 개발·테스트 시 실제 환자 이름·연락처·진단명을 코드, 커밋, 이슈, PR에 절대 포함하지 않는다.
- **로그 주의**: `console.log`로 환자 데이터를 출력하는 코드를 커밋하지 않는다.
- **스크린샷**: PR이나 문서에 첨부하는 스크린샷에 실제 환자 정보가 노출되지 않도록 한다.
- **로컬 DB**: 로컬 개발 시 Supabase 프로덕션 DB에 직접 연결하므로, 실수로 프로덕션 데이터를 변경·삭제하지 않도록 주의한다.

---

### 11-2. `SUPABASE_SERVICE_ROLE_KEY` 사용 제한

service_role 키는 RLS를 완전히 우회하며, 모든 테이블에 무제한 접근이 가능하다.

**허용된 사용처**
- `src/lib/supabase/server.ts`의 `createAdminClient()` 함수 내부
- 환자 등록 시 `auth.admin.createUser()` 호출 (서버 Route Handler 안에서만)

**절대 금지**
- `'use client'` 파일에서 import 또는 사용
- 환경 변수 값을 코드에 하드코딩
- 클라이언트 번들에 포함될 수 있는 경로에서 참조
- `NEXT_PUBLIC_` 접두어를 붙여 노출

> 위반 시 RLS가 무력화되어 모든 환자 데이터가 무방비 상태가 된다.

---

### 11-3. 환경 변수 값 기록 금지

아래 항목은 어떤 파일에도 값을 기록하지 않는다:

| 금지 항목 | 이유 |
|-----------|------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` 실제 값 | Git에 노출되면 공개 접근 가능 |
| `SUPABASE_SERVICE_ROLE_KEY` 실제 값 | RLS 우회 — 유출 시 전체 DB 노출 |
| 관리자 이메일·비밀번호 | 계정 탈취 위험 |
| 실제 환자 등록번호·연락처 | 개인정보 침해 |

환경 변수 **이름**은 문서에 기록해도 무방하다. **값**만 기록 금지다.  
값이 필요하면 Supabase 대시보드 또는 Vercel 대시보드에서 직접 확인한다.

---

### 11-4. 코드 작성 규칙

#### Tailwind v4
- `tailwind.config.ts` 파일을 새로 만들지 않는다.
- 새 색상·간격·반경 등 디자인 토큰은 반드시 `src/app/globals.css`의 `@theme inline { }` 블록에 추가한다.
- 인라인 임의값 사용 예: `rounded-[--radius-md]`, `shadow-[--shadow-card]`

#### Supabase 클라이언트 구분
- 서버 컴포넌트 / Route Handler → `import { createClient } from '@/lib/supabase/server'`
- 클라이언트 컴포넌트 (`'use client'`) → `import { createClient } from '@/lib/supabase/client'`
- 두 파일은 export 이름이 같지만 내부 구현이 다르다. import 경로를 반드시 확인한다.

#### 관리자 API 인증
- 모든 `/api/admin/*` Route Handler 최상단에서 `requireAdmin()`을 호출한다.
- `requireAdmin()`이 반환한 `error`가 null이 아니면 즉시 `return error`로 응답한다.

```ts
const { error, supabase, user } = await requireAdmin()
if (error) return error
```

#### 빌드 검증
- 코드 수정 후 커밋 전에 반드시 `npm run build`를 실행한다.
- TypeScript 타입 오류·ESLint 오류가 없어야 한다.

---

## 12. Codex 다음 작업 우선순위

아래 순서로 작업을 진행하는 것을 권장한다. 각 항목은 독립적으로 구현 가능하다.

| 우선순위 | 작업 | 난이도 | 비고 |
|----------|------|--------|------|
| ~~1~~ | ~~PWA manifest 추가~~ | ~~낮음~~ | ✅ 완료 |
| ~~2~~ | ~~환자 비밀번호 변경~~ | ~~중간~~ | ✅ 완료 (`/settings` 페이지) |
| ~~3~~ | ~~수면장애 진단 관리 (관리자)~~ | ~~중간~~ | ✅ 완료 |
| ~~4~~ | ~~처방 수정·삭제 UI~~ | ~~중간~~ | ✅ 완료 |
| ~~5~~ | ~~관리자 환자 ISI 조회~~ | ~~중간~~ | ✅ 완료 |
| ~~6~~ | ~~환자 비활성화·삭제~~ | ~~중간~~ | ✅ 완료 |
| ~~7~~ | ~~환자 목록 페이지네이션~~ | ~~낮음~~ | ✅ 완료 |
| ~~8~~ | ~~커스텀 에러 페이지~~ | ~~낮음~~ | ✅ 완료 |
| ~~9~~ | ~~Web Push 알림 (Q&A 답변)~~ | ~~중간~~ | ✅ 완료 |
| ~~10~~ | ~~복약 이력 탭~~ | ~~낮음~~ | ✅ 완료 |
| ~~11~~ | ~~수면 일지 날짜별 수정 (관리자)~~ | ~~중간~~ | ✅ 완료 — 행 수정 버튼, 전 항목 인라인 편집 |
| ~~12~~ | ~~검사 결과 수정·삭제~~ | ~~중간~~ | ✅ 완료 — `PATCH/DELETE /api/.../exam/[eid]` |
| ~~13~~ | ~~CSV 데이터 내보내기~~ | ~~중간~~ | ✅ 완료 — `GET /api/.../export`, BOM 포함 |
| ~~14~~ | ~~Q&A 텍스트 검색~~ | ~~낮음~~ | ✅ 완료 — 질문·환자명·등록번호 클라이언트 필터 |
| ~~15~~ | ~~비활동 자동 로그아웃~~ | ~~낮음~~ | ✅ 완료 — `InactivityGuard` 15분 |

**현재 계획된 모든 작업이 완료된 상태. 남은 예정 작업 없음.**

---

### Codex 즉시 요청 프롬프트

아래 프롬프트를 Codex에 그대로 붙여넣어 작업을 시작할 수 있다.

---

#### 프롬프트 1 — PWA manifest 추가

```
수면장애 클리닉 환자 앱(Next.js 16, App Router)에 PWA manifest를 추가해줘.

현재 상태:
- `src/app/layout.tsx`에 `manifest: '/manifest.json'` 메타데이터가 이미 선언돼 있음
- `public/manifest.json` 파일이 존재하지 않아 "홈 화면에 추가" 시 아이콘·앱 이름이 표시되지 않음
- `public/` 디렉터리에는 기본 SVG 파일들만 있음

해야 할 작업:
1. `public/manifest.json` 생성
   - name: "수면클리닉"
   - short_name: "수면클리닉"
   - start_url: "/home"
   - display: "standalone"
   - background_color: "#F5F7FA"
   - theme_color: "#4A90D9"
   - icons: 192x192, 512x512 (PNG, any purpose)
2. `public/icons/` 디렉터리에 아이콘 placeholder SVG를 PNG로 대체할 수 있도록
   현재 앱 로고 스타일(파란 배경 + 흰색 "W" 텍스트)의 SVG 아이콘 2종 생성
   (192x192, 512x512 크기)
3. `npm run build`로 빌드 오류 없음 확인 후 커밋

브랜치: claude/document-project-status-3Bm9S
커밋 메시지 형식: feat: PWA manifest 및 앱 아이콘 추가
```

---

#### 프롬프트 2 — 환자 비밀번호 변경 기능 추가

```
수면장애 클리닉 환자 앱(Next.js 16, App Router, Supabase)에 환자용 비밀번호 변경 기능을 추가해줘.

현재 상태:
- 환자가 초기 비밀번호를 앱 내에서 변경하는 화면이 없음
- 환자 앱 하단 탭바(`src/components/layout/BottomTabBar.tsx`)에 로그아웃 버튼도 없음
- 인증: Supabase Auth, 클라이언트에서 `createClient()` (`src/lib/supabase/client.ts`) 사용

해야 할 작업:
1. `src/app/(patient)/settings/page.tsx` 생성
   - '현재 비밀번호', '새 비밀번호', '새 비밀번호 확인' 입력 필드
   - 제출 시 `supabase.auth.updateUser({ password: newPassword })` 호출
   - 성공/실패 토스트 메시지 표시
   - 로그아웃 버튼 포함 (클릭 시 `supabase.auth.signOut()` → `/login` 리다이렉트)
   - 디자인: 기존 환자 앱 스타일 유지 (`bg-bg-secondary`, `text-text-primary` 등 globals.css 토큰 사용)

2. `src/components/layout/BottomTabBar.tsx` 수정
   - 기존 5개 탭에 '설정' 탭 추가 (경로: `/settings`, 아이콘: ⚙️ 또는 lucide-react의 Settings 아이콘)
   - 탭이 6개가 되면 레이아웃이 깨질 수 있으므로, 탭 수를 유지하고 싶다면
     문의(qna) 탭에 설정을 통합하거나 홈 탭 내 링크로 처리해도 됨 — 판단해서 결정

3. `src/middleware.ts` 확인
   - `/settings` 경로가 인증 보호 대상에 포함되는지 확인, 누락 시 추가

4. `npm run build` 성공 확인 후 커밋

브랜치: claude/document-project-status-3Bm9S
커밋 메시지 형식: feat: 환자 비밀번호 변경 및 설정 페이지 추가
```

---

#### 프롬프트 3 — 관리자 수면장애 진단 관리 추가

```
수면장애 클리닉 관리자 대시보드(Next.js 16, App Router, Supabase)에 수면장애 진단 관리 기능을 추가해줘.

현재 상태:
- 환자 상세 페이지(`src/app/admin/(dashboard)/patients/[id]/page.tsx`)에서 `sleep_disorders` 데이터를 조회만 가능
- 진단 추가·수정·삭제 UI와 API가 없음
- `sleep_disorders` 테이블과 RLS 정책은 이미 구현돼 있음
- 모든 관리자 API는 `requireAdmin()`(`src/lib/supabase/admin-guard.ts`)으로 인증 처리

DB 테이블 (`sleep_disorders`):
- patient_id (uuid, FK → patients)
- diagnosis (text, NOT NULL)
- severity (text: '경미' | '중등도' | '심각')
- onset_date (date, nullable)
- notes (text, nullable)

해야 할 작업:
1. API 라우트 3개 생성
   - `src/app/api/admin/patients/[id]/disorders/route.ts`
     GET: 해당 환자의 진단 목록 조회
     POST: 새 진단 추가 (diagnosis 필수, severity/onset_date/notes 선택)
   - `src/app/api/admin/patients/[id]/disorders/[did]/route.ts`
     PATCH: 진단 수정 (diagnosis, severity, onset_date, notes)
     DELETE: 진단 삭제

2. 환자 상세 페이지 수정 (`src/app/admin/(dashboard)/patients/[id]/page.tsx`)
   - 기존 진단 목록 표시 아래에 "진단 추가" 인라인 폼 추가
     입력: 진단명(필수), 중증도 선택(경미/중등도/심각), 발병일(선택), 메모(선택)
   - 각 진단 항목에 수정·삭제 버튼 추가
     수정: 인라인 편집 또는 별도 폼 토글
     삭제: 확인 후 삭제

3. 모든 API에 `requireAdmin()` 적용
4. `npm run build` 성공 확인 후 커밋

브랜치: claude/document-project-status-3Bm9S
커밋 메시지 형식: feat: 관리자 수면장애 진단 추가·수정·삭제 기능 구현
```

---

## 13. 현재 실제 배포 상태

### 13-1. Vercel 배포 현황

| 항목 | 상태 |
|------|------|
| 프로덕션 URL | `https://patient-sleep-app.vercel.app` |
| 배포 브랜치 | `main` |
| 최신 main 커밋 | 수면 일지 날짜별 수정·검사 결과 수정삭제·CSV 내보내기·Q&A 검색·비활동 자동 로그아웃 |
| 빌드 결과 | ✅ 성공 |

### 13-2. 실제 동작 확인 완료 항목

| 기능 | 확인 결과 |
|------|-----------|
| 관리자 로그인 (`admin@clinic.com`) | ✅ 정상 동작 |
| 환자 등록 (관리자 대시보드) | ✅ 정상 동작 (user_roles 자동 삽입) |
| 환자 로그인 | ✅ 정상 동작 |
| 환자 홈 탭 (`/home`) | ✅ 정상 렌더링 |
| PWA 홈 화면 추가 | ✅ manifest 적용됨 |
| 환자 설정 탭 (`/settings`) | ✅ 배포 완료 |
| 관리자 진단 CRUD | ✅ 배포 완료 |
| 처방 수정·삭제 UI | ✅ 배포 완료 |
| 환자 삭제·비밀번호 초기화 | ✅ 배포 완료 |
| 복약 이력 탭 | ✅ 배포 완료 |
| 수면 일지 날짜별 수정 | ✅ 배포 완료 |
| 검사 결과 수정·삭제 | ✅ 배포 완료 |
| CSV 데이터 내보내기 | ✅ 배포 완료 |
| Q&A 텍스트 검색 | ✅ 배포 완료 |
| 비활동 자동 로그아웃 (15분) | ✅ 배포 완료 |

### 13-3. 배포 URL 진입 가능 여부

| 경로 | 동작 |
|------|------|
| `/` | 역할별 리다이렉트 (비로그인→`/login`, admin→`/admin/dashboard`, 환자→`/home`) |
| `/login` | 환자 로그인 화면 |
| `/admin/login` | 관리자 로그인 화면 |
| `/home` | 환자 홈 탭 (로그인 필요) |
| `/records` | 수면/효율/검사/ISI/복약 기록 탭 |
| `/settings` | 비밀번호 변경 + 로그아웃 (로그인 필요) |
| `/admin/dashboard` | 통계 + 주의환자 카드 |
| `/admin/patients` | 환자 목록 + 페이지네이션 + 일지 배지 |

---

## 14. 실제 운영 전 필수 체크리스트

Vercel 배포 후 실제 환자에게 서비스를 제공하기 전 완료해야 하는 항목. 모든 필수 항목이 완료된 상태다.

| # | 항목 | 현재 상태 | 비고 |
|---|------|-----------|------|
| 1 | 관리자 계정 생성 | ✅ 완료 | `admin@clinic.com` (UUID: `54fb6cf1-10cc-4710-a4ac-c837f7c8aec6`), `user_roles` 삽입 완료 |
| 2 | Vercel 환경 변수 등록 | ✅ 완료 | Production + Preview 범위 등록 완료 |
| 3 | Supabase RLS 적용 | ✅ 완료 | `supabase_schema.sql` 실행, 9개 테이블 RLS 활성화 |
| 4 | Supabase Auth Redirect URL | ✅ 완료 | `https://patient-sleep-app.vercel.app/**`, `https://*.vercel.app/**` 등록됨 |
| 5 | 테스트 환자 계정 | ✅ 완료 | 홍길동 / 등록번호 `2024002` / 비밀번호 `123456` — 정상 로그인 확인 |
| 6 | E2E 로그인 테스트 | ✅ 완료 | 관리자·환자 로그인 / 홈 탭 렌더링 직접 확인 |
| 7 | PWA manifest | ✅ 완료 | `public/manifest.json` + `public/icons/` 아이콘 2종 생성 |

### 추가 관리자 계정 생성 절차 (신규 원장 추가 시)

```sql
-- 1. Supabase Dashboard → Authentication → Users → "Add user"
--    Email: 실제 관리자 이메일
--    Password: 강력한 비밀번호

-- 2. Supabase SQL Editor에서 실행 (생성된 user UUID로 교체):
INSERT INTO public.user_roles (id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = '실제관리자이메일@example.com';
```

---

## 15. 알려진 버그 및 주의할 동작

### 15-1. 실제 동작 확인 완료 항목

| 기능 | 확인 결과 |
|------|-----------|
| 관리자 로그인 | ✅ 정상 동작 |
| 관리자 환자 등록 (`createAdminClient` 흐름) | ✅ 정상 동작 — `user_roles` 자동 삽입 포함 |
| 환자 로그인 | ✅ 정상 동작 |
| 환자 홈 탭 렌더링 | ✅ 정상 렌더링 |
| 환자 설정 탭 (비밀번호 변경 / 로그아웃) | ✅ 배포 완료, UI 확인 |

### 15-2. 런타임 미확인 항목 (데이터 필요)

아래 기능은 코드 구현 완료 + 빌드 통과 상태이나, 실제 데이터로 검증이 아직 안 된 기능이다.

| 기능 | 확인 방법 |
|------|-----------|
| 수면 일지 제출 (`/diary` 4단계 폼) | 테스트 환자로 로그인 후 폼 작성·제출 |
| 복약 체크 토글 | 처방이 있는 환자의 홈 탭에서 복약 버튼 클릭 |
| 검사 결과 JSON 저장 | 관리자 → 환자 상세 → 검사 결과 입력 |
| Recharts 차트 (데이터 있는 상태) | 수면 일지 입력 후 기록 탭 차트 확인 |
| 비밀번호 변경 실제 동작 | `/settings`에서 현재 비밀번호 입력 후 변경 시도 |

### 15-3. 과거 발생 후 수정된 버그 (참고용)

| 버그 | 원인 | 수정 방법 |
|------|------|-----------|
| `ERR_TOO_MANY_REDIRECTS` | 미들웨어와 admin layout이 서로 리다이렉트 루프 | 미들웨어에서 `/admin/login` 자동 리다이렉트 제거; admin layout에서 비관리자 `signOut()` 후 리다이렉트 |
| 루트 `/` Next.js 기본 템플릿 표시 | `page.tsx`가 기본 보일러플레이트 그대로 | 역할 기반 서버 컴포넌트로 교체 (`admin→/admin/dashboard`, 환자→`/home`) |
| 환자 로그인 후 `/home` 크래시 | `user_roles` INSERT RLS 정책 없음 → 일반 클라이언트 삽입 실패 → `patient_id` null → API 500 | 환자 등록 API에서 `adminClient` (service_role)로 `user_roles` 삽입, 실패 시 Auth 계정·patients 행 롤백 |

### 15-4. 알려진 제한 사항

| 항목 | 내용 |
|------|------|
| 수면 일지 날짜 (환자 앱) | 환자는 오늘 날짜만 작성 가능. 관리자는 `/admin/patients/[id]/sleep`에서 날짜별 수정 가능 |
| 복약 체크 | 오늘 일지가 없을 때 자동 upsert — 취침·기상 시각 없이 복약 필드만 생성됨 |
| 알림 | Q&A 답변 시 즉시 푸시 구현됨. 일지·복약 예약 알림은 cron 미구현 |
| 비활동 로그아웃 | 15분 타이머. 탭 전환 후 돌아오면 이벤트가 없어 타이머 계속 진행됨 (의도된 동작) |
| 관리자 앱 모바일 | 사이드바 + 컨텐츠 레이아웃. 모바일 반응형 미구현 — 데스크톱 전용 |
| 환자 시크릿 모드 | 관리자 로그인 상태에서 환자 로그인 테스트 시 시크릿 탭 사용 필요 (세션 충돌 방지) |

### 15-5. UI 레이아웃 주의 사항

- **모바일 전용 설계**: 환자 앱은 최대 너비 `max-w-md` 기준. 데스크톱에서는 중앙 정렬로 표시 (의도된 동작)
- **BottomTabBar 6탭**: `min-w-0 flex-1` 클래스로 균등 분배. 탭 추가 시 아이콘·레이블 크기 확인 필요
- **Recharts ResponsiveContainer**: 부모 요소에 명시적 높이 없으면 차트 0px 렌더링. 현재 모든 컨테이너에 `h-48` 또는 `h-64` 적용됨

