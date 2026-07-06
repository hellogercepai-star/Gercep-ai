-- Gercep AI Gateway: billing, plans, pricing, cost protection
-- Reversible: see 004_gateway_billing_down.sql (run manually to rollback)
-- Safe to re-run partial sections via IF NOT EXISTS / ADD COLUMN IF NOT EXISTS

-- ─── Config (admin-editable, no hardcoded prices in app code) ───
create table if not exists public.gateway_settings (
  key text primary key,
  value jsonb not null default '{}',
  description text,
  updated_at timestamptz not null default now()
);

-- ─── AI providers (enable/disable from admin) ───
create table if not exists public.ai_providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  enabled boolean not null default true,
  base_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.ai_providers(id) on delete cascade,
  model_id text not null unique,
  display_name text not null,
  enabled boolean not null default true,
  max_context_tokens int not null default 128000,
  default_max_output_tokens int not null default 4096,
  capabilities jsonb not null default '["chat"]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists provider_models_provider_id_idx on public.provider_models(provider_id);

-- Customer-facing pricing (USD per 1M tokens)
create table if not exists public.model_pricing (
  id uuid primary key default gen_random_uuid(),
  provider_model_id uuid not null references public.provider_models(id) on delete cascade,
  input_price_per_1m numeric(18,8) not null,
  output_price_per_1m numeric(18,8) not null,
  currency text not null default 'USD',
  effective_from timestamptz not null default now(),
  effective_until timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists model_pricing_model_effective_idx
  on public.model_pricing(provider_model_id, effective_from desc);

-- Provider cost (what Gercep pays — for profit monitoring)
create table if not exists public.provider_model_costs (
  id uuid primary key default gen_random_uuid(),
  provider_model_id uuid not null references public.provider_models(id) on delete cascade,
  input_cost_per_1m numeric(18,8) not null,
  output_cost_per_1m numeric(18,8) not null,
  currency text not null default 'USD',
  effective_from timestamptz not null default now(),
  effective_until timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists provider_model_costs_model_effective_idx
  on public.provider_model_costs(provider_model_id, effective_from desc);

-- ─── Subscription plans ───
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  daily_request_limit int not null default 1000,
  monthly_token_limit bigint,
  requests_per_minute int not null default 60,
  pay_as_you_go boolean not null default false,
  requires_positive_balance boolean not null default false,
  included_credit_usd numeric(18,8) not null default 0,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'active'
    check (status in ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_user_id_unique unique (user_id)
);

create index if not exists subscriptions_plan_id_idx on public.subscriptions(plan_id);

-- Pay-as-you-go wallet balance (USD). Never allow negative — enforced in app layer.
create table if not exists public.account_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance_usd numeric(18,8) not null default 0 check (balance_usd >= 0),
  updated_at timestamptz not null default now()
);

-- ─── Extend usage_logs for cost tracking ───
alter table public.usage_logs add column if not exists request_id uuid;
alter table public.usage_logs add column if not exists status text not null default 'completed';
alter table public.usage_logs add column if not exists latency_ms int;
alter table public.usage_logs add column if not exists estimated_prompt_tokens int;
alter table public.usage_logs add column if not exists estimated_completion_tokens int;
alter table public.usage_logs add column if not exists estimated_provider_cost numeric(18,8);
alter table public.usage_logs add column if not exists customer_charge numeric(18,8);
alter table public.usage_logs add column if not exists profit_estimation numeric(18,8);
alter table public.usage_logs add column if not exists plan_slug text;
alter table public.usage_logs add column if not exists blocked_reason text;

create index if not exists usage_logs_request_id_idx on public.usage_logs(request_id);

-- ─── RLS ───
alter table public.gateway_settings enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.account_balances enable row level security;

drop policy if exists "plans_select_active" on public.plans;
create policy "plans_select_active" on public.plans
  for select using (is_active = true);

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "account_balances_select_own" on public.account_balances;
create policy "account_balances_select_own" on public.account_balances
  for select using (auth.uid() = user_id);

-- Admin tables: service role only (no user policies on ai_providers, pricing, costs, settings)

-- ─── Seed: default config (editable from admin dashboard later) ───
insert into public.gateway_settings (key, value, description)
values
  (
    'cost_protection',
    '{"enabled": true, "max_estimated_cost_per_request_usd": 1.0, "block_on_negative_balance": true}',
    'AI Cost Protection global toggles'
  ),
  (
    'default_plan_slug',
    '"beta"',
    'Plan assigned to new users without subscription'
  )
on conflict (key) do nothing;

insert into public.plans (slug, name, daily_request_limit, monthly_token_limit, requests_per_minute, pay_as_you_go, requires_positive_balance, sort_order)
values
  ('beta', 'Beta', 1000, 5000000, 60, false, false, 10),
  ('pro', 'Pro', 10000, 50000000, 120, false, false, 20),
  ('payg', 'Pay As You Go', 100000, null, 300, true, true, 30)
on conflict (slug) do nothing;

insert into public.ai_providers (slug, name, enabled, base_url)
values ('deepseek', 'DeepSeek', true, 'https://api.deepseek.com/v1')
on conflict (slug) do nothing;

insert into public.provider_models (provider_id, model_id, display_name, enabled, default_max_output_tokens)
select p.id, m.model_id, m.display_name, true, m.default_max_output
from public.ai_providers p
cross join (
  values
    ('deepseek-chat', 'DeepSeek Chat', 4096),
    ('deepseek-reasoner', 'DeepSeek Reasoner', 8192)
) as m(model_id, display_name, default_max_output)
where p.slug = 'deepseek'
on conflict (model_id) do nothing;

-- Seed pricing & provider costs (update via admin — not hardcoded in application code)
insert into public.model_pricing (provider_model_id, input_price_per_1m, output_price_per_1m)
select pm.id, pr.input_price, pr.output_price
from public.provider_models pm
join (
  values
    ('deepseek-chat', 0.14, 0.28),
    ('deepseek-reasoner', 0.55, 2.19)
) as pr(model_id, input_price, output_price) on pm.model_id = pr.model_id
where not exists (
  select 1 from public.model_pricing mp where mp.provider_model_id = pm.id
);

insert into public.provider_model_costs (provider_model_id, input_cost_per_1m, output_cost_per_1m)
select pm.id, c.input_cost, c.output_cost
from public.provider_models pm
join (
  values
    ('deepseek-chat', 0.07, 0.14),
    ('deepseek-reasoner', 0.27, 1.10)
) as c(model_id, input_cost, output_cost) on pm.model_id = c.model_id
where not exists (
  select 1 from public.provider_model_costs pc where pc.provider_model_id = pm.id
);
