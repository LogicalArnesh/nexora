import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = { title: "Explore Tools" };

const FALLBACK = [
  { id: "url-shortener", name: "URL Shortener", slug: "url-shortener", short_description: "Shorten & track links", category: "Utilities" },
  { id: "weather", name: "Weather", slug: "weather", short_description: "Live weather & forecasts", category: "Utilities" },
  { id: "ai-chat", name: "AI Chatbot", slug: "ai-chat", short_description: "Chat with AI", category: "Artificial Intelligence" },
  { id: "ai-pdf", name: "AI PDF Assistant", slug: "ai-pdf", short_description: "Chat with PDFs", category: "Artificial Intelligence" },
  { id: "notes", name: "Notes", slug: "notes", short_description: "Rich notes & pins", category: "Productivity" },
  { id: "projects", name: "Projects", slug: "projects", short_description: "Kanban boards", category: "Management" },
  { id: "expenses", name: "Expense Tracker", slug: "expenses", short_description: "Budgets & spending", category: "Finance" },
  { id: "resume", name: "Resume Builder", slug: "resume", short_description: "Build resumes", category: "Productivity" },
];

export default async function ExplorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tools } = await supabase.from("tools").select("*").eq("is_active", true).order("sort_order");
  const list = tools && tools.length > 0 ? tools : FALLBACK;

  return (
    <AppShell title="Explore Tools">
      <p className="text-sm text-muted-foreground mb-6">All applications in your Nexora workspace.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <Link key={t.id} href={`/tools/${t.slug}`} className="card-hover rounded-2xl border border-border bg-card p-5 block">
            <div className="text-xs font-medium text-primary mb-2">{t.category}</div>
            <h2 className="font-medium">{t.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.short_description || t.description}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
