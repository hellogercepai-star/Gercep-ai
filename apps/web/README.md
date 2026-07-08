# Gercep AI — Web App

OpenAI-compatible inference gateway for developers. Live: Playground, API keys, usage + USD billing, Phantom wallet, admin control center.

## Quick start

```bash
cd apps/web
cp .env.example .env.local
# Fill Supabase + DEEPSEEK_API_KEY + GATEWAY_ADMIN_SECRET in .env.local
npm install
npm run dev
```

Open [http://localhost:3000/playground](http://localhost:3000/playground) after creating an account and API key at `/developers`.

## Supabase migrations

Run in Supabase SQL Editor **in order**:

| # | File | Purpose |
|---|------|---------|
| 1 | `supabase/migrations/001_gateway_api_keys.sql` | API keys + usage_logs |
| 2 | `supabase/migrations/002_wallet_links.sql` | Phantom wallet links |
| 3 | `supabase/migrations/003_wallet_links_repair.sql` | Wallet repair (if needed) |
| 4 | `supabase/migrations/004_gateway_billing.sql` | Plans, pricing, PAYG billing |
| 5 | `supabase/migrations/005_admin_control.sql` | Audit, transactions, overrides |
| 6 | `supabase/migrations/006_multi_provider.sql` | OpenAI, Gemini, Grok, NVIDIA pricing |

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side gateway auth & billing |
| `DEEPSEEK_API_KEY` | DeepSeek models |
| `OPENAI_API_KEY` | GPT-4o, GPT-4.1, GPT-5 |
| `GOOGLE_API_KEY` | Gemini 2.0 Flash, Gemini 1.5 Pro |
| `XAI_API_KEY` | Grok 2, Grok 3 |
| `NVIDIA_API_KEY` | NVIDIA NIM (Llama, Nemotron) |
| `GATEWAY_ADMIN_SECRET` | Admin login at `/admin` |

See `.env.example` for Stripe, Solana, and dev vars.

## Key routes

| Path | Description |
|------|-------------|
| `/` | Marketing landing |
| `/playground` | Test models |
| `/developers` | API keys + usage + USD billing + wallet |
| `/admin` | Enterprise admin control center |
| `/docs` | API reference |
| `/whitepaper` | Tokenomics & vision |
| `/privacy` `/terms` | Legal |

## Gateway API

```bash
curl $BASE/api/v1/chat/completions \
  -H "Authorization: Bearer sk-gercep-YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'
```

## Billing flow

1. **Beta plan** — free daily quota, balance not deducted
2. **Pay As You Go** — balance deducted per request automatically
3. **Top-up** — admin manual or Stripe checkout (`/developers`)
4. **Blocked requests** — logged to `usage_logs` with `status=blocked`

## Stripe top-up webhook

1. Create a Stripe account and add keys to Vercel:
   - `STRIPE_SECRET_KEY` — Secret key (`sk_live_...` or `sk_test_...`)
   - `STRIPE_WEBHOOK_SECRET` — from the webhook endpoint below
   - `NEXT_PUBLIC_APP_URL` — e.g. `https://gercep-ai-hbom.vercel.app`
2. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**:
   - URL: `https://<your-domain>/api/v1/webhooks/stripe`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
3. User flow: `/developers` → **$5 / $10 / $25** → Stripe Checkout → redirect back → webhook credits `account_balances` and assigns **payg** plan.

Test cards: `4242 4242 4242 4242` (any future expiry, any CVC).

## Tests

```bash
npm test
```

Business OS (`/dashboard`) is dogfood only — gateway is the core product.
