import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0912] text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="nexora-orb nexora-orb-a" />
        <div className="nexora-orb nexora-orb-b" />
        <div className="nexora-orb nexora-orb-c" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_0%,_#0a0912_70%)]" />
      </div>

      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-105">
              N
            </div>
            <span className="text-lg font-semibold tracking-tight">Nexora</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md nexora-fade-up">
          <div className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 shadow-2xl shadow-violet-500/10 backdrop-blur-xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
