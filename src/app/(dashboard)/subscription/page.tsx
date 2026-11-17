import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
export const metadata = { title: "Plan & usage" };
const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n || 0);
export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: account }, { data: events }, { data: ledger }] = await Promise.all([
    supabase.from("nexora_token_accounts").select("balance,is_unlimited").eq("user_id", user.id).maybeSingle(),
    supabase.from("nexora_usage_events").select("id,operation,provider,model,input_tokens,output_tokens,credits_charged,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("nexora_token_ledger").select("id,entry_type,amount,balance_after,description,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);
  const completed = (events || []).filter((e) => e.status === "completed");
  const used = completed.reduce((sum, e) => sum + Number(e.credits_charged || 0), 0);
  const input = completed.reduce((sum, e) => sum + Number(e.input_tokens || 0), 0);
  const output = completed.reduce((sum, e) => sum + Number(e.output_tokens || 0), 0);
  const unlimited = account?.is_unlimited === true;
  const balance = Number(account?.balance || ¶»§q«^