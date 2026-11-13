# NEXORA

**Everything You Need. One Intelligent Workspace.**

Premium all-in-one SaaS workspace that unifies URL shortener, weather, AI PDF assistant, project management, AI chat, notes, expense tracker, resume builder and more under a single modern dashboard.

---

## Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Frontend         | Next.js 16 (App Router), React 19, TypeScript |
| Styling          | Tailwind CSS 4, custom design tokens |
| UI primitives    | shadcn/ui + Lucide icons (to be added) |
| Auth & Database  | Supabase (Auth + PostgreSQL + Storage + RLS) |
| AI               | OpenAI API (server-side only)       |
| Weather          | OpenWeatherMap                      |
| Charts / DnD / PDF | To be added per tool               |

---

## Getting Started

### 1. Prerequisites

- Node.js 20+
- A Supabase project
- OpenAI API key (for AI tools)
- OpenWeatherMap API key (for Weather)

### 2. Install

```bash
cd nexora
npm install
```

### 3. Environment

```bash
cp .env.example .env.local
```

Fill in the values from your Supabase project, OpenAI, and OpenWeatherMap dashboards.

### 4. Database

1. Open the Supabase SQL Editor.
2. Run the migration: `supabase/migrations/001_initial_schema.sql`
3. (Optional) Enable Storage buckets for document uploads and avatars with private policies.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, register, password flows
│   ├── (dashboard)/     # Authenticated app shell + tools
│   ├── (admin)/         # Admin-only routes
│   ├── api/             # Route handlers (AI, weather, etc.)
│   ├── globals.css      # Design system
│   ├── layout.tsx
│   └── page.tsx         # Landing
├── components/
│   ├── ui/              # Reusable primitives
│   ├── layout/          # Sidebar, header, shell
│   ├── dashboard/       # Cards, stats, command
│   ├── tools/           # Per-tool UI modules
│   └── auth/
├── lib/
│   └── supabase/        # Browser + server clients
├── hooks/
├── types/
└── styles/
supabase/
└── migrations/
```

---

## Design System

- **Dark-first** charcoal (`#0c0b12`) + electric violet (`#7c3aed` / `#8b5cf6`) + subtle blue accents.
- CSS variables in `globals.css` for light & dark themes.
- Utility classes: `.bg-nexora-gradient`, `.glass`, `.card-hover`, `.text-gradient`.
- Prefer clean cards, consistent radius, generous spacing, minimal glass.

---

## Development Phases

| Phase | Focus                                      | Status      |
|-------|--------------------------------------------|-------------|
| 1     | Foundation, branding, design system, auth  | In progress |
| 2     | Dashboard, sidebar, marketplace            | Pending     |
| 3     | URL Shortener, Weather, Notes              | Pending     |
| 4     | Project Management, Expense Tracker        | Pending     |
| 5     | AI Chatbot, AI PDF Assistant               | Pending     |
| 6     | Resume Builder                             | Pending     |
| 7     | Admin dashboard & analytics                | Pending     |
| 8     | Security review, polish, performance       | Pending     |

---

## Security Notes

- All secret keys live in server environment variables only.
- Row Level Security (RLS) is enabled on every user-owned table.
- File uploads must go through authenticated Storage policies.
- Admin routes require server-side role checks (`profiles.role = 'admin'`).
- Never expose service-role key or OpenAI key to the client.

---

## License

MIT License — see [LICENSE](./LICENSE).
