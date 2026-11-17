import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nexora — Everything You Need. One Intelligent Workspace.",
    template: "%s · Nexora",
  },
  icons: { icon: "/nexora-mark.webp", shortcut: "/nexora-mark.webp" },
  description:
    "Nexora is a premium all-in-one workspace: AI tools, productivity, project management, weather, notes, expenses and more — unified under one intelligent dashboard.",
  keywords: [
    "Nexora",
    "AI workspace",
    "productivity",
    "SaaS",
    "all-in-one",
    "dashboard",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
