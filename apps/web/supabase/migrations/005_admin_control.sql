-- Gercep AI: admin control center (audit, billing ops, overrides)
-- Safe to re-run

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null default 'admin',
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);

create table if not exists public.billing_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('topup', 'refund', 'charge', 'invoice', 'adjustment')),
  amount_usd numeric(18,8) not null,
  note text,
  created_by text not null default 'admin',
  created_at timestamptz not null default now()
);

create index if not exists billing_transactions_user_id_idx on public.billing_transactions(user_id);
create index if not exists billing_transactions_created_at_idx on public.billing_transactions(created_at desc);

create table if not exists public.customer_rate_overrides (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_request_limit int,
  requests_per_minute int,
  note text,
  updated_at timestamptz not null default now()
);

insert into public.gateway_settings (key, value, description)
values
  (
    'alert_config',
    '{"profit_negative_alert": true, "latency_ms_threshold": 8000, "slack_webhook_url": "", "email_alerts_enabled": false}',
    'Admin alert thresholds and webhook'
  ),
  (
    'stripe_config',
    '{"enabled": false, "publishable_key": "", "webhook_configured": false}',
    'Stripe integration (configure when ready)'
  )
on conflict (key) do nothing;

-- Service role only for admin tables (no RLS user policies)
