"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  user_id: string; email?: string | null; full_name?: string | null; role?: string | null;
  created_at?: string | null; balance?: number | null; is_unlimited?: boolean;
  tokens_used?: number; request_count?: number; input_tokens?: number; output_tokens?: number; last_used_at?: string | null;
};
type Event = { id: string; email?: string | null; full_name?: string | null; operation?: string | null; provider?: string | null; model?: string | null; credits_charged?: number; created_at?: string };
export type AdminDashboardData = {
  totals?: { member_count?: number; active_users?: number; request_count?: number; tokens_charged?: number; input_tokens?: number; output_tokens?: number };
  members?: Member[]; recent_events?: Event[];
};
const fmt = (v: number | undefined | null) => Number(v ?? 0).toLocaleString("en-IN");
const when = (v?: string | null) => v ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Never";

export function AdminDashboardClient({ data }: { data: AdminDashboardData }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const members = data.members ?? [];
  const events = data.recent_events ?? [];
  const totals = data.totals ?? {};
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? members.filter((m) => [m.email, m.full_name, m.role].some((v) => String(v ?? "").toLowerCase().includes(q))) : members;
  }, [members, search]);

  async function runAction(member: Member, kind: "balance" | "email") {
    setBusyId(member.user_id);
    setNotice(null);
    try {
      const balance = Number(balances[member.user_id] ?? member.balance ?? 0);
      if (kind === "balance" && (!Number.isSafeInteger(balance) || balance < 0)) throw new Error("Enter a valid whole-number token balance.");
      const endpoint = kind === "balance" ? "/api/admin/users/" + member.user_id + "/balance" : "/api/admin/usage-report";
      const payload = kind === "balance"
        ? { balance, reason: reasons[member.user_id] || "Administrator token balance adjustment" }
        : { userId: member.user_id };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The requested action failed.");
      setNotice({ tone: "success", text: kind === "balance" ? "Token balance updated and recorded in the ledger." : "Usage report accepted by the email provider." });
      if (kind === "balance") router.refresh();
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "The requested action failed." });
    } finally {
      setBusyId("");
    }
  }

  const stats = [
    ["Members", fmt(totals.member_count)],
    ["Active users", fmt(totals.active_users)],
    ["Completed requests", fmt(totals.request_count)],
    ["Nexora Tokens charged", fmt(totals.tokens_charged)],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-sm text-muted-foreground">Workspace administration</p><h2 className="mt-1 text-xl font-semibold">Usage and member management</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Review each member’s token usage, balance, AI request count, and input/output token totals. Balance changes are recorded in the token ledger.</p></div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">Admin access</span>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((item) => <div key={item[0]} className="rounded-2xl border border-border/70 bg-card/60 p-4"><p className="text-xs text-muted-foreground">{item[0]}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{item[1]}</p></div>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card/40 p-4"><p className="text-xs text-muted-foreground">Provider input tokens</p><p className="mt-1 text-xl font-semibold tabular-nums">{fmt(totals.input_tokens)}</p></div>
        <div className="rounded-2xl border border-border/70 bg-card/40 p-4"><p className="text-xs text-muted-foreground">Provider output tokens</p><p className="mt-1 text-xl font-semibold tabular-nums">{fmt(totals.output_tokens)}</p></div>
      </div>
      {notice ? <div role="status" className={"rounded-xl border px-4 py-3 text-sm " + (notice.tone === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-destructive/30 bg-destructive/10 text-destructive")}>{notice.text}</div> : null}
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/50">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4"><div><h3 className="font-semibold">Members and token usage</h3><p className="mt-1 text-xs text-muted-foreground">Based on completed Nexora usage events.</p></div><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members…" aria-label="Search members" className="w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 sm:w-64" /></div>
        {filtered.length ? <div className="divide-y divide-border/60">{filtered.map((member) => {
          const used = Number(member.tokens_used ?? 0);
          const balance = Number(member.balance ?? 0);
          const total = used + balance;
          const percent = member.is_unlimited || total <= 0 ? 0 : Math.min(100, Math.round(used * 100 / total));
          return (
            <article key={member.user_id} className="space-y-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="truncate font-medium">{member.full_name || member.email || "Nexora member"}</h4><span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide " + (member.role === "admin" ? "bg-violet-500/15 text-violet-300" : "bg-muted text-muted-foreground")}>{member.role === "admin" ? "Admin" : "Member"}</span></div><p className="mt-1 break-all text-xs text-muted-foreground">{member.email || "No email on profile"}</p><p className="mt-1 text-[11px] text-muted-foreground">Joined {when(member.created_at)} · Last used {when(member.last_used_at)}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Available</p><p className="text-lg font-semibold tabular-nums">{member.is_unlimited ? "Unlimited" : fmt(balance)}</p></div></div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div><p className="text-[11px] text-muted-foreground">Tokens used</p><p className="mt-1 font-semibold tabular-nums">{fmt(used)}</p></div><div><p className="text-[11px] text-muted-foreground">AI requests</p><p className="mt-1 font-semibold tabular-nums">{fmt(member.request_count)}</p></div><div><p className="text-[11px] text-muted-foreground">Input tokens</p><p className="mt-1 font-semibold tabular-nums">{fmt(member.input_tokens)}</p></div><div><p className="text-[11px] text-muted-foreground">Output tokens</p><p className="mt-1 font-semibold tabular-nums">{fmt(member.output_tokens)}</p></div></div>
              {member.is_unlimited ? <p className="text-xs text-violet-300">Unlimited account — balance adjustments are disabled.</p> : <div><div className="mb-1 flex justify-between text-[11px] text-muted-foreground"><span>Used tokens / (used tokens + current balance)</span><span>{percent}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: percent + "%" }} /></div></div>}
              <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-background/40 p-3 sm:flex-row sm:items-end">
                {!member.is_unlimited ? <><label className="flex-1 space-y-1 text-xs text-muted-foreground">Set available balance<input type="number" min="0" max="1000000000000" step="1" value={balances[member.user_id] ?? String(balance)} onChange={(e) => setBalances((p) => ({ ...p, [member.user_id]: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></label><label className="flex-1 space-y-1 text-xs text-muted-foreground">Audit reason<input maxLength={240} value={reasons[member.user_id] ?? ""} onChange={(e) => setReasons((p) => ({ ...p, [member.user_id]: e.target.value }))} placeholder="Optional reason" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" /></label><button type="button" disabled={busyId === member.user_id} onClick={() => void runAction(member, "balance")} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{busyId === member.user_id ? "Working…" : "Update tokens"}</button></> : <p className="flex-1 text-xs text-muted-foreground">Token allocation is unlimited for this administrator account.</p>}
                <button type="button" disabled={!member.email || busyId === member.user_id} onClick={() => void runAction(member, "email")} className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-white/5 disabled:opacity-40">{busyId === member.user_id ? "Working…" : "Email usage report"}</button>
              </div>
            </article>
          );
        })}</div> : <p className="p-6 text-sm text-muted-foreground">No members match that search.</p>}
      </section>
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/50"><div className="border-b border-border/60 p-4"><h3 className="font-semibold">Recent AI usage</h3><p className="mt-1 text-xs text-muted-foreground">Latest usage events recorded by Nexora.</p></div>
        {events.length ? <div className="divide-y divide-border/60">{events.slice(0, 12).map((event) => <div key={event.id} className="grid gap-1 p-4 text-sm sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center sm:gap-4"><div className="min-w-0"><p className="truncate font-medium">{event.full_name || event.email || "Member"}</p><p className="truncate text-xs text-muted-foreground">{event.email || "No email"}</p></div><div><p className="text-xs text-muted-foreground">Operation</p><p className="truncate">{event.operation || "AI request"}</p></div><div><p className="text-xs text-muted-foreground">Provider / model</p><p className="truncate text-xs">{[event.provider, event.model].filter(Boolean).join(" · ") || "Not recorded"}</p></div><div className="sm:text-right"><p className="font-medium tabular-nums">{fmt(event.credits_charged)} tokens</p><p className="text-[11px] text-muted-foreground">{when(event.created_at)}</p></div></div>)}</div> : <p className="p-5 text-sm text-muted-foreground">No AI usage events have been recorded yet. Completed AI requests will appear here.</p>}
      </section>
      <p className="text-xs text-muted-foreground">Verified provider dollar costs are not shown because the metering flow does not store actual provider pricing. Nexora Token charges and observed input/output counts are shown instead.</p>
    </div>
  );
}
