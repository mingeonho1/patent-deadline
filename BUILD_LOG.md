# Build Log — 특허 기한 계산기

## Decisions

### [공유인프라] Supabase 단일 프로젝트 공유 — waitlist 공유 테이블(source 구분) + SITE_URL 자동분기

- **선택**: 여러 제품이 Supabase 프로젝트 1개를 공유. `waitlist` 테이블에 `source text not null` 컬럼을 두고 제품명(`"patent-deadline"`)으로 행을 구분. insert에 `source: SOURCE` 추가, select에 `.eq("source", SOURCE)` 필터 추가. `SITE_URL` env를 optional로 env.ts에 추가하고, `siteUrl()` 헬퍼로 `SITE_URL → VERCEL_PROJECT_PRODUCTION_URL → localhost:3000` 순 fallback. `layout.tsx`의 `metadataBase`를 `siteUrl()`로 교체.
- **대안**: 제품별 테이블 분리 (prefix 방식) / 제품별 Supabase 프로젝트 분리
- **이유**: 단일 프로젝트 공유는 Supabase 무료 티어(프로젝트 2개 제한)를 아끼고 관리 콘솔이 단순해진다. source 컬럼 방식은 테이블 수가 늘어나지 않고 career-vault 등 다른 레포와 DDL 정의를 완전히 공유할 수 있다.
- **트레이드오프**: insert/select 모두에 source 필터를 빠뜨리면 타 제품 데이터와 교차 오염 가능. `SOURCE` 상수를 `storage.ts` 최상단에 고정해 누락을 방지.

### [배포준비] Vercel Analytics: @vercel/analytics 공식 패키지 채택

- **선택**: `@vercel/analytics` 패키지 + `<Analytics />` 컴포넌트 + `track("signup_submitted")` 커스텀 이벤트
- **대안**: Plausible / 직접 fetch로 이벤트 수집
- **이유**: Vercel 배포 환경과 네이티브 통합. Vercel 환경 밖에서는 라이브러리 자체가 no-op으로 동작해 로컬 dev에서 에러 없음. shipping 스킬에서 요구하는 `signup_submitted` 이벤트 수집을 가장 적은 코드로 충족. payment 이벤트는 PLAN.md에 결제 기능이 없으므로 생략.
- **트레이드오프**: Vercel 종속성 추가. 타 플랫폼 이전 시 Analytics 부분만 교체 필요.

### [배포준비] metadataBase: NEXT_PUBLIC_APP_URL 환경변수로 OG URL 결정

- **선택**: `metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://patent-deadline.vercel.app")`
- **대안**: 하드코딩 / 빌드 타임 env 검증 추가
- **이유**: Vercel 배포 URL은 프리뷰/프로덕션이 다르다. 환경변수로 주입하되, 미설정 시 프로덕션 URL을 fallback으로 써서 소셜 OG 이미지 경로가 깨지지 않도록 한다. NEXT*PUBLIC* 접두사는 클라이언트 번들에 노출되어도 무방한 공개 URL이므로 시크릿 아님.
- **트레이드오프**: fallback URL이 실제 배포 URL과 다를 경우 OG 이미지 경로 오동작 가능. Vercel에 `NEXT_PUBLIC_APP_URL`을 등록하면 해결.

### [배포준비] OG 이미지 / favicon: next/og ImageResponse edge runtime 채택

- **선택**: `src/app/opengraph-image.tsx`(1200×630) + `src/app/icon.tsx`(32×32) — 모두 `next/og` ImageResponse, `runtime = "edge"`
- **대안**: 정적 PNG 파일 배치 (public/og.png, public/favicon.ico)
- **이유**: 외부 이미지 에디터·파일 없이 코드만으로 생성. Next.js App Router 파일 컨벤션(`opengraph-image.tsx`, `icon.tsx`)을 따르면 메타태그 자동 주입. edge runtime이라 빌드 타임 정적 생성 대신 요청 시 생성되므로 빌드 비용 없음.
- **트레이드오프**: edge runtime 사용 페이지는 정적 생성 비활성화 경고(`⚠ Using edge runtime on a page currently disables static generation for that page`) — OG/favicon 라우트 자체는 페이지가 아니라 메타 라우트이므로 실 서비스 영향 없음.

### [T1] 날짜 표현: UTC 고정 + 정수 y/m/d 분해

