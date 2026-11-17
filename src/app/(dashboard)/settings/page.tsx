import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsForm } from "@/components/settings/settings-form";
export const metadata = { title: "Settings" };
export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("full_name,username,bio").eq("id", user.id).maybeSingle();
  const { status } = await searchParams;
  return <AppShell title="Settings"><div className="mx-auto max-w-3xl space-y-6 nexora-fade-up">
    <div><p className="text-sm text-muted-foreground">Account</p><h1 className="text-2xl font-semibold tracking-tight">Settings</h1><p className="mt-1 text-sm text-muted-foreground">Manage your profile and account security.</p></div>
    <SettingsForm fullName={profile?.full_name || ""} username={profile?.username || ""} bio={profile?.bio || ""} email={user.email || ""} status={status} />
  </div></AppShell>;
}
