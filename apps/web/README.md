# Gercep AI — Web App

OpenAI-compatible inference gateway for developers. Live routes: Playground, API keys, usage dashboard, Phantom wallet link.

## Quick start

```bash
cd apps/web
cp .env.example .env.local
# Fill Supabase + DEEPSEEK_API_KEY in .env.local
npm install
npm run dev
```

Open [http://localhost:3000/playground](http://localhost:3000/playground) after creating an account and API key at `/developers`.

## Supabase migrations

Run in Supabase SQL Editor (in order):

1. `supabase/migrations/001_gateway_api_keys.sql`
2. `supabase/migrations/002_wallet_links.sql`

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side gateway auth & usage insert |
| `DEEPSEEK_API_KEY` | DeepSeek provider (inference) |

See `.env.example` for optional Solana / dev vars.

## Key routes

| Path | Description |
|------|-------------|
| `/` | Marketing landing |
| `/playground` | Test models |
| `/developers` | API keys + usage + wallet |
| `/docs` | API reference |
| `/whitepaper` | Tokenomics & vision |
| `/privacy` `/terms` | Legal stubs |

## Gateway API

```bash
curl $BASE/api/v1/chat/completions \
  -H "Authorization: Bearer sk-gercep-YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'
```

Business OS (`/dashboard`) is dogfood only — gateway is the core product.