- **선택**: `Date.UTC(y, m, d, 12, 0, 0)` + UTC getter(`getUTCFullYear`, `getUTCMonth`, `getUTCDate`)로 날짜 단위 연산
- **대안**: 로컬 타임존 `new Date("YYYY-MM-DD")` 사용 / date-fns timezone 플러그인
- **이유**: 서버리스 환경에서 Node.js 타임존이 UTC이므로 로컬 파싱(`new Date("2026-07-10")`)은 UTC 자정으로 해석되지만, KST(UTC+9) 환경에서는 오전 9시로 편이될 수 있다. DST가 없는 KST이더라도 서버/클라이언트 환경 불일치를 원천 차단하기 위해 UTC noon 고정 방식을 채택한다.
- **트레이드오프**: Date 객체를 항상 UTC 기준으로만 다뤄야 하는 암묵적 제약이 생긴다. 공개 함수 시그니처는 `Date`로 유지해 외부 인터페이스 변경 없음.

### [T1] 고정 공휴일 처리: 연도별 배열에 명시적 하드코딩

- **선택**: 2025~2027 각 연도를 별개 배열(`HOLIDAYS_2025`, `HOLIDAYS_2026`, `HOLIDAYS_2027`)에 모든 날짜를 명시적으로 펼쳐서 기록
- **대안**: 코드로 고정 공휴일 날짜를 연도별 루프로 자동 생성
- **이유**: 대체공휴일 겹침(2025 어린이날+부처님오신날, 2026 삼일절 일요일 대체 등)이 고정 공휴일과 같은 배열에 나란히 있어야 사람이 RULES.md §7과 눈으로 1회 대조하기 쉽다. 음력 공휴일은 자동 생성이 불가능하므로 어차피 수동 입력이 필요하다.
- **트레이드오프**: 2028년 이후 날짜는 수동 추가 필요. MVP 범위가 2025~2027로 명시 한정되어 있어 이 기간에는 무의미한 우려.

### [T5] shadcn/ui 미사용: Tailwind CSS 직접 작성

- **선택**: Tailwind CSS 유틸리티 클래스 직접 작성
- **대안**: shadcn/ui 컴포넌트 라이브러리 설치
- **이유**: 화면이 폼 1개 + 타임라인 1개로 단순하다. shadcn/ui 설치·설정·컴포넌트 커스터마이징 비용이 주말 MVP 빌드에서 효익보다 크다. PLAN.md 기술 스택 메모에서 명시적으로 제외.
- **트레이드오프**: 접근성(a11y) 속성(aria-label, role 등)을 직접 관리해야 한다.

### [T5] Supabase 패키지 미설치: storage 인터페이스 + 인메모리 스텁

- **선택**: `WaitlistStorage` 인터페이스 + 인메모리 Map 구현으로 대기명단 기능 검증
- **대안**: Supabase `@supabase/supabase-js` 패키지 설치 + 실연동
- **이유**: 이번 빌드의 핵심 검증 목표는 "기한 계산기를 계속 쓰고 싶어 이메일을 남기는가"이다. env 키 없이도 기능 흐름을 완전히 검증할 수 있는 인터페이스 분리 구조가 필요하다. PLAN.md 데이터 모델 메모에서 명시적으로 보류.
- **트레이드오프**: 서버 재시작 시 인메모리 데이터 소실. Supabase 실연동은 env 키 제공 후 별도 태스크(T11)로 분리 처리.

### [목 14:40] 계산기 폼: react-hook-form 미사용

- 선택: useState + safeParse 직접 조합
- 대안: react-hook-form + zodResolver
- 이유: 필드가 3개(발송일·기본기간·직접입력)뿐이라 라이브러리 설치 비용이 효익보다 큼. 폼 상태를 컴포넌트 내부에서 직접 관리해도 40줄 규칙 위반 없이 처리 가능.
- 트레이드오프: 필드 추가 시 수동 에러 매핑 코드가 늘어남. 필드 5개 초과 시 react-hook-form 도입 재검토.

### [목 14:40] BaseMonthsType: schema.ts 단일 진실의 원천으로 통합

