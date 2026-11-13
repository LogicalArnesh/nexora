import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("shortened_urls")
    .select("id, original_url, is_active, click_count")
    .eq("short_code", code)
    .maybeSingle();

  if (!link || !link.is_active) {
    return NextResponse.redirect(new URL("/", appUrl));
  }

  await Promise.all([
    supabase.from("url_analytics").insert({ url_id: link.id }),
    supabase
      .from("shortened_urls")
      .update({ click_count: (link.click_count || 0) + 1 })
      .eq("id", link.id),
  ]);

  return NextResponse.redirect(link.original_url);
}
