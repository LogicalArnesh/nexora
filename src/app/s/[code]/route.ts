import { createServiceClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/env";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const appUrl = getAppUrl();

  if (!code || code.length > 64) {
    return NextResponse.redirect(new URL("/", appUrl));
  }

  // Service client: public redirects must work without a logged-in user (RLS).
  const supabase = createServiceClient();

  const { data: link, error } = await supabase
    .from("shortened_urls")
    .select("id, original_url, is_active, click_count")
    .eq("short_code", code)
    .maybeSingle();

  if (error || !link || !link.is_active) {
    const { data: byAlias } = await supabase
      .from("shortened_urls")
      .select("id, original_url, is_active, click_count")
      .eq("custom_alias", code)
      .maybeSingle();

    if (!byAlias || !byAlias.is_active) {
      return NextResponse.redirect(new URL("/?error=link_not_found", appUrl));
    }

    void trackClick(supabase, byAlias.id, byAlias.click_count);
    return NextResponse.redirect(byAlias.original_url, 302);
  }

  void trackClick(supabase, link.id, link.click_count);
  return NextResponse.redirect(link.original_url, 302);
}

async function trackClick(
  supabase: ReturnType<typeof createServiceClient>,
  id: string,
  clickCount: number | null
) {
  try {
    await Promise.all([
      supabase.from("url_analytics").insert({ url_id: id }),
      supabase
        .from("shortened_urls")
        .update({ click_count: (clickCount || 0) + 1 })
        .eq("id", id),
    ]);
  } catch {
    // analytics must never block the redirect
  }
}
