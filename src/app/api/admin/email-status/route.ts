import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNexoraMailer, describeSmtpError } from "@/lib/email/nexora-mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ connected: false, error: "Authentication required." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ connected: false, error: "Administrator access required." }, { status: 403 });

  const mailer = createNexoraMailer();
  if (!mailer.ok) {
    return NextResponse.json({
      connected: false,
      error: mailer.message,
      missing: mailer.missing,
    }, { status: 503 });
  }

  try {
    await mailer.transporter.verify();
    return NextResponse.json({
      connected: true,
      message: "Nexora can connect and authenticate with the SMTP server. This check does not send an email.",
    }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: describeSmtpError(error),
    }, { status: 502 });
  } finally {
    mailer.transporter.close();
  }
}
