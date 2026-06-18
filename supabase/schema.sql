-- PantrySnap — Supabase schema (Phase 8 cloud sync).
-- Run in the Supabase SQL editor. Per-user rows, secured by RLS.

create table if not exists public.items (
  uid                     text primary key,
  user_id                 uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name                    text not null,
  category                text not null default 'other',
  shelf_id                text not null default 'middle',
  quantity_pct            int  not null default 100,
  purchase_date           date,
  expiry_date             date,
  expiry_source           text not null default 'manual',
  condition_notes         text,
  low_stock_threshold_pct int  not null default 20,
  created_at              bigint not null,
  updated_at              bigint not null
);

alter table public.items enable row level security;

-- Each user can only see/modify their own rows.
create policy "items are private to owner"
  on public.items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists items_user_idx on public.items (user_id);
