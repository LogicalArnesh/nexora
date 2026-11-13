import Link from "next/link";

const FEATURED_TOOLS = [
  {
    name: "AI Chatbot",
    description: "Streaming conversations with full history and markdown.",
    category: "AI",
  },
  {
    name: "AI PDF Assistant",
    description: "Upload documents, summarize, and ask grounded questions.",
    category: "AI",
  },
  {
    name: "Project Management",
    description: "Kanban boards, priorities, deadlines and progress.",
    category: "Management",
  },
  {
    name: "URL Shortener",
    description: "Custom aliases, analytics, QR codes and click tracking.",
    category: "Utilities",
  },
  {
    name: "Weather Dashboard",
    description: "Live conditions, hourly and 7-day forecasts worldwide.",
    category: "Utilities",
  },
  {
    name: "Notes & Productivity",
    description: "Rich notes, tags, pins, search and autosave.",
    category: "Productivity",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-nexora-gradient flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              N
            </div>
            <span className="text-lg font-semibold tracking-tight">Nexora</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#tools" className="hover:text-foreground transition-colors">
              Tools
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-ring"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/50 px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          All-in-one intelligent workspace
        </div>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Everything You Need.{" "}
          <span className="text-gradient">One Intelligent Workspace.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
          Nexora unifies AI tools, productivity apps, project management and
          utilities under a single premium dashboard — private, fast, and
          designed for focus.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all focus-ring"
          >
            Start free
          </Link>
          <a
            href="#tools"
            className="rounded-xl border border-border bg-card/50 px-8 py-3.5 text-sm font-medium hover:bg-card transition-colors focus-ring"
          >
            Explore tools
          </a>
        </div>
      </section>

      {/* Featured tools */}
      <section id="tools" className="mx-auto w-full max-w-6xl px-4 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Powerful tools, one home
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Discover applications that work together seamlessly inside your
            private Nexora workspace.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="card-hover group rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-3 inline-flex rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {tool.category}
              </div>
              <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features strip */}
      <section id="features" className="border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-10 sm:grid-cols-3 text-center">
          <div>
            <h3 className="font-medium">Unified identity</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              One account, one sidebar, consistent design across every tool.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Private by design</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your data stays yours. Row-level security and secure storage.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Built to scale</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Modular architecture so new applications plug in cleanly.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-3 text-muted-foreground">
          Start free. Upgrade when you need more AI capacity and advanced
          features.
        </p>
        <div className="mt-10 inline-flex rounded-2xl border border-border bg-card p-8 text-left max-w-sm w-full">
          <div>
            <div className="text-sm font-medium text-primary">Free</div>
            <div className="mt-1 text-3xl font-semibold">$0</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Core tools, limited AI usage, personal workspace.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              N
            </div>
            <span className="text-sm font-medium">Nexora</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nexora. Everything You Need. One
            Intelligent Workspace.
          </p>
        </div>
      </footer>
    </div>
  );
}
