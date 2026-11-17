# Nexora

An all-in-one workspace for AI chat, notes, link management, reusable AI prompt skills, account settings, and administrator usage controls.

## Stack

- Next.js App Router, TypeScript, React, Tailwind CSS
- Supabase Auth and Postgres with Row Level Security
- AI providers: OpenRouter, xAI, OpenAI, and Gemini
- Optional transactional email: Resend

## Available features

| Area | Status | Details |
| --- | --- | --- |
| AI Chat | Available | Provider-routed chat with Nexora Token metering and request timeouts. |
| Notes | Available | Per-user note creation and management. |
| Links | Available | Short links with public redirect endpoints. |
| Skills | Available | Reusable prompt presets for coding, learning, writing, debugging, and planning. |
| Settings | Available | Edit display name, username, bio; view account role and token balance. |
| Admin Console | Admin only | Per-member token usage, balances, input/output counts, recent events, audited balance adjustments, and usage-report email actions. |
| Documents, Projects, Resume, Weather, Expenses | Not fully implemented | These remain placeholders or partial integrations and are not represented as complete tools. |

## Nexora Tokens and administrator access

- Newly provisioned member accounts receive 50,000 Nexora Tokens by default.
- Administrator accounts are unlimited when their trusted profile role is `admin`.
- AI requests reserve Nexora Tokens and complete or refund usage through database RPCs.
- The Admin Console reads `admin_get_nexora_dashboard_data()` and uses `admin_set_nexora_token_balance(...)` for audited balance changes.
- Authorization is checked server-side and inside the database RPC. Never grant an admin role from browser input or user-editable metadata.
- The dashboard reports Nexora Token usage and observed input/output token counts. Verified provider dollar-cost accounting is not implemented and is not presented as an actual bill.

## Email setup

### Authentication email templates

The repository includes branded Supabase Auth templates in `supabase/templates/`: `magic_link.html`, `confirmation.html`, and `recovery.html`. In the hosted Supabase Dashboard:
1. Open Authentication → Email Templates.
2. Paste the matching HTML into Magic Link, Confirm signup, and Reset Password templates.
3. The Magic Link template uses `{{ .Token }}` for the one-time code expected by the email-code sign-in screen.
4. Configure custom SMTP under Authentication → SMTP Settings using a domain you control and have verified.
5. Keep redirect URLs aligned with `NEXT_PUBLIC_APP_URL` and the deployed Nexora domain.

### Administrator usage reports

Usage reports are sent to one selected member through Resend. Configure these Vercel Production environment variables and redeploy:
- `RESEND_API_KEY` — Resend API key.
- `NEXORA_EMAIL_FROM` — verified sender, for example `Nexora <no-reply@your-verified-domain.com>`.
Messages include a Nexora signature, automatic-notification headers, and state that replies are not monitored. Delivery remains disabled until these provider settings are configured.

## Local development

```bash
git clone https://github.com/LogicalArnesh/nexora.git
cd nexora
npm install
cp .env.example .env.local
npm run dev
```

Configure Supabase and AI provider environment variables in `.env.local`. Never commit real secrets.

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

Nexora does not install prompt patches intended to disable provider safety protections or force refusal bypasses. GODMOD3 was reviewed for reference; its jailbreak-specific prompt payloads are not included. Its README identifies an AGPL-3.0 license, which differs from Nexora's MIT license, so code is not copied into this repository.

## License

MIT. See [LICENSE](LICENSE).

## Security

Report security issues privately to the repository maintainer. Do not publish API keys, Supabase service-role keys, or user data in issues.