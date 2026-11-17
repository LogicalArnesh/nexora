import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AppShell title="Profile">
      <div className="max-w-lg rounded-2xl border border-border/60 bg-card/50 p-6 space-y-4 nexora-fade-up">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white">
            {(profile?.full_name || user.email || "U").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{profile?.full_name || user.email || "Nexora account"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="mt-1 inline-flex rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">{profile?.role === "admin" ? "Administrator" : "Member"}</span>
          </div>
        </div>
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between border-b border-border/40 py-2">
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="capitalize">{profile?.plan || "free"}</dd>
          </div>
        </dl>
        <Link href="/settings" className="inline-flex text-sm text-primary hover:underline">
          Account settings →
        </Link>
      </div>
    </AppShell>
  );
}
