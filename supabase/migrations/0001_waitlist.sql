-- 이 waitlist는 여러 제품 공유 테이블, source로 구분.
-- career-vault, patent-deadline 등 모든 제품이 동일한 테이블을 사용하며
-- source 컬럼(예: "patent-deadline")으로 제품별 행을 식별한다.

create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null,
  source text not null,                       -- 어느 제품에서 등록했는지 (domain type)
  created_at timestamptz not null default now(),
  unique (email, source)
);
create index if not exists waitlist_source_idx on public.waitlist (source);
alter table public.waitlist enable row level security;
-- 읽기/쓰기는 서버(secret key)에서만. anon 직접 접근 차단(정책 미부여).
