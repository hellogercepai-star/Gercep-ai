-- Rollback 004_gateway_billing.sql (run manually when needed)
-- WARNING: drops billing data. usage_logs cost columns are dropped.

alter table public.usage_logs drop column if exists blocked_reason;
alter table public.usage_logs drop column if exists plan_slug;
alter table public.usage_logs drop column if exists profit_estimation;
alter table public.usage_logs drop column if exists customer_charge;
alter table public.usage_logs drop column if exists estimated_provider_cost;
alter table public.usage_logs drop column if exists estimated_completion_tokens;
alter table public.usage_logs drop column if exists estimated_prompt_tokens;
alter table public.usage_logs drop column if exists latency_ms;
alter table public.usage_logs drop column if exists status;
alter table public.usage_logs drop column if exists request_id;

drop table if exists public.account_balances;
drop table if exists public.subscriptions;
drop table if exists public.plans;
drop table if exists public.provider_model_costs;
drop table if exists public.model_pricing;
drop table if exists public.provider_models;
drop table if exists public.ai_providers;
drop table if exists public.gateway_settings;
