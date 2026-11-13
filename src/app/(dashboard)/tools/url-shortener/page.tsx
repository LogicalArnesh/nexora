import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createShortUrl, deleteShortUrl, toggleShortUrl } from "@/lib/tools/url-shortener";
import { UrlShortenerClient } from "@/components/tools/url-shortener-client";

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen bg-nexora-gradient">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              ← Dashboard
            </Link>
            <span className="text-sm font-medium">URL Shortener</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">URL Shortener</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create short links, custom aliases, and track clicks.
          </p>
        </div>

        <UrlShortenerClient
          links={links || []}
          appUrl={appUrl}
          createAction={createShortUrl}
          deleteAction={deleteShortUrl}
          toggleAction={toggleShortUrl}
        />
      </main>
    </div>
  );
}