- 선택: schema.ts에서 `BaseMonthsType = CalculatorInput["baseMonthsType"]` export, form-fields.tsx는 re-export
- 대안: form-fields.tsx에 `"4" | "2" | "custom"` 리터럴 타입 독립 정의
- 이유: schema 변경 시 두 곳을 고쳐야 하는 동기화 문제 차단. conventions 스킬 "타입은 z.infer 파생" 원칙 준수.
- 트레이드오프: form-fields.tsx가 schema.ts에 의존성 추가. 동일 feature 폴더 내 의존이므로 architecture 규칙 위반 없음.

### [T8] WaitlistStorage: 인터페이스 + 인메모리 스텁 분리

- **선택**: `WaitlistStorage` 인터페이스를 별도 파일(`storage.ts`)에 정의하고, server action은 인터페이스 타입에만 의존
- **대안**: action에서 직접 Map을 다루거나 concrete class import
- **이유**: Supabase 실연동(태스크 11) 교체 시 action/UI 무변경 보장. architecture 스킬 "데이터 흐름은 단방향" 원칙. 인터페이스 의존으로 테스트 시 storage 교체 가능.
- **트레이드오프**: 파일이 3개(schema/storage/actions)로 분리되어 초기 복잡도가 약간 높음. 태스크 11에서 교체 비용을 상쇄.

### [목 14:29] zod v4 enum 에러 메시지: errorMap → error 옵션

- **선택**: `z.enum([...], { error: () => '...' })` — zod v4 API
- **대안**: zod v3 `errorMap` 옵션, `.refine()`으로 대체
- **이유**: zod v4에서 `errorMap`이 `error`로 변경됨. 런타임 검증으로 확인 후 적용. zod 버전이 package.json에 `"^4.0.0"`으로 고정되어 있어 v4 API를 따른다.
- **트레이드오프**: v3로 롤백 시 API 변경 필요. 이번 빌드는 v4 고정이므로 무의미한 우려.

### [수정1] calculateDeadline: 기산일 기반 명시적 알고리즘으로 재구현

- 선택: 기산일(발송일+1) 명시적 계산 후 최후의 월에서 (기산일.day - 1)번째 날로 만료일 결정
- 대안: 기존 "상쇄 가정" 방식 (발송일 + months 클램프)
- 이유: RULES.md §4를 문자 그대로 구현. 발송일이 월말(기산일=1일)일 때 상쇄 가정이 깨지는 버그(4/30→5/30 오답, 법정 5/31) 수정.
- 트레이드오프: 코드가 약간 복잡해졌으나 법적 근거가 명확한 알고리즘이라 유지보수 가능.

### [수정5] src/lib/env.ts 삭제

- 선택: env.ts 삭제 (태스크 11 착수 시 재작성)
- 대안: knip.json ignore 등록
- 이유: 현재 파일에 사용처가 없고, 태스크 11(Supabase 실연동)에서 SUPABASE_URL/KEY 스키마를 함께 작성하는 것이 맥락상 자연스럽다. 미사용 파일을 ignore 처리하면 knip의 경고 목적이 희석됨.
- 트레이드오프: 태스크 11 착수 시 env.ts를 새로 만들어야 함. 내용이 간단해 비용 무의미.

### [수정6] D-day: KST 기준 오늘 날짜 정규화

- 선택: today에 +9h offset 적용 후 UTC y/m/d 추출
- 대안: 서버에서 KST today를 주입
- 이유: 클라이언트 컴포넌트에서 new Date()는 로컬 시간이지만 UTC getter로 날짜를 추출하면 KST 00:00~09:00 사이에 전날이 된다. +9h 보정으로 KST 기준 날짜를 일관되게 추출.
- 트레이드오프: 하드코딩된 +9 offset. 한국 서비스 전용이므로 허용.

### [T11] Supabase 중복 이메일 멱등 처리: 에러코드 23505 무시

- **선택**: insert 후 PostgreSQL error code 23505(unique_violation)를 조용히 무시
- **대안**: upsert with ignoreDuplicates: true
- **이유**: insert는 실제 삽입과 중복을 코드 수준에서 명확히 구분한다. ignoreDuplicates upsert는 "무조건 성공"처럼 보여 의도가 덜 명확하다.
- **트레이드오프**: error code 문자열 비교에 의존 — PostgREST가 항상 "23505"를 반환한다는 전제.

### [T11] @supabase/supabase-js 설치

