import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RequestStatementButton } from "@/components/usage/request-statement-button";
import { AppShell } from "@/components/layout/app-shell";
import { NexoraBrand } from "@/components/brand/nexora-brand";

export const metadata = { title: "Subscription" };

const DEFAULT_GRANT = 50_000;

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, role, full_name, nexora_token_balance, is_unlimited")
    .eq("id", user.id)
    .maybeSingle();

  const unlimited =
    profile?.role === "admin" || Boolean((profile as { is_unlimited?: boolean } | null)?.is_unlimited);
  const balanceRaw = Number(
    (profile as { nexora_token_balance?: number } | null)?.nexora_token_balance ?? DEFAULT_GRANT,
  );
  const usedEstimate = unlimited ? 0 : Math.max(0, DEFAULT_GRANT - Math.max(0, balanceRaw));
  const pct = unlimited ? 0 : Math.min(100, Math.round((usedEstimate / DEFAULT_GRANT) * 100));
  const nextRefill = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <AppShell title="Plan & usage">
      <div className="mx-auto max-w-lg space-y-4 nexora-fade-up">
        <div className="rounded-2xl border border-border/60 bg-card/50 p-6 space-y-4">
          <NexoraBrand size={40} subtitle="Nexora Tokens" priority />
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-2xl font-semibold capitalize">{profile?.plan || "free"}</p>
            {profile?.role === "admin" ? (
              <p className="mt-1 text-xs text-primary">Administrator · unlimited tokens, usage still logged</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Balance</span>
              <span className="font-semibold">
                {unlimited ? "Unlimited" : `${Math.max(0, balanceRaw).toLocaleString("en-IN")} left`}
              </span>
            </div>
            {!unlimited ? (
              <>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Standard grant is 50,000 Nexora Tokens. Estimated usage {pct}%. Planned refill every 7 days
                  (next window around {nextRefill.toUTCString()}). Admins can grant more from the Admin console.
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Your admin wallet is unlimited. Spend is still recorded for audit and usage statements.
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Chat and document AI reserve Nexora Tokens per request (about 10–60 for chat by size, 100 for
            documents / race mode). Input and output text are estimated at roughly 4 characters per token when
            the provider does not return counts.
          </p>
          <RequestStatementButton />
        </div>
      </div>
    </AppShell>
  );
}
