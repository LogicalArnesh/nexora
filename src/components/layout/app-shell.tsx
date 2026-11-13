import Link from "next/link";
import { signOut } from "@/lib/auth/actions";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/explore", label: "All Tools" },
  { href: "/tools/ai-chat", label: "AI Chat" },
  { href: "/tools/ai-pdf", label: "AI PDF" },
  { href: "/tools/notes", label: "Notes" },
  { href: "/tools/projects", label: "Projects" },
  { href: "/tools/url-shortener", label: "URL Shortener" },
  { href: "/tools/weather", label: "Weather" },
  { href: "/tools/expenses", label: "Expenses" },
  { href: "/tools/resume", label: "Resume" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-nexora-gradient flex">
      <aside className="hidden md:flex w-56 flex-col border-r border-border/60 bg-card/40">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border/60">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              N
            </div>
            <span className="font-semibold tracking-tight">Nexora</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border/60">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-40 h-14 border-b border-border/60 bg-background/80 backdrop-blur-md flex items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              N
            </div>
            <span className="font-semibold text-sm">{title || "Nexora"}</span>
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-xs text-muted-foreground">
              Sign out
            </button>
          </form>
        </header>
        <div className="md:hidden overflow-x-auto border-b border-border/40 px-2 py-2 flex gap-1">
          {NAV.slice(0, 8).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {title ? (
            <h1 className="text-2xl font-semibold tracking-tight mb-6 hidden md:block">
              {title}
            </h1>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
