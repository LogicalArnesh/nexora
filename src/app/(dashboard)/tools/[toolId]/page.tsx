import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

const LABELS: Record<string, string> = {
  projects: "Projects",
  resume: "Resume Builder",
  expenses: "Expenses",
};

export default async function ToolFallbackPage({
  params,
}: {
  params: Promise<{ toolId: string }>;
}) {
  const { toolId } = await params;
  const label = LABELS[toolId] || "This tool";

  return (
    <AppShell title={label}>
      <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card/70 p-8 text-center nexora-fade-up">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold">N</div>
        <h1 className="text-xl font-semibold">{label} is not available yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">This feature is not connected in this build. You can return to Explore without getting stuck in a redirect or loading loop.</p>
        <Link href="/explore" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">Browse available tools</Link>
      </section>
    </AppShell>
  );
}
