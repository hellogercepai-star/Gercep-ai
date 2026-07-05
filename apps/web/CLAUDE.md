@AGENTS.md

# Gercep AI — Project Context & Rules

## Tech Stack
- Next.js 16 App Router (BUKAN Pages Router)
- TypeScript
- Tailwind CSS v4 (tidak pakai tailwind.config.ts, styling arbitrary values di className)
- Supabase (Auth + Postgres + RLS)
- Vercel (deployment)

## Struktur Folder (WAJIB DIPATUHI)
apps/web/app - routes App Router
apps/web/components/ui - Button, Card
apps/web/components/shared - Sidebar, Header
apps/web/components/auth - LogoutButton
apps/web/hooks - useUser sudah pakai Supabase asli, useBusiness dan useDashboardStats masih mock
apps/web/lib/supabase - client.ts, server.ts, middleware.ts
apps/web/types - User, Business, Transaction, Order
apps/web/middleware.ts - protect dashboard routes

## Design System
Dark theme background #070711, aksen teal #2DD4BF purple #A78BFA pink #F472B6
Font Space Grotesk display dan Inter body

## Auth dan Database SUDAH SELESAI JANGAN DIBANGUN ULANG
Supabase Auth aktif di /register dan /login
Middleware protect route dashboard
Tabel users businesses business_members transactions orders sudah ada RLS triggers indexes
public.users terhubung ke auth.users via trigger, jangan insert manual dari frontend

## ATURAN PENTING UNTUK AI AGENT
1. Jangan overwrite file yang sudah ada tanpa konfirmasi eksplisit
2. Jangan bikin ulang struktur folder yang sudah ada
3. Jangan ganti useUser.ts balik ke mock data
4. useBusiness dan useDashboardStats masih mock, memang disengaja
5. Tunjukkan diff dulu sebelum apply perubahan besar
6. Jangan hardcode environment variables ke dalam kode
7. Commit kecil dan sering, satu perubahan logis per commit
