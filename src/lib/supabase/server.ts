import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabaseAnonKey,
  getSupabaseServiceKey,
  getSupabaseUrl,
} from "@/lib/env";

type CookieToSet = {
  name: string;
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
};

export async function createClient() {
  const cookieStore = await cookies();
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — ignore
        }
      },
    },
  });
}

export function createServiceClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabaseServiceKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
