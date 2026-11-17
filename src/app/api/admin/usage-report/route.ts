import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNexoraMailer, describeSmtpError } from "@/lib/email/nexora-mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_GRANT = 50_000;

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] ?? character),
  );
}

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
    const name = escapeHtml(member.full_name || "there");
    const usedNum = Number(member.tokens_used ?? 0);
    const balanceNum = Number(member.balance ?? 0);
    const grantBase = Math.max(DEFAULT_GRANT, usedNum + balanceNum, 1);
    const pct = member.is_unlimited
      ? 0
      : Math.min(100, Math.round((usedNum / grantBase) * 100));
    const balance = member.is_unlimited ? "Unlimited" : balanceNum.toLocaleString("en-IN");
    const used = usedNum.toLocaleString("en-IN");
    const requests = Number(member.request_count ?? 0).toLocaleString("en-IN");
    const inputTokens = Number(member.input_tokens ?? 0).toLocaleString("en-IN");
    const outputTokens = Number(member.output_tokens ?? 0).toLocaleString("en-IN");
    const issued = escapeHtml(issuedAt.toUTCString());
    const refill = escapeHtml(nextRefill.toUTCString());
    const barColor = pct >= 90 ? "#f43f5e" : pct >= 70 ? "#f59e0b" : "#8b5cf6";

    const html = [
      '<div style="margin:0;background:#09090f;padding:36px 14px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f4f4f5">',
      '<div style="max-width:560px;margin:0 auto;border:1px solid #292638;border-radius:18px;overflow:hidden;background:#111019">',
      '<div style="padding:24px 28px;background:linear-gradient(120deg,#20143d,#141c38);border-bottom:1px solid #302a45">',
      '<div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#b9a7ff;font-weight:700">NEXORA · TWOTANY</div>',
      '<h1 style="margin:12px 0 0;font-size:24px;color:#fff">Usage statement</h1>',
      '<p style="margin:8px 0 0;color:#c4b5fd;font-size:13px">Issued ' + issued + "</p></div>",
      '<div style="padding:28px"><p style="margin:0 0 18px;color:#d4d4d8;line-height:1.65">Hello ' +
        name +
        ",</p>",
      '<p style="margin:0 0 18px;color:#d4d4d8;line-height:1.65">Here is your Nexora Token usage summary. This is an application meter, not a bank charge.</p>',
      '<div style="margin:0 0 22px;padding:16px;border-radius:12px;border:1px solid #302d3a;background:#16141f">',
      '<div style="display:flex;justify-content:space-between;font-size:12px;color:#a1a1aa;margin-bottom:8px"><span>Estimated usage</span><span style="color:#fff;font-weight:700">' +
        String(pct) +
        "%</span></div>",
      '<div style="height:10px;border-radius:999px;background:#2a2640;overflow:hidden"><div style="height:10px;width:' +
        String(pct) +
        "%;background:" +
        barColor +
        ';border-radius:999px"></div></div>',
      '<p style="margin:12px 0 0;font-size:12px;color:#a1a1aa;line-height:1.5">Standard accounts start with 50,000 Nexora Tokens. Planned refill cadence: every 7 days. Next estimated refill window: <strong style="color:#e4e4e7">' +
        refill +
        "</strong>.</p></div>",
      '<table role="presentation" style="width:100%;border-collapse:collapse">',
      '<tr><td style="padding:13px 0;border-bottom:1px solid #302d3a;color:#a1a1aa">Nexora Tokens used</td><td style="padding:13px 0;border-bottom:1px solid #302d3a;text-align:right;font-weight:700;color:#fff">' +
        used +
        "</td></tr>",
      '<tr><td style="padding:13px 0;border-bottom:1px solid #302d3a;color:#a1a1aa">Available balance</td><td style="padding:13px 0;border-bottom:1px solid #302d3a;text-align:right;font-weight:700;color:#fff">' +
        balance +
        "</td></tr>",
      '<tr><td style="padding:13px 0;border-bottom:1px solid #302d3a;color:#a1a1aa">Completed AI requests</td><td style="padding:13px 0;border-bottom:1px solid #302d3a;text-align:right;font-weight:700;color:#fff">' +
        requests +
        "</td></tr>",
      '<tr><td style="padding:13px 0;border-bottom:1px solid #302d3a;color:#a1a1aa">Input / output tokens</td><td style="padding:13px 0;border-bottom:1px solid #302d3a;text-align:right;font-weight:700;color:#fff">' +
        inputTokens +
        " / " +
        outputTokens +
        "</td></tr>",
      "</table>",
      '<p style="margin:22px 0 0"><a href="' +
        escapeHtml(appUrl) +
        '/subscription" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#7c5cfc;color:#fff;text-decoration:none;font-weight:700">Open plan &amp; usage</a></p>',
      '<div style="margin-top:26px;padding-top:18px;border-top:1px solid #302d3a;color:#d4d4d8;font-size:13px;line-height:1.7">Regards,<br><strong style="color:#fff">Nexora Billing &amp; Workspace</strong><br>Automated account notification</div></div>',
      '<div style="padding:14px 28px;background:#0b0a10;color:#71717a;font-size:11px;line-height:1.6">This is an automatically generated email. Replies to this address are not monitored. Account: ' +
        escapeHtml(member.email) +
        "</div>",
      "</div></div>",
    ].join("");

    const textBody = [
      "NEXORA · TWOTANY",
      "Usage statement for " + (member.full_name || "Nexora member"),
      "Issued: " + issuedAt.toUTCString(),
      "Nexora Tokens used: " + used,
      "Available balance: " + balance,
      "Estimated usage: " + String(pct) + "%",
      "Completed AI requests: " + requests,
      "Input tokens: " + inputTokens,
      "Output tokens: " + outputTokens,
      "Standard grant: 50,000 Nexora Tokens",
      "Planned refill cadence: every 7 days",
      "Next estimated refill window: " + nextRefill.toUTCString(),
      "Open usage: " + appUrl + "/subscription",
      "",
      "Regards,",
      "Nexora Billing & Workspace",
      "Automated account notification.",
    ].join("\n");

    const result = await mailer.transporter.sendMail({
      from: mailer.from,
      replyTo: mailer.from,
      to: member.email,
      subject: "Your Nexora usage statement",
      html,
      text: textBody,
      headers: {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Usage report accepted by the SMTP server.",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Nexora usage email failed", {
      code:
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: unknown }).code ?? "")
          : "UNKNOWN",
    });
    return NextResponse.json({ error: describeSmtpError(error) }, { status: 502 });
  } finally {
    mailer.transporter.close();
  }
}
