/** Professional HTML + text email templates for Nexora (GitHub / Vercel style). */

export function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c),
  );
}

function shell(opts: {
  preheader: string;
  title: string;
  bodyHtml: string;
  footerNote?: string;
}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:#07060d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#e4e4e7">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#07060d;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;border:1px solid #2a2640;border-radius:16px;overflow:hidden;background:#0f0e16">
        <tr><td style="padding:22px 28px;background:linear-gradient(125deg,#1c1433 0%,#12182e 55%,#0f0e16 100%);border-bottom:1px solid #2a2640">
          <p style="margin:0;font-size:11px;letter-spacing:0.22em;font-weight:700;color:#c4b5fd">NEXORA · TWOTANY</p>
          <h1 style="margin:10px 0 0;font-size:22px;line-height:1.3;color:#fff;font-weight:650">${escapeHtml(opts.title)}</h1>
        </td></tr>
        <tr><td style="padding:28px;font-size:15px;line-height:1.65;color:#d4d4d8">
          ${opts.bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 28px;background:#0a0910;border-top:1px solid #1f1c2c;font-size:11px;line-height:1.55;color:#71717a">
          ${opts.footerNote || "This message was sent by Nexora. Replies are not monitored."}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
  const greeting = args.name ? `Hi ${args.name},` : "Hi,";
  const when = args.requestedAt.toUTCString();
  const bodyHtml = `
    <p style="margin:0 0 14px">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 18px">Someone requested a one-time sign-in code for your Nexora workspace associated with <strong style="color:#fff">${escapeHtml(args.email)}</strong>.</p>
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a1a1aa">Verification code</p>
    <div style="margin:0 0 20px;padding:18px;border-radius:12px;border:1px solid #4c3d7a;background:#161225;text-align:center;font-size:34px;font-weight:800;letter-spacing:0.28em;color:#fff;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace">${escapeHtml(args.code)}</div>
    <p style="margin:0 0 18px">Or continue with the secure link (expires soon):</p>
    <p style="margin:0 0 22px"><a href="${escapeHtml(args.link)}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#7c5cfc;color:#fff;text-decoration:none;font-weight:700">Open Nexora</a></p>
    <div style="margin:0 0 18px;padding:14px 16px;border-radius:10px;background:#12101c;border:1px solid #2a2640;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.7;color:#c4c4cc">
      <div>event: login.otp.requested</div>
      <div>account: ${escapeHtml(args.email)}</div>
      <div>requested_at: ${escapeHtml(when)}</div>
      <div>code_ttl: 10m</div>
      <div>app: ${escapeHtml(args.appUrl)}</div>
      ${args.ipHint ? `<div>client_hint: ${escapeHtml(args.ipHint)}</div>` : ""}
    </div>
    <p style="margin:0;font-size:13px;color:#a1a1aa">If you did not request this, you can ignore this email. Do not share the code with anyone.</p>
  `;
  const html = shell({
    preheader: `Your Nexora code is ${args.code}`,
    title: "Sign-in verification",
    bodyHtml,
    footerNote: `Nexora security · ${escapeHtml(args.email)} · Automated message`,
  });
  const text = [
    "NEXORA · TWOTANY",
    "Sign-in verification",
    "",
    greeting,
    "",
    `Account: ${args.email}`,
    `Requested: ${when}`,
    "",
    `Your one-time code: ${args.code}`,
    "",
    `Or open this link:`,
    args.link,
    "",
    "event: login.otp.requested",
    `account: ${args.email}`,
    `requested_at: ${when}`,
    "code_ttl: 10m",
    `app: ${args.appUrl}`,
    "",
    "If you did not request this, ignore this email.",
    "",
    "— Nexora Security",
  ].join("\n");
  return { html, text, subject: `${args.code} is your Nexora sign-in code` };
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
  const greeting = args.name ? `Hi ${args.name},` : "Hi,";
  const logLines = (args.recentLines?.length
    ? args.recentLines
    : [
        `tokens.balance=${args.balance}`,
        `tokens.used=${args.used}`,
        `tokens.usage_pct=${args.pct}`,
        `ai.requests=${args.requests}`,
        `ai.input_tokens=${args.inputTokens}`,
        `ai.output_tokens=${args.outputTokens}`,
        `plan.refill_window=${args.nextRefill.toISOString()}`,
        `plan.grant=50000`,
        `wallet.unlimited=${args.unlimited}`,
      ]
  ).map((l) => escapeHtml(l)).join("<br/>");

  const bodyHtml = `
    <p style="margin:0 0 14px">${escapeHtml(greeting)}</p>
    <p style="margin:0 0 18px">Here is your Nexora Tokens usage statement for <strong style="color:#fff">${escapeHtml(args.email)}</strong>.</p>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:0 0 18px;font-size:14px">
      <tr><td style="padding:10px 0;border-bottom:1px solid #2a2640;color:#a1a1aa">Balance</td><td style="padding:10px 0;border-bottom:1px solid #2a2640;text-align:right;color:#fff;font-weight:600">${escapeHtml(args.balance)}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #2a2640;color:#a1a1aa">Used (est.)</td><td style="padding:10px 0;border-bottom:1px solid #2a2640;text-align:right;color:#fff;font-weight:600">${escapeHtml(args.used)}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #2a2640;color:#a1a1aa">Usage</td><td style="padding:10px 0;border-bottom:1px solid #2a2640;text-align:right;color:#fff;font-weight:600">${args.pct}%</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #2a2640;color:#a1a1aa">AI requests</td><td style="padding:10px 0;border-bottom:1px solid #2a2640;text-align:right;color:#fff;font-weight:600">${args.requests}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #2a2640;color:#a1a1aa">Input / output tokens</td><td style="padding:10px 0;border-bottom:1px solid #2a2640;text-align:right;color:#fff;font-weight:600">${args.inputTokens} / ${args.outputTokens}</td></tr>
      <tr><td style="padding:10px 0;color:#a1a1aa">Next refill window</td><td style="padding:10px 0;text-align:right;color:#fff;font-weight:600">${escapeHtml(args.nextRefill.toUTCString())}</td></tr>
    </table>
    <div style="margin:0 0 16px;height:8px;border-radius:999px;background:#1c1830;overflow:hidden">
      <div style="height:8px;width:${Math.min(100, args.pct)}%;background:linear-gradient(90deg,#7c5cfc,#a78bfa)"></div>
    </div>
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a1a1aa">Machine log</p>
    <div style="margin:0 0 22px;padding:14px 16px;border-radius:10px;background:#0c0b14;border:1px solid #2a2640;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;line-height:1.75;color:#c4c4cc">${logLines}</div>
    <p style="margin:0 0 22px"><a href="${escapeHtml(args.appUrl)}/subscription" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#7c5cfc;color:#fff;text-decoration:none;font-weight:700">Open plan &amp; usage</a></p>
    <p style="margin:0;font-size:13px;color:#a1a1aa">Standard grant is 50,000 Nexora Tokens with a planned 7-day refill window. Administrators remain unlimited while usage is still logged for audit.</p>
  `;
  const html = shell({
    preheader: `Usage ${args.pct}% · balance ${args.balance}`,
    title: "Usage statement",
    bodyHtml,
    footerNote: `Nexora Billing · issued ${escapeHtml(args.issuedAt.toUTCString())} · ${escapeHtml(args.email)}`,
  });
  const text = [
    "NEXORA · TWOTANY — Usage statement",
    `Issued: ${args.issuedAt.toUTCString()}`,
    `Account: ${args.email}`,
    "",
    `Balance: ${args.balance}`,
    `Used: ${args.used}`,
    `Usage: ${args.pct}%`,
    `AI requests: ${args.requests}`,
    `Input tokens: ${args.inputTokens}`,
    `Output tokens: ${args.outputTokens}`,
    `Next refill window: ${args.nextRefill.toUTCString()}`,
    "",
    "--- machine log ---",
    ...(args.recentLines || [
      `tokens.balance=${args.balance}`,
      `tokens.used=${args.used}`,
      `tokens.usage_pct=${args.pct}`,
      `ai.requests=${args.requests}`,
    ]),
    "",
    `Open: ${args.appUrl}/subscription`,
    "",
    "— Nexora Billing & Workspace",
  ].join("\n");
  return {
    html,
    text,
    subject: `Nexora usage statement · ${args.pct}% used`,
  };
}
