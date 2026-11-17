import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNexoraMailer, describeSmtpError } from "@/lib/email/nexora-mailer";
import { buildUsageStatementEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_GRANT = 50_000;

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const mailer = createNexoraMailer();
  if (!mailer.ok) {
    return NextResponse.json({ error: mailer.message, missing: mailer.missing }, { status: 503 });
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, plan")
      .eq("id", user.id)
      .maybeSingle();

    let balanceRaw = DEFAULT_GRANT;
    let unlimited = profile?.role === "admin";
    let usedRaw = 0;
    let requests = 0;
    let inputTokens = 0;
    let outputTokens = 0;

    const wallet = await supabase
      .from("nexora_wallets")
      .select("balance, spent, is_unlimited")
      .eq("user_id", user.id)
      .maybeSingle();
    if (wallet.data) {
      balanceRaw = Number(wallet.data.balance ?? balanceRaw);
      usedRaw = Number(wallet.data.spent ?? 0);
      unlimited = unlimited || Boolean(wallet.data.is_unlimited);
    }

    const events = await supabase
      .from("nexora_usage_events")
      .select("input_tokens, output_tokens, credits")
      .eq("user_id", user.id)
      .limit(200);
    if (events.data?.length) {
      requests = events.data.length;
      inputTokens = events.data.reduce((s, r) => s + Number(r.input_tokens || 0), 0);
      outputTokens = events.data.reduce((s, r) => s + Number(r.output_tokens || 0), 0);
      if (!usedRaw) usedRaw = events.data.reduce((s, r) => s + Number(r.credits || 0), 0);
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://nexora-two-tawny.vercel.app").replace(/\/$/, "");
    const issuedAt = new Date();
    const nextRefill = new Date(issuedAt.getTime() + WEEK_MS);
    const balance = unlimited ? "Unlimited" : Math.max(0, balanceRaw).toLocaleString("en-IN");
    const used = Math.max(0, usedRaw).toLocaleString("en-IN");
    const pct = unlimited ? 0 : Math.min(100, Math.round((Math.max(0, usedRaw) / DEFAULT_GRANT) * 100));

    const template = buildUsageStatementEmail({
      name: profile?.full_name || undefined,
      email: user.email,
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
        `event=usage.statement.self`,
        `account=${user.email}`,
        `user_id=${user.id}`,
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
      ],
    });

    const result = await mailer.transporter.sendMail({
      from: mailer.from,
      to: user.email,
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
      message: "Usage statement sent to your email.",
      messageId: result.messageId,
    });
  } catch (error) {
    return NextResponse.json({ error: describeSmtpError(error) }, { status: 502 });
  } finally {
    mailer.transporter.close();
  }
}
