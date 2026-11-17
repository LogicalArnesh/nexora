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
    desc: "Upload PDFs to summarize, question, and edit text",
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
¶»§q«^