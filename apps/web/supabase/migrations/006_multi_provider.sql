-- Multi-provider routing: OpenAI, Gemini, Grok, NVIDIA NIM
-- Safe to re-run via ON CONFLICT

insert into public.ai_providers (slug, name, enabled, base_url)
values
  ('openai', 'OpenAI', true, 'https://api.openai.com/v1'),
  ('gemini', 'Google Gemini', true, 'https://generativelanguage.googleapis.com/v1beta/openai'),
  ('grok', 'xAI Grok', true, 'https://api.x.ai/v1'),
  ('nvidia', 'NVIDIA NIM', true, 'https://integrate.api.nvidia.com/v1')
on conflict (slug) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  enabled = excluded.enabled,
  updated_at = now();

insert into public.provider_models (provider_id, model_id, display_name, enabled, default_max_output_tokens)
select p.id, m.model_id, m.display_name, true, m.default_max_output
from public.ai_providers p
join (
  values
    ('openai', 'gpt-4o', 'GPT-4o', 4096),
    ('openai', 'gpt-4.1', 'GPT-4.1', 4096),
    ('openai', 'gpt-5', 'GPT-5', 8192),
    ('gemini', 'gemini-2.0-flash', 'Gemini 2.0 Flash', 8192),
    ('gemini', 'gemini-1.5-pro', 'Gemini 1.5 Pro', 8192),
    ('grok', 'grok-2', 'Grok 2', 4096),
    ('grok', 'grok-3', 'Grok 3', 8192),
    ('nvidia', 'meta/llama-3.3-70b-instruct', 'Llama 3.3 70B (NIM)', 4096),
    ('nvidia', 'nvidia/nemotron-mini-4b-instruct', 'Nemotron Mini 4B (NIM)', 4096)
) as m(provider_slug, model_id, display_name, default_max_output)
  on p.slug = m.provider_slug
on conflict (model_id) do update set
  display_name = excluded.display_name,
  default_max_output_tokens = excluded.default_max_output_tokens,
  enabled = excluded.enabled,
  updated_at = now();

insert into public.model_pricing (provider_model_id, input_price_per_1m, output_price_per_1m)
select pm.id, pr.input_price, pr.output_price
from public.provider_models pm
join (
  values
    ('gpt-4o', 2.50, 10.00),
    ('gpt-4.1', 2.00, 8.00),
    ('gpt-5', 5.00, 15.00),
    ('gemini-2.0-flash', 0.10, 0.40),
    ('gemini-1.5-pro', 1.25, 5.00),
    ('grok-2', 2.00, 10.00),
    ('grok-3', 3.00, 15.00),
    ('meta/llama-3.3-70b-instruct', 0.35, 0.35),
    ('nvidia/nemotron-mini-4b-instruct', 0.10, 0.10)
) as pr(model_id, input_price, output_price) on pm.model_id = pr.model_id
where not exists (
  select 1 from public.model_pricing mp where mp.provider_model_id = pm.id
);

insert into public.provider_model_costs (provider_model_id, input_cost_per_1m, output_cost_per_1m)
select pm.id, c.input_cost, c.output_cost
from public.provider_models pm
join (
  values
    ('gpt-4o', 1.25, 5.00),
    ('gpt-4.1', 1.00, 4.00),
    ('gpt-5', 2.50, 7.50),
    ('gemini-2.0-flash', 0.05, 0.20),
    ('gemini-1.5-pro', 0.63, 2.50),
    ('grok-2', 1.00, 5.00),
    ('grok-3', 1.50, 7.50),
    ('meta/llama-3.3-70b-instruct', 0.18, 0.18),
    ('nvidia/nemotron-mini-4b-instruct', 0.05, 0.05)
) as c(model_id, input_cost, output_cost) on pm.model_id = c.model_id
where not exists (
  select 1 from public.provider_model_costs pc where pc.provider_model_id = pm.id
);
