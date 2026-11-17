import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNexoraMailer, describeSmtpError } from "@/lib/email/nexora-mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Administrator access required." }, { status: 403 });

  const body = await request.json().catch(() => null) as { userId?: unknown } | null;
  const targetUserId = String(body?.userId ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetUserId)) {
    return NextResponse.json({ error: "Select a valid member." }, { status: 400 });
  }

  const mailer = createNexoraMailer();
  if (!mailer.ok) {
    return NextResponse.json({
      error: mailer.message,
      missing: mailer.missing,
    }, { status: 503 });
  }

  try {
    const { data, error } = await supabase.rpc("admin_get_nexora_dashboard_data");
    if (error) return NextResponse.json({ error: "Could not load the administrator usage report." }, { status: 403 });

    const report = data as {
      members?: Array<{
        user_id: string; email?: string; full_name?: string; balance?: number;
        is_unlimited?: boolean; tokens_used?: number; request_count?: number;
        input_tokens?: number; output_tokens?: number;
      }>;
    };
    const member = report.members?.find((item) => item.user_id === targetUserId);
    if (!member?.email) return NextResponse.json({ error: "This member does not have a deliverable email address." }, { status: 404 });

    const name = escapeHtml(member.full_name || "Nexora member");
    const balance = member.is_unlimited ? "Unlimited" : Number(member.balance ?? 0).toLocaleString("en-IN");
    const used = Number(member.tokens_used ?? 0).toLocaleString("en-IN");
    const requests = Number(member.request_count ?? 0).toLocaleString("en-IN");
    const inputTokens = Number(member.input_tokens ?? 0).toLocaleString("en-IN");
    const outputTokens = Number(member.output_tokens ?? 0).toLocaleString("en-IN");

    const html = [
      '<div style="margin:0;background:#09090f;padding:36px 14px;font-family:Inter,Arial,sans-serif;color:#f4f4f5">',
      '<div style="max-width:560px;margin:0 auto;border:1px solid #292638;border-radius:18px;overflow:hidden;background:#111019">',
      '<div style="padding:24px 28px;background:linear-gradient(120deg,#20143d,#141c38);border-bottom:1px solid #302a45">',
      '<div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#b9a7ff;font-weight:700">NEXORA WORKSPACE</div>',
      '<h1 style="margin:12px 0 0;font-size:24px;color:#fff">Usage summary</h1></div>',
      '<div style="padding:28px"><p style="margin:0 0 18px;color:#d4d4d8">Hello ' + name + ', here is your latest Nexora account usage summary.</p>',
      '<table role="presentation" style="width:100%;border-collapse:collapse">',
      '<tr><td style="padding:13px 0;border-bottom:1px solid #302d3a;color:#a1a1aa">Nexora Tokens used</td><td style="padding:13px 0;border-bottom:1px solid #302d3a;text-align:right;font-weight:700;color:#fff">' + used + '</td></tr>',
      '<tr><td style="padding:13px 0;border-bottom:1px solid #302d3a;color:#a1a1aa">Available balance</td><td style="padding:13px 0;border-bottom:1px solid #302d3a;text-align:right;font-weight:700;color:#fff">' + balance + '</td></tr>',
      '<tr><td style="padding:13px 0;border-bottom:1px solid #302d3a;color:#a1a1aa">Completed AI requests</td><td style="padding:13px 0;border-bottom:1px solid #302d3a;text-align:right;font-weight:700;color:#fff">' + requests + '</td></tr>',
      '<tr><td style="padding:13px 0;border-bottom:1px solid #302d3a;color:#a1a1aa">Input / output tokens</td><td style="padding:13px 0;border-bottom:1px solid #302d3a;text-align:right;font-weight:700;color:#fff">' + inputTokens + ' / ' + outputTokens + '</td></tr>',
      '</table><p style="margin:22px 0 0;color:#a1a1aa;font-size:13px;line-height:1.6">Token usage is an application usage measure, not a currency charge.</p>',
      '<div style="margin-top:26px;padding-top:18px;border-top:1px solid #302d3a;color:#d4d4d8;font-size:13px;line-height:1.7">Regards,<br><strong style="color:#fff">Nexora Billing &amp; Workspace</strong><br>Automated account notification</div></div>',
      '<div style="padding:14px 28px;background:#0b0a10;color:#71717a;font-size:11px;line-height:1.6">This is an automatically generated email. Replies to this address are not monitored.</div>',
      '</div></div>',
    ].join("");

    const textBody = [
      "NEXORA WORKSPACE",
      "Usage summary for " + (member.full_name || "Nexora member"),
      "Nexora Tokens used: " + used,
      "Available balance: " + balance,
      "Completed AI requests: " + requests,
      "Input tokens: " + inputTokens,
      "Output tokens: " + outputTokens,
      "",
      "Regards,",
      "Nexora Billing & Workspace",
      "Automated account notification.",
      "This is an automatically generated email. Replies to this address are not monitored.",
    ].join("\n");

    const result = await mailer.transporter.sendMail({
      from: mailer.from,
      replyTo: mailer.from,
      to: member.email,
      subject: "Your Nexora usage summary",
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
      code: error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code ?? "") : "UNKNOWN",
    });
    return NextResponse.json({ error: describeSmtpError(error) }, { status: 502 });
  } finally {
    mailer.transporter.close();
  }
}
