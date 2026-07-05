-- Gercep AI: Solana wallet linking
-- Jalankan di Supabase SQL Editor (JANGAN buat ulang jika sudah ada)

create table if not exists public.wallet_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chain text not null default 'solana',
  address text not null,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint wallet_links_user_id_unique unique (user_id),
  constraint wallet_links_address_unique unique (address)
);

create index if not exists wallet_links_user_id_idx on public.wallet_links(user_id);

create table if not exists public.wallet_link_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nonce text not null unique,
  message text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists wallet_link_challenges_user_id_idx on public.wallet_link_challenges(user_id);

alter table public.wallet_links enable row level security;
alter table public.wallet_link_challenges enable row level security;

drop policy if exists "wallet_links_select_own" on public.wallet_links;
create policy "wallet_links_select_own" on public.wallet_links
  for select using (auth.uid() = user_id);

drop policy if exists "wallet_links_delete_own" on public.wallet_links;
create policy "wallet_links_delete_own" on public.wallet_links
  for delete using (auth.uid() = user_id);

drop policy if exists "wallet_link_challenges_select_own" on public.wallet_link_challenges;
create policy "wallet_link_challenges_select_own" on public.wallet_link_challenges
  for select using (auth.uid() = user_id);

drop policy if exists "wallet_link_challenges_insert_own" on public.wallet_link_challenges;
create policy "wallet_link_challenges_insert_own" on public.wallet_link_challenges
  for insert with check (auth.uid() = user_id);

drop policy if exists "wallet_link_challenges_delete_own" on public.wallet_link_challenges;
create policy "wallet_link_challenges_delete_own" on public.wallet_link_challenges
  for delete using (auth.uid() = user_id);

-- Insert wallet_links via service role only (API verify route)
