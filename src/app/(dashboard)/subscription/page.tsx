import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = { title: "Subscription" };

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AppShell title="Plan & usage">
      <div className="max-w-md rounded-2xl border border-border/60 bg-card/50 p-6 space-y-4 nexora-fade-up">
        <p className="text-sm text-muted-foreground">Current plan</p>
        <p className="text-2xl font-semibold capitalize">
          {profile?.plan || "free"}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Free workspace includes all tools. AI usage runs on your own provider
          keys (OpenRouter recommended).
        </p>
      </div>
    </AppShell>
  );
}