- **선택**: 공식 JS 클라이언트 @supabase/supabase-js 추가
- **대안**: fetch 직접 호출로 PostgREST API 사용
- **이유**: 인증 헤더 관리, 에러 타입화, insert/upsert 편의 API. 50줄 이내 직접 구현이 불가능한 수준의 부가 기능을 제공.
- **트레이드오프**: 번들 크기 증가. 단, storage.ts는 서버 전용이므로 클라이언트 번들에 포함되지 않음.

---

## 공휴일 테이블 (2025~2027, RULES.md §7 인간 대조용)

배포 전 담당자가 아래 목록과 실제 `holidays.ts` 코드를 1:1 대조할 것.

### 2025년 (18개)

| 날짜       | 내용                            |
| ---------- | ------------------------------- |
| 2025-01-01 | 신정                            |
| 2025-01-28 | 설날 전날                       |
| 2025-01-29 | 설날 당일                       |
| 2025-01-30 | 설날 다음날                     |
| 2025-03-01 | 삼일절                          |
| 2025-03-03 | 삼일절 대체 (토요일)            |
| 2025-05-01 | 근로자의날                      |
| 2025-05-05 | 어린이날                        |
| 2025-05-06 | 어린이날+부처님오신날 겹침 대체 |
| 2025-06-06 | 현충일                          |
| 2025-08-15 | 광복절                          |
| 2025-10-03 | 개천절                          |
| 2025-10-05 | 추석 전날                       |
| 2025-10-06 | 추석 당일                       |
| 2025-10-07 | 추석 다음날                     |
| 2025-10-08 | 추석 대체 (일요일 포함)         |
| 2025-10-09 | 한글날                          |
| 2025-12-25 | 크리스마스                      |

### 2026년 (20개)

| 날짜       | 내용                       |
| ---------- | -------------------------- |
| 2026-01-01 | 신정                       |
| 2026-02-16 | 설날 전날                  |
| 2026-02-17 | 설날 당일                  |
| 2026-02-18 | 설날 다음날                |
| 2026-03-01 | 삼일절                     |
| 2026-03-02 | 삼일절 대체 (일요일)       |
| 2026-05-01 | 근로자의날                 |
| 2026-05-05 | 어린이날                   |
| 2026-05-24 | 부처님오신날               |
| 2026-05-25 | 부처님오신날 대체 (일요일) |
| 2026-06-06 | 현충일 (토요일, 대체 없음) |
| 2026-08-15 | 광복절                     |
| 2026-08-17 | 광복절 대체 (토요일)       |
| 2026-09-24 | 추석 전날                  |
| 2026-09-25 | 추석 당일                  |
| 2026-09-26 | 추석 다음날                |
| 2026-10-03 | 개천절                     |
| 2026-10-05 | 개천절 대체 (토요일)       |
| 2026-10-09 | 한글날                     |
| 2026-12-25 | 크리스마스                 |

### 2027년 (21개)

| 날짜       | 내용                       |
| ---------- | -------------------------- |
| 2027-01-01 | 신정                       |
| 2027-02-06 | 설날 전날                  |
| 2027-02-07 | 설날 당일                  |
| 2027-02-08 | 설날 다음날                |
| 2027-02-09 | 설날 대체 (일요일)         |
| 2027-03-01 | 삼일절                     |
| 2027-05-01 | 근로자의날                 |
| 2027-05-05 | 어린이날                   |
| 2027-05-13 | 부처님오신날               |
| 2027-06-06 | 현충일 (일요일, 대체 없음) |
| 2027-08-15 | 광복절                     |
| 2027-08-16 | 광복절 대체 (일요일)       |
| 2027-09-14 | 추석 전날                  |
| 2027-09-15 | 추석 당일                  |
| 2027-09-16 | 추석 다음날                |
| 2027-10-03 | 개천절                     |
| 2027-10-04 | 개천절 대체 (일요일)       |
| 2027-10-09 | 한글날                     |
| 2027-10-11 | 한글날 대체 (토요일)       |
| 2027-12-25 | 크리스마스                 |
| 2027-12-27 | 크리스마스 대체 (토요일)   |

---

## Stuck & Solved

### reviewer FAIL: env 검증 지연 + 폼 loading 고착 (수정 1·2)

