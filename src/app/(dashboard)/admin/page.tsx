import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AdminDashboardClient, type AdminDashboardData } from "@/components/admin/admin-dashboard-client";
import { createClient } from "@/lib/supabase/server";
export const metadata = { title: "Admin Console" };
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard");
  const { data, error } = await supabase.rpc("admin_get_nexora_dashboard_data");
  return <AppShell title="Admin Console">{error ? <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm">Could not load the administrator usage report. Check database RPC permissions and try again.</div> : <AdminDashboardClient data={data as AdminDashboardData} />}</AppShell>;
}
