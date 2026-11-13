import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = { title: "Dashboard" };

const TOOLS = [
  { title: "URL Shortener", href: "/tools/url-shortener", cat: "Utilities", desc: "Short links & click tracking" },
  { title: "Notes", href: "/tools/notes", cat: "Productivity", desc: "Create, pin, manage notes" },
  { title: "Weather", href: "/tools/weather", cat: "Utilities", desc: "Live weather & forecasts" },
  { title: "AI Chat", href: "/tools/ai-chat", cat: "AI", desc: "Conversations with AI" },
  { title: "AI PDF", href: "/tools/ai-pdf", cat: "AI", desc: "Ask questions on documents" },
  { title: "Projects", href: "/tools/projects", cat: "Management", desc: "Kanban boards & tasks" },
  { title: "Expenses", href: "/tools/expenses", cat: "Finance", desc: "Income, spending, balance" },
  { title: "Resume", href: "/tools/resume", cat: "Productivity", desc: "Build & save resumes" },
  { title: "Explore", href: "/explore", cat: "Marketplace", desc: "Browse all tools" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "there";

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, {name}</h1>
        <p className="mt-2 text-muted-foreground">Everything you need. One intelligent workspace.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((item) => (
          <Link key={item.title} href={item.href} className="card-hover rounded-2xl border border-border bg-card p-5 block">
            <div className="text-xs font-medium text-primary mb-2">{item.cat}</div>
            <h2 className="font-medium">{item.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
