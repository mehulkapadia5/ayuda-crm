Ayuda CRM – Project Scaffold

What’s included
- Supabase schema migrations in `supabase/migrations/0001_init.sql`
- API routes:
  - `app/api/leads/route.ts` (GET, POST)
  - `app/api/gallabox/send-message/route.ts` (POST)
  - `app/api/gallabox/campaign/route.ts` (POST)
  - `app/api/webhooks/gallabox/route.ts` (POST)
- Pages:
  - `app/leads` – Leads table with filters + Add Lead dialog
  - `app/leads/[id]` – Lead detail, activities, WhatsApp send
  - `app/campaigns` – Campaign list + create
  - `app/analytics` – Basic metrics placeholders
  - `app/settings` – Env hints
- Supabase helper in `lib/supabase/server.ts`
- `.env.example` with required variables

Setup
1) Copy `.env.example` to `.env.local` and fill in:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - GALLABOX_API_KEY (and override GALLABOX_BASE_URL if needed)

2) Install packages:
   npm i @supabase/supabase-js zod

3) Apply SQL in Supabase:
   - Use Supabase SQL Editor or CLI to run `supabase/migrations/0001_init.sql`

4) Run the app:
   npm run dev
   Visit /dashboard, /leads, /campaigns, /analytics

Notes
- API endpoints use the service role key server-side only.
- Webhook path: POST /api/webhooks/gallabox – logs inbound/outbound WA events to activities.
- Gallabox routes are minimal placeholders; adjust URLs/payload per Gallabox docs.

