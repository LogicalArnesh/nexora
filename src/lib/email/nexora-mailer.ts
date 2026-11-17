/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";

export function createNexoraMailer() {
  const missing = [
    ["NEXORA_SMTP_HOST", process.env.NEXORA_SMTP_HOST],
    ["NEXORA_SMTP_USER", process.env.NEXORA_SMTP_USER],
    ["NEXORA_SMTP_PASSWORD", process.env.NEXORA_SMTP_PASSWORD],
    ["NEXORA_EMAIL_FROM", process.env.NEXORA_EMAIL_FROM],
  ]
    .filter(([, value]) => !String(value ?? "").trim())
    .map(([key]) => key);

  if (missing.length) {
    return {
      ok: false as const,
      missing,
      message:
        "Configure NEXORA_SMTP_HOST, NEXORA_SMTP_USER, NEXORA_SMTP_PASSWORD, and NEXORA_EMAIL_FROM in Vercel Production, then redeploy.",
    };
  }

  const host = process.env.NEXORA_SMTP_HOST!.trim();
  const port = Number(process.env.NEXORA_SMTP_PORT || 587);
  const user = process.env.NEXORA_SMTP_USER!.trim();
  const pass = String(process.env.NEXORA_SMTP_PASSWORD ?? "").replace(/\s+/g, "");
  const from = process.env.NEXORA_EMAIL_FROM!.trim();

  const secureEnv = process.env.NEXORA_SMTP_SECURE;
  const secure =
    secureEnv === "true" ||
    secureEnv === "1" ||
    port === 465;

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return {
      ok: false as const,
      missing: ["NEXORA_SMTP_PORT"],
      message: "NEXORA_SMTP_PORT must be 465 (SSL) or 587 (STARTTLS).",
    };
  }
  if (!from.includes("@")) {
    return {
      ok: false as const,
      missing: ["NEXORA_EMAIL_FROM"],
      message: "Use a real sender such as Nexora <you@gmail.com>.",
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
    tls: {
      minVersion: "TLSv1.2",
      servername: host,
    },
    requireTLS: !secure && port === 587,
  } as any);

  return { ok: true as const, transporter, from, port, secure };
}

export function describeSmtpError(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const response =
    error && typeof error === "object" && "response" in error
      ? String((error as { response?: unknown }).response ?? "")
      : "";
  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";

  if (code === "EAUTH" || /invalid login|username and password/i.test(message + response)) {
    return "SMTP rejected the username or password. For Gmail use an App Password (16 characters). On port 465 set NEXORA_SMTP_SECURE=true.";
  }
  if (code === "ESOCKET" || code === "ECONNECTION" || code === "ETIMEDOUT" || code === "ENOTFOUND" || code === "ECONNREFUSED") {
    return "Could not connect to the SMTP host. For Gmail use smtp.gmail.com with port 465 (SSL) or 587 (STARTTLS).";
  }
  if (code === "EENVELOPE" || /sender|from/i.test(message + response)) {
    return "SMTP rejected the From address. NEXORA_EMAIL_FROM must match the authenticated Gmail account.";
  }
  if (message) return message.slice(0, 240);
  return "The SMTP provider could not complete the request.";
}
