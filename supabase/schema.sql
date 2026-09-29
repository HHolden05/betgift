create table if not exists public.gifts (
  id bigint generated always as identity primary key,
  code text not null unique,
  recipient_name text not null,
  recipient_phone text,
  amount numeric(10,2) not null check (amount > 0 and amount <= 1000),
  message text not null default '',
  event_data jsonb not null,
  bet_data jsonb not null,
  status text not null default 'created'
    check (status in ('created', 'opened', 'claimed')),
  created_at timestamptz not null default now(),
  opened_at timestamptz,
  claimed_at timestamptz
);

create index if not exists gifts_code_idx on public.gifts (code);
create index if not exists gifts_status_idx on public.gifts (status);

alter table public.gifts enable row level security;

-- Server-only access via SUPABASE_SERVICE_ROLE_KEY.
-- No public/browser RLS policies are intentionally created in Alpha.
