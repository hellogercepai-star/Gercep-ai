-- Gercep AI: wallet repair — AMAN dijalankan jika 002 sudah pernah jalan
-- Error "relation wallet_links already exists" = SKIP 002, jalankan file INI saja.

-- Pastikan kolom yang dipakai API ada (abaikan jika sudah ada)
alter table public.wallet_links
  add column if not exists chain text not null default 'solana';

alter table public.wallet_links
  add column if not exists verified_at timestamptz not null default now();

alter table public.wallet_links
  add column if not exists created_at timestamptz not null default now();

-- Unique constraints (skip jika sudah ada — lihat NOTICE, bukan ERROR)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'wallet_links_user_id_unique'
  ) then
    alter table public.wallet_links
      add constraint wallet_links_user_id_unique unique (user_id);
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'wallet_links_address_unique'
  ) then
    alter table public.wallet_links
      add constraint wallet_links_address_unique unique (address);
  end if;
exception
  when duplicate_table then null;
  when duplicate_object then null;
end $$;

create index if not exists wallet_links_user_id_idx on public.wallet_links(user_id);

-- Tabel challenge (untuk sign & link)
create table if not exists public.wallet_link_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nonce text not null unique,
  message text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists wallet_link_challenges_user_id_idx
  on public.wallet_link_challenges(user_id);

-- RLS
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
