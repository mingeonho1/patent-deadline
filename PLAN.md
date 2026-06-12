# 특허 기한 계산기 (한국 특허 전용)

## 문제

의견제출통지서(OA)를 받은 실무자가 초일불산입·월말처리·공휴일 순연 규칙과 연장 횟수별 누적 수수료를 매번 달력과 수수료표를 뒤져가며 수기로 계산하느라 시간을 쓰고 실수 위험을 안는다.

## 타겟

한국 특허출원 OA 대응 기한을 매주 여러 건 관리하는 변리사 사무소 직원, 그리고 외부 대리인 없이 OA 일정을 직접 챙기는 스타트업 특허 담당자.

## 핵심 기능 (단 1개)

OA 발송일과 기본기간(4개월/2개월/직접입력)을 입력한 사용자가 계산 버튼을 누르면, 기본 제출 기한과 연장 시나리오별(+1~+6개월) 기한일·누적 수수료·D-day를 타임라인으로 얻는다.

## 화면 (최대 3개)

1. 랜딩 — "OA 기한, 더 이상 달력 세지 마세요. 발송일만 넣으면 연장 6개월치 기한과 수수료까지 한 번에."
2. 계산기 + 타임라인 — 입력 폼(발송일, 기본기간 선택)과 결과 타임라인(연장 0~+6, 요일·순연·누적 수수료·D-day·소명 경고·면책 문구)이 한 화면에
3. 대기명단 — 이메일 입력 폼 (랜딩 하단과 결과 화면 하단에 동일 폼 배치)

## 데이터 모델 (테이블 3개 이하)

- waitlist: id, email, created_at
  - 이번 빌드는 storage 인터페이스 + 인메모리 스텁으로만 구현. Supabase 실연동은 보류 태스크(11) 참조.
  - 계산 기능 자체는 무상태 — 저장 테이블 없음.

## 기술 스택 메모

- 기본값 준수: TypeScript + Next.js App Router + Tailwind. 저장소에 Next.js 16 + React 19 + zod 4 + vitest 3 세팅 완료.
- **기본값에서 벗어나는 부분 (사유 명시, BUILD_LOG.md 기록 필요)**:
  - shadcn/ui 미설치 — 화면이 폼 1개 + 타임라인 1개라 Tailwind만으로 충분. 의존성 추가 비용이 효익보다 큼.
  - Supabase 패키지 미설치 — 대기명단은 storage 인터페이스 + 인메모리 스텁으로 검증. 실연동은 env 키 제공 후 별도 태스크로 보류.

## Non-goals (이번 주에 절대 안 만드는 것)

- 해외 특허 (미국/유럽/PCT)
- 알림 (이메일/푸시)
- 계정/로그인
- 상표·디자인 기한
- 거절결정불복심판
- 임시공휴일 자동 반영 (UI에 "임시공휴일은 반영되지 않습니다" 문구로 대체 — RULES.md §4)
- 등록료 납부 기한
- 결제 (이번 빌드는 대기명단 검증)
- 계산 이력 저장·캘린더 연동

## 작업 분해 (builder용 체크리스트, 각 2시간 이하)

> 도메인 코어의 날짜 표현: 공개 함수는 `Date`를 주고받되, 타임존 오차 회피 방법(UTC 고정, y/m/d 정수 분해 등)은 builder 재량. 단 테스트 T1~T8이 날짜 단위로 정확히 통과해야 한다.

- [x] 1. 공휴일 테이블 구현 (holidays.ts)
  - 경로: src/features/calculator/holidays.ts
  - 완료 조건: (1) 고정 공휴일(1/1, 3/1, 5/1 근로자의 날, 5/5, 6/6, 8/15, 10/3, 10/9, 12/25)과 2025~2027 음력 공휴일(설·추석 연휴, 부처님오신날) + 대체공휴일이 날짜 배열로 하드코딩된다. (2) `isNonWorkingDay(date: Date): boolean`이 토·일·공휴일·근로자의 날에 true를 반환한다. (3) **채운 2025~2027 전체 날짜 목록을 BUILD_LOG.md에 기록한다** (배포 전 사람 눈 대조용).
  - 참조: RULES.md §4 (공휴일 데이터 구현 방침), §7 / 테스트: T6~T8의 전제 데이터

