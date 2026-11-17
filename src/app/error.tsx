"use client";

import { useEffect } from "react";
import Link from "next/link";
import { NexoraMark } from "@/components/brand/nexora-brand";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Nexora route error", error);
  }, [error]);

  return (
    <main className="nexora-error-screen">
      <div className="nexora-error-card">
        <div className="nexora-loading-mark"><NexoraMark size={48} /></div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Nexora workspace</p>
        <h1 className="text-2xl font-semibold">This page hit a problem</h1>
        <p className="text-sm text-muted-foreground">Your workspace is safe. Retry the page or return to your dashboard.</p>
        {error.digest ? <p className="text-xs text-muted-foreground">Reference: {error.digest}</p> : null}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <button onClick={() => reset()} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">Try again</button>
          <Link href="/dashboard" className="rounded-xl border border-border px-4 py-2.5 text-sm">Go to dashboard</Link>
        </div>
      </div>
    </main>
  );
}
