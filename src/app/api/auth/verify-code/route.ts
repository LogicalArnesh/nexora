import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CookieToSet = {
  name: string;
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    code?: unknown;
  } | null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const token = String(body?.code ?? "").replace(/\D/g, "").trim();

  if (!email || token.length < 6) {
    return NextResponse.json(
      { error: "Enter the email and the 6-digit code from your inbox." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* ignore when called outside a mutable context */
        }
      },
    },
  });

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return NextResponse.json(
      {
        error: /expired/i.test(error.message)
          ? "That code expired. Request a new one."
          : "Invalid or expired code.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true, redirectTo: "/dashboard" });
}
