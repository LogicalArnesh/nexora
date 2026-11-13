import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const name =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "there";

  return (
    <div className="min-h-screen bg-nexora-gradient">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              N
            </div>
            <span className="text-lg font-semibold tracking-tight">Nexora</span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your intelligent workspace is ready. Tools and marketplace come next.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "URL Shortener", href: "/tools/url-shortener", cat: "Utilities" },
            { title: "Weather", href: "/tools/weather", cat: "Utilities" },
            { title: "AI Chat", href: "/tools/ai-chat", cat: "AI" },
            { title: "Notes", href: "/tools/notes", cat: "Productivity" },
            { title: "Projects", href: "/tools/projects", cat: "Management" },
            { title: "Explore all", href: "/explore", cat: "Marketplace" },
          ].map((item) => (
            <div
              key={item.title}
              className="card-hover rounded-2xl border border-border bg-card p-5"
            >
              <div className="text-xs font-medium text-primary mb-2">
                {item.cat}
              </div>
              <h2 className="font-medium">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Coming in the next phases — structure is ready.
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
