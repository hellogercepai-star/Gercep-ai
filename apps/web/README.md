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

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side gateway auth & billing |
| `DEEPSEEK_API_KEY` | DeepSeek provider (inference) |
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

## Tests

```bash
npm test
```

Business OS (`/dashboard`) is dogfood only — gateway is the core product.
