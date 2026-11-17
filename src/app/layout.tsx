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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://nexora-two-tawny.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Nexora — Everything You Need. One Intelligent Workspace.",
    template: "%s · Nexora",
  },
  description:
    "Nexora is a premium all-in-one workspace: AI tools, productivity, notes, links, and administrator usage controls.",
  applicationName: "Nexora",
  metadataBase: new URL(appUrl),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/logo.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
  },
  openGraph: {
    title: "Nexora",
    description: "Everything You Need. One Intelligent Workspace.",
    images: [{ url: "/logo.svg", alt: "Nexora TwoTany" }],
  },
  keywords: ["Nexora", "AI workspace", "productivity", "SaaS", "all-in-one", "dashboard"],
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
