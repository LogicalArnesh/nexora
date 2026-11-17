import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const { userId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
  const body = await request.json().catch(() => null) as { balance?: unknown; reason?: unknown } | null;
  const balance = Number(body?.balance);
  const reason = String(body?.reason ?? "Administrator token adjustment").trim().slice(0, 240);
  if (!Number.isSafeInteger(balance) || balance < 0 || balance > 1000000000000) return NextResponse.json({ error: "Balance must be a whole number between 0 and 1,000,000,000,000." }, { status: 400 });
  const { data, error } = await supabase.rpc("admin_set_nexora_token_balance", { p_user_id: userId, p_balance: balance, p_reason: reason || "Administrator token adjustment" });
  if (error) return NextResponse.json({ error: error.message.includes("Unlimited accounts") ? "Unlimited administrator accounts cannot be adjusted." : error.message }, { status: 400 });
  return NextResponse.json({ success: true, result: data });
}