- [x] 2. 기간 계산 코어 구현 (deadline.ts)
  - 경로: src/features/calculator/deadline.ts (+ deadline.test.ts)
  - 완료 조건: (1) `calculateDeadline(sentDate: Date, months: number): Date`가 초일불산입·역(曆)에 따른 전일 만료·해당일 없으면 월말 3규칙을 만족한다 (공휴일 순연 전 기준). (2) `adjustForHolidays(date: Date): { original: Date; final: Date; deferred: boolean }`이 말일이 토·일·공휴일·근로자의 날이면 다음 첫 근무일로 순연하고 순연 여부를 반환한다. (3) T1~T8 vitest 통과.
  - 참조: RULES.md §4, §6 / 테스트: T1~T8

- [x] 3. 연장 수수료 계산 구현 (fee.ts)
  - 경로: src/features/calculator/fee.ts (+ fee.test.ts)
  - 완료 조건: (1) `calculateExtensionFee(totalExtensionMonths: number): number`가 누적 월차 구간별 금액(2만/3만/6만/12만, 4개월 초과분 월 24만)의 누적 합계를 반환한다. (2) 0개월 입력 시 0을 반환한다. (3) T9~T14 vitest 통과.
  - 참조: RULES.md §3, §6 / 테스트: T9~T14

- [x] 4. 타임라인 조립 함수 구현 (timeline.ts)
  - 경로: src/features/calculator/timeline.ts (+ timeline.test.ts)
  - 완료 조건: (1) `buildTimeline(sentDate: Date, baseMonths: number): TimelineEntry[]`가 연장 0~+6 총 7개 항목을 반환한다. `TimelineEntry = { extensionMonths: number; originalDeadline: Date; deadline: Date; deferred: boolean; cumulativeFee: number; needsJustification: boolean }`. (2) needsJustification은 연장 5개월 이상에서만 true. (3) 각 항목의 deadline·cumulativeFee가 태스크 2·3 함수의 합성 결과와 일치하는 통합 테스트 1개 이상 통과.
  - 참조: RULES.md §2, §5 / 테스트: T1~T14를 합성하는 통합 케이스 (builder가 ID 부여, 예: T15+)

- [x] 5. 입력 스키마 정의 (schema.ts)
  - 경로: src/features/calculator/schema.ts
  - 완료 조건: (1) zod 스키마가 발송일(유효한 날짜)과 기본기간(4 | 2 | 직접입력 1~12 정수)을 검증한다. (2) 미래에서 과도하게 벗어난 값·비정수·범위 밖 직접입력은 parse 실패와 함께 사용자에게 보여줄 한국어 에러 메시지를 반환한다. (3) 파생 타입을 export해 UI·타임라인이 공유한다.
  - 참조: RULES.md §1, CLAUDE.md 철칙 4, architecture 스킬 규칙 3 / 테스트: 스키마 단위 테스트 2개 이상 (builder가 ID 부여)

- [x] 6. 계산기 입력 폼 UI
  - 경로: src/features/calculator/ui/calculator-form.tsx, src/app/(product)/calculator/page.tsx
  - 완료 조건: (1) 발송일 입력 + 기본기간 선택[4개월(2025.7.11 이후 발송, 기본값) / 2개월(그 이전 발송) / 직접 입력]이 표시된다. (2) "통지서 좌측 상단의 제출기일/지정기간을 확인하세요" 안내 문구가 폼에 표시된다. (3) 유효하지 않은 입력 시 스키마(태스크 5)의 에러 메시지가 필드 옆에 표시되고, 유효한 입력 시 타임라인이 렌더된다. 상태: 빈/에러/결과 3가지.
  - 참조: RULES.md §1 / 테스트: 수동 확인 (입력 → 결과 표시)

