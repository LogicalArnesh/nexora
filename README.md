# Nexora

An all-in-one workspace for AI chat, notes, link management, reusable AI prompt skills, account settings, and administrator usage controls.

## Stack

- Next.js App Router, TypeScript, React, Tailwind CSS
- Supabase Auth and Postgres with Row Level Security
- AI providers: OpenRouter, xAI, OpenAI, and Gemini
- Supabase Auth SMTP for OTP, confirmation, and password-recovery messages
- Node.js SMTP mailer for Nexora administrator usage reports

## Available features

| Area | Status | Details |
| --- | --- | --- |
| AI Chat | Available | Provider-routed chat with Nexora Token metering and request timeouts. |
| Notes | Available | Per-user note creation and management. |
| Links | Available | Short links with public redirect endpoints. |
| Skills | Available | Reusable prompt presets for coding, learning, writing, debugging, and planning. |
| Settings | Available | Edit display name, username, bio; view account role and token balance. |
| Admin Console | Admin only | Per-member token usage, balances, input/output counts, recent events, audited balance adjustments, and SMTP usage-report delivery. |
| Documents, Projects, Resume, Weather, Expenses | Not fully implemented | These remain placeholders or partial integrations and are not represented as complete tools. |

## Nexora Tokens and administrator access

- Newly provisioned member accounts receive 50,000 Nexora Tokens by default.
- Administrator accounts are unlimited when their trusted profile role is `admin`.
- AI requests reserve Nexora Tokens and complete or refund usage through database RPCs.
- The Admin Console reads `admin_get_nexora_dashboard_data()` and uses `admin_set_nexora_token_balance(...)` for audited balance changes.
- Authorization is checked server-side and inside the database RPC. Never grant an admin role from browser input or user-editable metadata.
- The dashboard reports Nexora Token usage and observed input/output token counts. Verified provider dollar-cost accounting is not implemented and is not presented as an actual bill.

## Email setup

Email has two separate delivery paths. Configuring one does not configure the other.

### 1. Supabase Auth email (OTP, signup confirmation, password reset)

These messages are sent by Supabase Auth using the SMTP configuration under Supabase Dashboard → Authentication → SMTP Settings. Keep the Magic Link template configured to include `{{ .Token }}` because Nexora's email-code screen verifies a one-time code.

The repository includes branded templates in `supabase/templates/`: `magic_link.html`, `confirmation.html`, and `recovery.html`. Paste the matching templates into Supabase Dashboard → Authentication → Email Templates.

Set the Site URL and allowed Redirect URLs to include the production Nexora domain and `/auth/callback` and `/reset-password` paths. When Auth accepts an email request but the message is not visible in the inbox, check the SMTP provider's message/activity logs, spam folder, and SPF/DKIM/DMARC setup.

### 2. Nexora administrator usage reports

The Admin Console sends these messages directly through SMTP using Nodemailer. Supabase Auth's SMTP configuration is not automatically exposed to application routes, so copy the same SMTP provider details into Vercel Project → Settings → Environment Variables (Production):

- `NEXORA_SMTP_HOST` — SMTP hostname.
- `NEXORA_SMTP_PORT` — usually `587` (STARTTLS) or `465` (implicit TLS).
- `NEXORA_SMTP_USER` — SMTP username.
- `NEXORA_SMTP_PASSWORD` — SMTP password.
- `NEXORA_SMTP_SECURE` — `true` for port 465; normally `false` for port 587.
- `NEXORA_EMAIL_FROM` — verified sender, for example `Nexora <no-reply@your-verified-domain.com>`.

Keep these values encrypted in Vercel. Do not put SMTP passwords in GitHub or `NEXT_PUBLIC_` variables. Redeploy after adding or changing them. The Admin Console has a **Check SMTP** action that verifies the app's SMTP connection without sending a message. The initial production build caught a missing React state declaration in that control; the follow-up fix adds the state explicitly and is validated by the next Vercel build.

Usage reports include a Nexora Billing & Workspace signature, a no-reply sender/reply-to address, and automatic-message headers. Delivery is only available once the Vercel SMTP variables are configured and accepted by your SMTP provider.

## Local development

```bash
git clone https://github.com/LogicalArnesh/nexora.git
cd nexora
npm install
cp .env.example .env.local
npm run dev
```

Configure Supabase, AI provider, and (when testing admin reports) SMTP environment variables in `.env.local`. Never commit real secrets.

## Build and lint

```bash
npm run lint
npm run build
```

## Vercel deployment

- Connect `LogicalArnesh/nexora` to the Nexora Vercel project with `main` as the production branch.
- Each commit to `main` triggers a production deployment through the Git integration.
- Verify the commit SHA on the latest production deployment before assuming a change is live.
- Add or update environment variables in Vercel, then redeploy so the runtime receives them.

## Supabase production schema note

The connected production database already has Nexora Token and administrator RPC migrations applied (`nexora_tokens_v1`, `admin_token_balance_controls`, `fix_admin_profile_rls`, and `admin_usage_dashboard_summary`). The original repository migration files do not yet contain a complete export of those applied production migrations. Reconcile and export the production migration history before using this repository to create a brand-new Supabase project.

## AI safety and third-party code

Nexora does not install prompt patches intended to disable provider safety protections or force refusal bypasses. GODMOD3 was reviewed for reference; its jailbreak-specific prompt payloads are not included and no code from that project is copied into this repository.

## Copyright

All rights reserved. No open-source license is granted for this repository. Do not copy, modify, or redistribute the code without written permission from the copyright holder.

## Security

Report security issues privately to the repository maintainer. Do not publish API keys, SMTP passwords, Supabase service-role keys, or user data in issues.