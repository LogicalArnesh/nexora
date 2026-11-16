# Nexora

All-in-one workspace: AI chat, documents, notes, projects, short links, weather, expenses, and resumes — one account, one dashboard.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase Auth + Postgres (Row Level Security)
- Optional AI: xAI Grok, OpenAI, Google Gemini
- Optional Weather: OpenWeatherMap

## Tools

| Tool | What it does |
|------|----------------|
| **AI Chat** | Multi-provider chat; closing a chat deletes the conversation from the database |
| **Documents** | Paste text → ask, summarize, edit, notes, or quiz |
| **Notes** | Create, edit, pin, delete (per-user) |
| **Projects** | Projects + Kanban columns (todo / in progress / done) |
| **Link Shortener** | Short codes + optional aliases; public `/s/[code]` redirects and counts clicks |
| **Weather** | City search, current + hourly (needs `OPENWEATHER_API_KEY`) |
| **Expenses** | Income/expense ledger with balance |
| **Resume** | Form + live preview, multiple saved resumes |
| **Settings** | Profile display name |
| **Admin** | User stats when `profiles.role = admin` |

## Local setup

```bash
git clone https://github.com/LogicalArnesh/nexora.git
cd nexora
npm install
cp .env.example .env.local
```

Fill `.env.local` (see `.env.example`). Run SQL migrations in Supabase, then:

```bash
npm run dev
```

Windows: use `npx next dev --webpack` if Turbopack fails.

## Short links

- Users create links under **Links**.
- Public visitors hit `/s/yourcode` → 302 to the original URL.
- Redirects use the **service role** key so they work without login.
- Clicks update `url_analytics` and `click_count` best-effort.

**Required:** `SUPABASE_SERVICE_ROLE_KEY` on Vercel for public redirects to work.

## Deploy (Vercel)

1. Import this repo and set env vars.
2. Supabase Auth Site URL + Redirect URLs = your Vercel domain.
3. Redeploy after env changes.

## License

MIT