- [x] 7. 타임라인 결과 UI
  - 경로: src/features/calculator/ui/timeline-view.tsx
  - 완료 조건: (1) 연장 0~+6 각 항목에 기한일(요일 포함)·D-day·누적 수수료가 표시되고, 순연 발생 시 "원래 만료일 → 순연된 날짜" 형태로 표시된다. (2) +5개월 이상 항목에 "5회차부터 정당한 사유 소명 필요" 경고 배지가 표시된다. (3) 결과 하단에 법적 면책 문구("본 계산 결과는 참고용이며 법적 효력이 없습니다. 공식 기한은 특허청 통지서에 기재된 내용을 기준으로 하며, 임시공휴일 등은 반영되지 않을 수 있습니다.")와 "임시공휴일은 반영되지 않습니다" 문구가 고정 표시된다.
  - 참조: RULES.md §5, §4 / 테스트: 수동 확인 + RULES §6 예시값(예: T1 입력) 화면 대조

- [x] 8. 대기명단 storage 인터페이스 + 인메모리 스텁 + server action
  - 경로: src/features/waitlist/storage.ts, src/features/waitlist/actions.ts, src/features/waitlist/schema.ts (+ actions.test.ts)
  - 완료 조건: (1) `WaitlistStorage` 인터페이스(`add(email: string): Promise<void>`, `list(): Promise<string[]>`)와 인메모리 구현이 존재하고, action은 인터페이스에만 의존한다. (2) server action 첫 줄에서 zod로 이메일을 검증하고, 잘못된 이메일은 한국어 에러 메시지를 반환한다. (3) 중복 이메일은 에러 없이 1건으로 처리된다(멱등). vitest로 검증.
  - 참조: architecture 스킬 규칙 2·3, CLAUDE.md 철칙 4 / 테스트: action 단위 테스트 3개 이상 (builder가 ID 부여)

- [x] 9. 대기명단 폼 UI + 결과 화면 연결
  - 경로: src/features/waitlist/ui/waitlist-form.tsx
  - 완료 조건: (1) 이메일 입력 + 제출 버튼이 있고 제출 성공 시 "등록되었습니다" 확인 메시지가 표시된다. (2) 상태: 빈/로딩/에러/성공 4가지. (3) 계산기 결과 화면 하단과 랜딩 하단 양쪽에 배치된다.
  - 참조: PLAN.md 성공 지표 / 테스트: 수동 확인 (제출 → 성공 메시지)

- [x] 10. 랜딩 페이지
  - 경로: src/app/page.tsx
  - 완료 조건: (1) 히어로 섹션: 헤드라인("OA 기한, 더 이상 달력 세지 마세요") + 한 줄 설명 + 계산기로 가는 CTA 버튼 1개. (2) 하단에 대기명단 폼(태스크 9)이 배치된다. (3) 법적 면책 문구가 푸터에 표시된다.
  - 참조: PLAN.md 화면 1, RULES.md §5 / 테스트: 수동 확인

- [x] 11. [보류 — env 키 필요] Supabase 대기명단 실연동
  - 경로: src/lib/db.ts, src/lib/env.ts, src/features/waitlist/storage.ts (구현 교체)
  - 완료 조건: (1) 사용자가 SUPABASE URL/KEY를 제공하면 `WaitlistStorage`의 Supabase 구현으로 교체하고 env는 zod로 검증한다. (2) 인터페이스·action·UI는 무변경. **이번 빌드에서는 착수하지 않는다 — 키 제공 전까지 보류.**
  - 참조: architecture 스킬 (lib/db.ts, env.ts), CLAUDE.md 철칙 4 / 테스트: 키 제공 후 실제 insert 1건 확인

- [x] 12. 배포 전 통합 점검
  - 완료 조건: (1) `pnpm check`(lint + typecheck + test) 통과, T1~T14 전부 그린. (2) BUILD_LOG.md에 공휴일 테이블 전체 목록(태스크 1)과 스택 이탈 결정(shadcn/Supabase 미사용 사유)이 기록되어 있다. (3) reviewer에게 검수 요청 — 특히 음력 공휴일 테이블 사람 눈 대조 (RULES.md §7).
  - 참조: RULES.md §6, §7, CLAUDE.md 철칙 5 / 테스트: T1~T14 전체 + 추가 케이스

## 성공 지표

이메일 — 대기명단 등록 수. 이번 빌드는 "이 계산기를 계속 쓰고 싶은 사람이 이메일을 남기는가"를 검증한다.
