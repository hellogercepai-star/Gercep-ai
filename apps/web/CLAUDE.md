@AGENTS.md

# Gercep AI — Project Context & Rules

## Visi Produk (GATEWAY-FIRST — pivot 2026)
**Gercep AI = OpenAI-compatible inference gateway untuk developer (ala Jatevo).**

- Produk utama: `/api/v1/chat/completions`, multi-model routing, API key user (`sk-gercep-...`), usage/token billing
- Developer pegang API key sendiri, set base URL ke gateway Gercep, pakai SDK OpenAI seperti biasa
- Provider keys (DeepSeek, dll.) di server — user tidak pegang provider key
- Roadmap: Playground → API Keys → Usage billing → $GERCEP token + airdrop (Phase lanjutan)
- Business OS (Dashboard, Inventory, Keuangan) = **dogfood / showcase** — bukan produk core revenue

## Tech Stack
- Next.js 16 App Router (BUKAN Pages Router)
- TypeScript
- Tailwind CSS v4 (tidak pakai tailwind.config.ts, styling arbitrary values di className)
- Supabase (Auth + Postgres + RLS)
- Vercel (deployment)

## Struktur Folder
apps/web/app - routes App Router
apps/web/app/api/v1 - Gateway API (chat/completions, models, keys)
apps/web/app/playground - Live model testing UI
apps/web/app/developers - API key management UI
apps/web/components/ui - Button, Card
apps/web/components/shared - Sidebar, Header
apps/web/lib/ai-providers - Provider implementations (DeepSeek, dll.)
apps/web/lib/gateway - API key auth, usage logging, model registry
apps/web/lib/supabase - client.ts, server.ts, admin.ts (service role, server-only)
apps/web/types - shared types including gateway.ts

## Design System
Dark theme background #070711, aksen teal #2DD4BF purple #A78BFA pink #F472B6
Font Space Grotesk display dan Inter body

## Gateway Rules
1. Semua request ke `/api/v1/chat/completions` WAJIB punya `Authorization: Bearer sk-gercep-...` (kecuali dev bypass via env jika diset)
2. Setiap completion WAJIB log usage ke `usage_logs` (prompt_tokens, completion_tokens, total_tokens)
3. Tambah provider = file baru di `lib/ai-providers/` + entry di model registry — jangan ubah endpoint
4. API key disimpan sebagai hash di DB, plain key hanya ditampilkan sekali saat create
5. Jangan hardcode provider API keys — pakai environment variables

## Auth & Database
- Supabase Auth untuk dashboard / developers UI
- Tabel gateway: `api_keys`, `usage_logs` (lihat supabase/migrations/)
- Tabel bisnis (users, businesses, dll.) tetap ada untuk dogfood Business OS
- `SUPABASE_SERVICE_ROLE_KEY` hanya untuk server-side gateway validation & usage insert

## ATURAN PENTING UNTUK AI AGENT
1. Jangan overwrite file yang sudah ada tanpa konfirmasi eksplisit
2. Prioritas fitur: Gateway > Playground > API Keys > Usage > Business OS modules
3. Tunjukkan diff dulu sebelum apply perubahan besar
4. Jangan hardcode environment variables ke dalam kode
5. Commit kecil dan sering, satu perubahan logis per commit
