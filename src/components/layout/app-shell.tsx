"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth/actions";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview" },
      { href: "/explore", label: "Marketplace" },
      { href: "/skills", label: "Skills" },
    ],
  },
  {
    label: "AI",
    items: [
      { href: "/tools/ai-chat", label: "AI Chat" },
      { href: "/tools/ai-pdf", label: "Documents" },
    ],
  },
  {
    label: "Productivity",
    items: [
      { href: "/tools/notes", label: "Notes" },
      { href: "/tools/projects", label: "Projects" },
      { href: "/tools/resume", label: "Resume" },
    ],
  },
  {
    label: "Utilities",
    items: [
      { href: "/tools/url-shortener", label: "Links" },
      { href: "/tools/weather", label: "Weather" },
      { href: "/tools/expenses", label: "Expenses" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", label: "Profile" },
      { href: "/settings", label: "Settings" },
      { href: "/subscription", label: "Plan" },
    ],
  },
];

export function AppShell({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/status", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : { isAdmin: false })
      .then((result: { isAdmin?: boolean }) => setIsAdmin(result.isAdmin === true))
      .catch(() => setIsAdmin(false));
    return () => controller.abort();
  }, []);
  const navGroups = isAdmin ? [...NAV_GROUPS, { label: "Administration", items: [{ href: "/admin", label: "Admin Console" }] }] : NAV_GROUPS;

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="min-h-screen bg-nexora-gradient flex">
      <aside className="hidden md:flex w-60 flex-col border-r border-border/50 bg-[#0c0b12]/85 backdrop-blur-xl">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-violet-500/20 transition-transform duration-200 group-hover:scale-105">
              N
            </div>
            <div className="leading-tight">
              <span className="font-semibold tracking-tight block">Nexora</span>
              <span className="text-[10px] text-muted-foreground">Workspace</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-3 mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-out ${
                        active
                          ? "bg-primary/15 text-foreground font-medium border border-primary/25 shadow-sm shadow-primary/10"
                          : "text-muted-foreground border border-transparent hover:text-foreground hover:bg-white/[0.06] hover:translate-x-0.5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-border/50">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-lg border border-border/60 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 hover:border-border transition-all duration-200"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-40 h-14 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold">
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
        <div className="md:hidden overflow-x-auto border-b border-border/40 px-2 py-2 flex gap-1.5">
          {navGroups.flatMap((g) => g.items)
            
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs transition-all duration-200 ${
                  isActive(item.href)
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {title ? (
            <h1 className="text-2xl font-semibold tracking-tight mb-6 hidden md:block nexora-fade-up">
              {title}
            </h1>
          ) : null}
          <div className="nexora-fade-up" style={{ animationDelay: "40ms" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
