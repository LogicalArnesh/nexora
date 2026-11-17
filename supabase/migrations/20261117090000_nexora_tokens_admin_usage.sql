-- Nexora Tokens: 50,000 default allocation, per-request metering, admin usage reporting.
-- This migration is idempotent so it can also be run against an environment where
-- the original token objects were provisioned manually.

create table if not exists public.nexora_token_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance bigint not null default 50000 check (balance >= 0),
  is_unlimited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nexora_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  operation text not null,
  provider text,
  model text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  credits_charged bigint not null default 0,
  estimated_cost_usd numeric not null default 0,
  status text not null default 'reserved'
    check (status in ('reserved', 'completed', 'refunded', 'failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.nexora_token_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  usage_id uuid,
  entry_type text not null check (entry_type in ('grant', 'usage', 'refund', 'adjustment')),
  amount bigint not null¶»§q«^