- **증상 1**: `SUPABASE_URL="" pnpm build`가 exit 0으로 성공 — env 검증이 첫 server action 호출 시점으로 지연되어 빌드 타임 오류 미감지.
- **증상 2**: server action에서 env.ts 모듈 로드 중 throw가 발생하면 joinWaitlist의 try/catch가 아닌 모듈 초기화 단계에서 터짐. waitlist-form.tsx가 이 reject를 받아도 try/catch가 없어 loading 상태에 영구 고착.
- **해결 1**: next.config.ts에 `import "./src/lib/env"` 추가. next build 시 config 로드 단계에서 zod parse가 실행되어 env 미설정 시 즉시 exit 1 + 문제 변수명 표시(값 미노출).
- **해결 2**: waitlist-form.tsx의 `await joinWaitlist(email)` 호출을 try/catch로 감싸고, catch 시 `"잠시 후 다시 시도해주세요."` + error 상태로 전환하여 재시도 가능하도록 처리.
- **검증**: `SUPABASE_URL="" pnpm build` → exit 1 + ZodError(SUPABASE_URL 키 이름만 표시) / 정상 env `pnpm build` → exit 0 / `pnpm check` 44 passed / `npx knip` 0건.

### noUncheckedIndexedAccess 타입 에러 (T4 timeline.test.ts)

- **증상**: 배열 인덱스 접근(`timeline[5]`) 시 `'entry' is possibly 'undefined'` TS18048 에러
- **원인**: tsconfig에 `noUncheckedIndexedAccess: true` 설정 → 배열 인덱스 접근 결과 타입이 `T | undefined`
- **해결**: `if (entry === undefined) throw new Error(...)` 명시적 가드로 타입을 좁혀서 해결

### calculateDeadline 월말 발송 버그 (수정 1)

- **증상**: 발송일 2026-04-30 +1개월 → 2026-05-30 (오답). 법정 기한은 2026-05-31.
- **원인**: "초일불산입과 전일만료 상쇄" 가정이 기산일이 월초 1일이 되는 케이스에서 깨짐. 기산일 5/1 → 최후의 월 6월 → 6/1의 전일 = 5/31인데, 기존 코드는 단순히 4/30 + 1개월 = 5/30을 반환.
- **해결**: 기산일(발송일+1)을 명시적으로 계산하고, 최후의 월에서 (기산일.day - 1)번째 날을 만료일로 결정. startDay=1일 때 Date.UTC(y, m, 0)이 자동으로 전달 말일을 반환하는 JS 특성을 활용.

## Backlog

## Ship

### [금 18시] CI 빌드용 플레이스홀더 env 주입

- **선택**: ci.yml의 Build 단계에만 `SUPABASE_URL=https://ci-placeholder.supabase.co`, `SUPABASE_SECRET_KEY=ci-placeholder-not-a-real-key` 주입
- **대안**: CI에서 env 검증 스킵(CI=true 분기) / env 검증을 런타임으로 되돌리기
- **이유**: 빌드 타임 fail-fast는 Vercel 배포 보호용 안전장치다. CI 빌드는 Supabase에 접속하지 않으므로 형식만 유효한 가짜 값으로 충분하고, 검증 코드에 분기를 넣으면 보호가 약해진다.
- **트레이드오프**: 플레이스홀더가 진짜 키처럼 보일 수 있어 주석으로 명시.

### 배포 기록

- 프로덕션 URL: **https://patent-deadline.vercel.app** (Vercel 프로젝트: mingeonho1s-projects/patent-deadline, GitHub 연동 자동 배포)
- 성공 지표 (PLAN.md): 이메일 대기명단 등록 수 — Vercel Analytics `signup_submitted` 이벤트로 계측
- 체크 상태: pnpm check 44개 그린 / knip 0건 / reviewer SHIP IT (본 빌드 2라운드 + 태스크 11 2라운드 + 마감재 2라운드)
- ⚠️ 반영 대기: Vercel 프로젝트 env에 SUPABASE_URL/SUPABASE_SECRET_KEY 등록 + 최신 커밋 push 후 자동 배포되어야 실제 제품이 라이브됨 (등록 전까지 Vercel 빌드는 의도적으로 실패)
- 배포 후 스모크 테스트 체크리스트: 랜딩 진입 → 계산 1회(T1: 2026-03-10, 4개월 → 2026-07-10 금) → 대기명단 제출 → Supabase waitlist 행 확인 → 모바일 뷰포트 1회

## Retro
