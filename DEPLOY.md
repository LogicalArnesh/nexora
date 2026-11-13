# Deploy NEXORA to Vercel

NEXORA is a **Next.js web app**. Deploy it to Vercel so anyone can open the URL and use it in the browser.

## 1. Prerequisites

1. [Supabase](https://supabase.com) project (free tier works)
2. [Vercel](https://vercel.com) account
3. (Optional) [OpenAI](https://platform.openai.com) API key for AI tools
4. (Optional) [OpenWeatherMap](https://openweathermap.org/api) key for Weather

## 2. Prepare Supabase

1. Create a project in Supabase.
2. Open **SQL Editor** and run, in order:
   - `supabase/migrations/001_core_tables.sql`
   - `supabase/migrations/002_rls_and_seed.sql`
3. **Authentication → URL Configuration**
   - Site URL: `https://YOUR-PROJECT.vercel.app`
   - Redirect URLs:
     `https://YOUR-PROJECT.vercel.app/**`
     `http://localhost:3000/**`
4. (Recommended while testing) Disable **Confirm email** so signup works immediately.

## 3. Deploy on Vercel

1. Import the GitHub repo `LogicalArnesh/nexora` in Vercel.
2. Framework: Next.js (auto).
3. Environment variables:

| Name | Required |
|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server) |
| `NEXT_PUBLIC_APP_URL` | Yes (your Vercel URL) |
| `OPENAI_API_KEY` | Optional (AI tools) |
| `OPENAI_MODEL` | Optional |
| `OPENWEATHER_API_KEY` | Optional (Weather) |

4. Deploy.

## 4. After deploy

Update Supabase Site URL + Redirect URLs to the real Vercel domain.

Live tools today: **Auth**, **Dashboard**, **URL Shortener**, **Notes**.
