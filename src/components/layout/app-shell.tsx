"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { useUserRole } from "@/components/auth/role-context";

const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview" },
      { href: "/explore", label: "Marketplace" },
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
  const role = useUserRole();
  const navGroups = role === "admin"
    ? [...NAV_GROUPS, { label: "Administration", items: [{ href: "/admin", label: "Admin & usage" }] }]
    : NAV_GROUPS;

  function isActive(href: ¶»§q«^