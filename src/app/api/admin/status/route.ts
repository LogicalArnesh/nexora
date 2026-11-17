import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ isAdmin: false }, { status: 401 });
  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (error) return NextResponse.json({ isAdmin: false }, { status: 503 });
  return NextResponse.json({ isAdmin: profile?.role === "admin" }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
