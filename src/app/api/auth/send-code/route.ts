import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createNexoraMailer, describeSmtpError } from "@/lib/email/nexora-mailer";
import { buildLoginCodeEmail } from "@/lib/email/templates";
import { getAppUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = normalizeEmail(String(body?.email ?? ""));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const mailer = createNexoraMailer();
  if (!mailer.ok) {
    return NextResponse.json(
      {
        error:
          "Email delivery is not configured. Set NEXORA_SMTP_HOST, NEXORA_SMTP_USER, NEXORA_SMTP_PASSWORD, and NEXORA_EMAIL_FROM in Vercel, then redeploy.",
        missing: mailer.missing,
      },
      { status: 503 },
    );
  }

  const admin = createServiceClient();
  const appUrl = getAppUrl().replace(/\/$/, "") || "https://nexora-two-tawny.vercel.app";

  try {
    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: email.split("@")[0] },
    });
    if (created.error && !/already|registered|exists/i.test(created.error.message)) {
      console.error("createUser", created.error.message);
    }

    const link = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: `${appUrl}/auth/callback`,
      },
    });

    if (link.error || !link.data?.properties) {
      return NextResponse.json(
        { error: link.error?.message || "Could not create a sign-in code. Try again in a moment." },
        { status: 502 },
      );
    }

    const code = String(link.data.properties.email_otp || "").trim();
    const actionLink = String(link.data.properties.action_link || "").trim();
    if (!code || !actionLink) {
      return NextResponse.json(
        { error: "Auth provider did not return a verification code. Check service role configuration." },
        { status: 502 },
      );
    }

    const meta = link.data.user?.user_metadata as { full_name?: string } | undefined;
    const name = meta?.full_name || email.split("@")[0];
    const requestedAt = new Date();
    const ipHint =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;

    const template = buildLoginCodeEmail({
      name,
      email,
      code,
      link: actionLink,
      requestedAt,
      appUrl,
      ipHint,
    });

    const result = await mailer.transporter.sendMail({
      from: mailer.from,
      to: email,
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
      message: "We sent a 6-digit code to your email. It expires in about 10 minutes.",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("send-code failed", error);
    return NextResponse.json({ error: describeSmtpError(error) }, { status: 502 });
  } finally {
    mailer.transporter.close();
  }
}
