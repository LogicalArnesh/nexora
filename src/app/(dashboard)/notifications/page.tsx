import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <AppShell title="Notifications">
      <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center nexora-fade-up">
        <p className="text-sm font-medium">You&apos;re all caught up</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Product updates and activity will show up here.
        </p>
      </div>
    </AppShell>
  );
}
