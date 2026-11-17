"use client";

import { useState } from "react";

export function RequestStatementButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/usage/request-statement", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Could not send statement.");
        return;
      }
      setMsg(data.message || "Statement sent.");
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10 disabled:opacity-50 transition"
      >
        {busy ? "Sending\u2026" : "Email me a usage statement"}
      </button>
      {msg ? <p className="text-xs text-emerald-400">{msg}</p> : null}
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
    </div>
  );
}
