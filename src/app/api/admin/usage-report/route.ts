import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNexoraMailer, describeSmtpError } from "@/lib/email/nexora-mailer";
import { buildUsageStatementEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_GRANT = 50_000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { userId?: unknown } | null;
  const targetUserId = String(body?.userId ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetUserId)) {
    return NextResponse.json({ error: "Select a valid member." }, { status: 400 });
  }

  const mailer = createNexoraMailer();
  if (!mailer.ok) {
    return NextResponse.json({ error: mailer.message, missing: mailer.missing }, { status: 503 });
  }

  try {
    const { data, error } = await supabase.rpc("admin_get_nexora_dashboard_data");
    if (error) {
      return NextResponse.json({ error: "Could not load the administrator usage report." }, { status: 403 });
    }

    const report = data as {
      members?: Array<{
        user_id: string;
        email?: string;
        full_name?: string;
        balance?: number;
        is_unlimited?: boolean;
        tokens_used?: number;
        request_count?: number;
        input_tokens?: number;
        output_tokens?: number;
      }>;
    };
    const member = report.members?.find((item) => item.user_id === targetUserId);
    if (!member?.email) {
      return NextResponse.json({ error: "This member does not have a deliverable email address." }, { status: 404 });
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://nexora-two-tawny.vercel.app").replace(/\/$/, "");
    const issuedAt = new Date();
    const nextRefill = new Date(issuedAt.getTime() + WEEK_MS);
    const unlimited = Boolean(member.is_unlimited);
    const balanceRaw = Number(member.balance ?? 0);
    const usedRaw = Number(member.tokens_used ?? Math.max(0, DEFAULT_GRANT - Math.max(0, balanceRaw)));
    const balance = unlimited ? "Unlimited" : Math.max(0, balanceRaw).toLocaleString("en-IN");
    const used = usedRaw.toLocaleString("en-IN");
    const pct = unlimited ? 0 : Math.min(100, Math.round((usedRaw / DEFAULT_GRANT) * 100));
    const requests = Number(member.request_count ?? 0);
    const inputTokens = Number(member.input_tokens ?? 0);
    const outputTokens = Number(member.output_tokens ?? 0);

    const template = buildUsageStatementEmail({
      name: member.full_name,
      email: member.email,
      issuedAt,
      nextRefill,
      balance,
      used,
      pct,
      requests,
      inputTokens,
      outputTokens,
      unlimited,
      appUrl,
      recentLines: [
        `event=usage.statement`,
        `account=${member.email}`,
        `user_id=${member.user_id}`,
        `issued_at=${issuedAt.toISOString()}`,
        `tokens.balance=${balance}`,
        `tokens.used=${used}`,
        `tokens.usage_pct=${pct}`,
        `tokens.grant=${DEFAULT_GRANT}`,
        `tokens.unlimited=${unlimited}`,
        `ai.requests=${requests}`,
        `ai.input_tokens=${inputTokens}`,
        `ai.output_tokens=${outputTokens}`,
        `plan.refill_days=7`,
        `plan.next_refill=${nextRefill.toISOString()}`,
        `app=${appUrl}`,
      ],
    });

    const result = await mailer.transporter.sendMail({
      from: mailer.from,
      replyTo: mailer.from,
      to: member.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      headers: {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Usage statement accepted by the mail server.",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Nexora usage email failed", error);
    return NextResponse.json({ error: describeSmtpError(error) }, { status: 502 });
  } finally {
    mailer.transporter.close();
  }
}
