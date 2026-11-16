import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  createShortUrl,
  deleteShortUrl,
  toggleShortUrl,
} from "@/lib/tools/url-shortener";
import { UrlShortenerClient } from "@/components/tools/url-shortener-client";
import { AppShell } from "@/components/layout/app-shell";
import { getAppUrl } from "@/lib/env";

export const metadata = { title: "URL Shortener" };

export default async function UrlShortenerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: links } = await supabase
    .from("shortened_urls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell title="Link Shortener">
      <p className="text-sm text-muted-foreground mb-6 -mt-2">
        Create short links, optional aliases, and track clicks. Shared links use{" "}
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/s/code</code>.
      </p>
      <UrlShortenerClient
        links={links || []}
        appUrl={getAppUrl()}
        createAction={createShortUrl}
        deleteAction={deleteShortUrl}
        toggleAction={toggleShortUrl}
      />
    </AppShell>
  );
}
