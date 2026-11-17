import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";
import { setTokenBalance } from "@/lib/admin/actions";

export const metadata = { title: "Admin & usage" };
type Member = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
  balance: number | null;
  is_unlimited: boolean;
  tokens_used: number;
  request_count: number;
  input_tokens: number;
  output_tokens: number;
  last_used_at: string | null;
};
type Usage = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  operation: string;
  provider: string | null;
  model: string | null;
  input_tokens: number;
  output_tokens: number;
  credits_charged: number;
  estimated_cost_usd: number;
  status: string;
  created_at: string;
};
type Summary = {
  totals: {
    member_count: number;
    active_users: number;
    request_count: number;
    tokens_charged: number;
    input_tokens: number;
    output_tokens: number;
  };
  members: Member[];
  recent_events: Usage[];
};
const fmt = (n: number) => new Intl.NumberFormat("en-IN").format(n || 0);

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await auth.from("profiles")¶»§q«^