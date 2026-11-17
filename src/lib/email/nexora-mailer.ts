import nodemailer from "nodemailer";

export function createNexoraMailer() {
  const missing = [
    ["NEXORA_SMTP_HOST", process.env.NEXORA_SMTP_HOST],
    ["NEXORA_SMTP_USER", process.env.NEXORA_SMTP_USER],
    ["NEXORA_SMTP_PASSWORD", process.env.NEXORA_SMTP_PASSWORD],
    ["NEXORA_EMAIL_FROM", process.env.NEXORA_EMAIL_FROM],
  ].filter(([, value]) => !String(value ?? "").trim()).map(([key]) => key);

  if (missing.length) {
    return { ok: false as const, missing, message: "Configure the SMTP settings in Vercel Production, then redeploy." };
  }

  const host = process.env.NEXORA_SMTP_HOST!.trim();
  const port = Number(process.env.NEXORA_SMTP_PORT || 587);
  const user = process.env.NEXORA_SMTP_USER!.trim();
  const pass = process.env.NEXORA_SMTP_PASSWORD!;
  const from = process.env.NEXORA_EMAIL_FROM!.trim();
  const secure = process.env.NEXORA_SMTP_SECURE === "true" || port === 465;

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false as const, missing: ["NEXORA_SMTP_PORT"], message: "NEXORA_SMTP_PORT must be a valid TCP port." };
  }
  if (!(/<no-reply@[^>\s]+>/i.test(from) || /^no-reply@[^>\s]+$/i.test(from))) {
    return { ok: false as const, missing: ["NEXORA_EMAIL_FROM"], message: "Use a verified no-reply sender, such as Nexora <no-reply@your-domain.com>." };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    tls: { minVersion: "TLSv1.2" },
  });

  return { ok: true as const, transporter, from };
}

export function describeSmtpError(error: unknown) {
  const code = error && typeof error === "object" && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";

  if (code === "EAUTH") return "The SMTP server rejected the username or password. Recheck the SMTP credentials in Vercel.";
  if (code === "ENOTFOUND" || code === "ECONNECTION" || code === "ECONNREFUSED" || code === "ETIMEDOUT") {
    return "Nexora could not connect to the SMTP server. Check the host, port, TLS setting, and provider status.";
  }
  if (code === "EENVELOPE") return "The SMTP server rejected the sender or recipient. Confirm the sender address is verified with your provider.";
  return "The SMTP provider could not complete the request. Check its SMTP activity logs and configuration.";
}
