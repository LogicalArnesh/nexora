import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsForm } from "@/components/settings/settings-form";
import { createClient } from "@/lib/supabase/server";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: account }] = await Promise.all([
    supabase.from("profiles").select("full_name, username, bio, role").eq("id", user.id).maybeSingle(),
    supabase.from("nexora_token_accounts").select("balance, is_unlimited").eq("user_id", user.id).maybeSingle(),
  ]);
  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Account</p>
          <h2 className="mt-1 text-lg font-semibold">Profile preferences</h2>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">Manage the name and profile details shown across Nexora.</p>
          <SettingsForm fullName={profile?.full_name ?? ""} username={profile?.username ?? ""} bio={profile?.bio ?? ""} />
        </section>
        <section className="rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Plan and usage</p>
          <h2 className="mt-1 text-lg font-semibold">Nexora Tokens</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your balance is used for supported AI requests. Failed provider requests are refunded.</p>
          <div className="mt-4 flex flex-wrap items-end gap-6">
            <div><p className="text-xs text-muted-foreground">Available balance</p><p className="mt-1 text-2xl font-semibold tabular-nums">{account?.is_unlimited ? "Unlimited" : (account?.balance ?? 50000).toLocaleString("en-IN")}</p></div>
            <div><p className="text-xs text-muted-foreground">Account role</p><p className="mt-1 text-sm font-medium">{profile?.role === "admin" ? "Administrator" : "Member"}</p></div>
          </div>
        </section>
        <section className="rounded-2xl border border-border/70 bg-card/40 p-5">
          <p className="text-sm font-medium">Security note</p><p className="mt-1 text-sm text-muted-foreground">Your role and token permissions are controlled by server-side checks and database policies. They cannot be changed from profile settings.</p>
        </section>
      </div>
    </AppShell>
  );
}
