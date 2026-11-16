import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export const metadata = { title: "Dashboard" };

const TOOLS = [
  {
    title: "AI Chat",
    href: "/tools/ai-chat",
    cat: "AI",
    desc: "Grok, ChatGPT, or Gemini in one place",
    accent: "from-violet-500/20 to-fuchsia-500/5",
  },
  {
    title: "Documents",
    href: "/tools/ai-pdf",
    cat: "AI",
    desc: "Ask, summarize, edit pasted documents",
    accent: "from-indigo-500/20 to-blue-500/5",
  },
  {
    title: "Notes",
    href: "/tools/notes",
    cat: "Productivity",
    desc: "Quick capture with pins",
    accent: "from-amber-500/15 to-orange-500/5",
  },
  {
    title: "Projects",
    href: "/tools/projects",
    cat: "Productivity",
    desc: "Boards with todo, in progress, and done",
    accent: "from-emerald-500/15 to-teal-500/5",
  },
  {
    title: "Link Shortener",
    href: "/tools/url-shortener",
    cat: "Utilities",
    desc: "Short links with click tracking",
    accent: "from-sky-500/15 to-cyan-500/5",
  },
  {
    title: "Weather",
    href: "/tools/weather",
    cat: "Utilities",
    desc: "Live conditions and hourly outlook",
    accent: "from-blue-500/15 to-slate-500/5",
  },
  {
    title: "Expenses",
    href: "/tools/expenses",
    cat: "Finance",
    desc: "Income, spending, and running balance",
    accent: "from-rose-500/15 to-red-500/5",
  },
  {
    title: "Resume",
    href: "/tools/resume",
    cat: "Career",
    desc: "Build and preview resumes side by side",
    accent: "from-purple-500/15 to-violet-500/5",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const name =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "there";

  const [notes, links, projects, expenses] = await Promise.all([
    supabase
      .from("notes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("shortened_urls")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("expenses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Notes", value: notes.count ?? 0, href: "/tools/notes" },
    { label: "Links", value: links.count ?? 0, href: "/tools/url-shortener" },
    { label: "Projects", value: projects.count ?? 0, href: "/tools/projects" },
    { label: "Expenses", value: expenses.count ?? 0, href: "/tools/expenses" },
  ];

  return (
    <AppShell>
      <div className="mb-8 space-y-2">
        <p className="text-sm text-muted-foreground">{greeting}</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {name}
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
          Your tools, data, and AI assistants in one workspace.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3 hover:border-primary/30 transition-colors"
          >
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">
              {s.value}
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Applications
        </h2>
        <Link href="/explore" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`group relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br ${item.accent} p-5 transition-all hover:border-primary/35 hover:shadow-lg hover:shadow-violet-500/5`}
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-primary/90 mb-2">
              {item.cat}
            </div>
            <h3 className="font-medium text-[15px]">{item.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
