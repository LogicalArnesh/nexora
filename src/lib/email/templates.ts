/** Log-style Nexora emails (GitHub / Vercel notice style). */

export function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c),
  );
}

function logBlock(lines: string[]) {
  const body = lines.map((l) => escapeHtml(l)).join("\n");
  return `<pre style="margin:0;padding:16px 18px;border-radius:10px;border:1px solid #30363d;background:#0d1117;color:#c9d1d9;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.7;white-space:pre-wrap;word-break:break-word">${body}</pre>`;
}

function shell(opts: { preheader: string; title: string; bodyHtml: string; footer: string }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;padding:0;background:#010409;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#c9d1d9">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#010409;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:580px;border:1px solid #30363d;border-radius:12px;overflow:hidden;background:#0d1117">
<tr><td style="padding:18px 22px;border-bottom:1px solid #21262d;background:#161b22">
  <div style="font-size:11px;letter-spacing:0.16em;font-weight:700;color:#a371f7">NEXORA · TWOTANY</div>
  <div style="margin-top:8px;font-size:18px;font-weight:600;color:#f0f6fc">${escapeHtml(opts.title)}</div>
</td></tr>
<tr><td style="padding:22px;font-size:14px;line-height:1.6;color:#c9d1d9">${opts.bodyHtml}</td></tr>
<tr><td style="padding:14px 22px;border-top:1px solid #21262d;background:#010409;font-size:11px;color:#8b949e;font-family:ui-monospace,Menlo,Consolas,monospace">${escapeHtml(opts.footer)}</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

export function buildLoginCodeEmail(args: {
  name?: string;
  email: string;
  code: string;
  link: string;
  requestedAt: Date;
  appUrl: string;
  ipHint?: string;
}) {
  const when = args.requestedAt.toISOString();
  const greeting = args.name ? `Hi ${args.name},` : "Hi,";
  const log = [
    "nexora.security.login_otp",
    "----------------------------------------",
    `event          login.otp.requested`,
    `account        ${args.email}`,
    `requested_at   ${when}`,
    `code_ttl       10m`,
    `app            ${args.appUrl}`,
    args.ipHint ? `client_hint    ${args.ipHint}` : null,
    "----------------------------------------",
    `otp            ${args.code}`,
    `action_link    ${args.link}`,
    "----------------------------------------",
    "If you did not request this, ignore this message.",
  ].filter(Boolean) as string[];

  const bodyHtml = `
    <p style="margin:0 0 14px;color:#c9d1d9">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 16px;color:#8b949e">Sign-in verification for your Nexora workspace. Use the one-time code or open the secure link.</p>
    <div style="margin:0 0 18px;padding:16px;border:1px solid #30363d;border-radius:10px;background:#161b22;text-align:center">
      <div style="font-size:11px;letter-spacing:0.12em;color:#8b949e;text-transform:uppercase">One-time code</div>
      <div style="margin-top:8px;font-size:32px;font-weight:700;letter-spacing:0.28em;color:#f0f6fc;font-family:ui-monospace,Menlo,Consolas,monospace">${escapeHtml(args.code)}</div>
    </div>
    <p style="margin:0 0 16px"><a href="${escapeHtml(args.link)}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#238636;color:#fff;text-decoration:none;font-weight:600;font-size:14px">Continue to Nexora</a></p>
    <p style="margin:0 0 8px;font-size:11px;color:#8b949e;letter-spacing:0.08em;text-transform:uppercase">System log</p>
    ${logBlock(log)}
  `;

  return {
    html: shell({
      preheader: `Nexora code ${args.code}`,
      title: "Sign-in verification",
      bodyHtml,
      footer: `nexora.security · ${args.email} · automated`,
    }),
    text: log.join("\n"),
    subject: `[Nexora] ${args.code} is your sign-in code`,
  };
}

export function buildUsageStatementEmail(args: {
  name?: string;
  email: string;
  issuedAt: Date;
  nextRefill: Date;
  balance: string;
  used: string;
  pct: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  unlimited: boolean;
  appUrl: string;
  recentLines?: string[];
}) {
  const issued = args.issuedAt.toISOString();
  const refill = args.nextRefill.toISOString();
  const lines =
    args.recentLines && args.recentLines.length
      ? args.recentLines
      : [
          "nexora.billing.usage_statement",
          "----------------------------------------",
          `account             ${args.email}`,
          `issued_at           ${issued}`,
          `tokens.balance      ${args.balance}`,
          `tokens.used         ${args.used}`,
          `tokens.usage_pct    ${args.pct}`,
          `tokens.grant        50000`,
          `tokens.unlimited    ${args.unlimited}`,
          `ai.requests         ${args.requests}`,
          `ai.input_tokens     ${args.inputTokens}`,
          `ai.output_tokens    ${args.outputTokens}`,
          `plan.refill_days    7`,
          `plan.next_refill    ${refill}`,
          `app                 ${args.appUrl}/subscription`,
          "----------------------------------------",
        ];

  const bar = Math.min(100, Math.max(0, args.pct));
  const bodyHtml = `
    <p style="margin:0 0 12px;color:#c9d1d9">${escapeHtml(args.name ? `Hi ${args.name},` : "Hi,")}</p>
    <p style="margin:0 0 16px;color:#8b949e">Nexora Tokens usage statement for <span style="color:#f0f6fc">${escapeHtml(args.email)}</span>.</p>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 14px;font-size:13px;font-family:ui-monospace,Menlo,Consolas,monospace">
      <tr><td style="padding:8px 0;border-bottom:1px solid #21262d;color:#8b949e">balance</td><td style="padding:8px 0;border-bottom:1px solid #21262d;text-align:right;color:#f0f6fc">${escapeHtml(args.balance)}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #21262d;color:#8b949e">used</td><td style="padding:8px 0;border-bottom:1px solid #21262d;text-align:right;color:#f0f6fc">${escapeHtml(args.used)}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #21262d;color:#8b949e">usage_pct</td><td style="padding:8px 0;border-bottom:1px solid #21262d;text-align:right;color:#f0f6fc">${bar}%</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #21262d;color:#8b949e">ai.requests</td><td style="padding:8px 0;border-bottom:1px solid #21262d;text-align:right;color:#f0f6fc">${args.requests}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #21262d;color:#8b949e">ai.in / ai.out</td><td style="padding:8px 0;border-bottom:1px solid #21262d;text-align:right;color:#f0f6fc">${args.inputTokens} / ${args.outputTokens}</td></tr>
      <tr><td style="padding:8px 0;color:#8b949e">next_refill</td><td style="padding:8px 0;text-align:right;color:#f0f6fc">${escapeHtml(refill)}</td></tr>
    </table>
    <div style="margin:0 0 16px;height:8px;border-radius:999px;background:#21262d;overflow:hidden"><div style="height:8px;width:${bar}%;background:#a371f7"></div></div>
    <p style="margin:0 0 8px;font-size:11px;color:#8b949e;letter-spacing:0.08em;text-transform:uppercase">System log</p>
    ${logBlock(lines)}
    <p style="margin:18px 0 0"><a href="${escapeHtml(args.appUrl)}/subscription" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#238636;color:#fff;text-decoration:none;font-weight:600;font-size:14px">Open plan &amp; usage</a></p>
  `;

  return {
    html: shell({
      preheader: `usage ${bar}% · balance ${args.balance}`,
      title: "Usage statement",
      bodyHtml,
      footer: `nexora.billing · issued ${issued} · ${args.email}`,
    }),
    text: lines.join("\n"),
    subject: `[Nexora] usage statement · ${bar}% used`,
  };
}
