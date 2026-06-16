# 특허 기한 계산기 (한국 특허 전용)

> OA 발송일만 넣으면 초일불산입·월말처리·공휴일 순연을 반영한 제출 기한과 연장 6개월치 기한·누적 수수료·D-day를 한 번에.

## 무엇 / 왜

- **무엇**: 의견제출통지서(OA) 발송일과 기본기간(4개월/2개월/직접입력)을 입력하면, 기본 제출 기한과 연장 시나리오별(+1~+6개월) 기한일·누적 수수료·D-day를 타임라인으로 보여준다.
- **왜**: 변리사 사무소 직원·스타트업 특허 담당자가 매번 달력과 수수료표를 뒤져 수기로 계산하던 일을 무상태 계산기 한 화면으로 끝낸다.
- 기한 계산은 무상태(저장 없음). 대기명단 이메일만 공유 `waitlist` 테이블에 `source='patent-deadline'`로 저장한다.

## 로컬 실행

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## 데이터 / 배포

- 공유 Supabase의 `waitlist`(공유 테이블, `source`로 제품 구분) 사용. env: `SUPABASE_URL` / `SUPABASE_SECRET_KEY`.
- 배포 도메인은 `siteUrl()`이 자동 분기(`SITE_URL`은 커스텀 도메인 쓸 때만).
- 배포: `bash scripts/bootstrap.sh` (GitHub+Vercel 연결, 이후 push마다 자동 배포).

> 범위 밖: 해외 특허, 알림, 로그인, 상표·디자인 기한, 결제. (상세 PLAN.md)
