"use client";

import { useState, useTransition } from "react";

type LinkRow = {
  id: string;
  original_url: string;
  short_code: string;
  custom_alias: string | null;
  title: string | null;
  is_active: boolean;
  click_count: number;
  created_at: string;
};

export function UrlShortenerClient({
  links,
  appUrl,
  createAction,
  deleteAction,
  toggleAction,
}: {
  links: LinkRow[];
  appUrl: string;
  createAction: (fd: FormData) => Promise<{ error?: string; data?: unknown }>;
  deleteAction: (id: string) => Promise<{ error?: string }>;
  toggleAction: (id: string, isActive: boolean) => Promise<{ error?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await createAction(fd);
      if (res.error) setError(res.error);
      else (e.target as HTMLFormElement).reset();
    });
  }

  function copy(code: string) {
    const url = `${appUrl}/s/${code}`;
    void navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onCreate} className="rounded-2xl border border-border bg-card p-6 space-y-4">
        {error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        <div className="space-y-2">
          <label className="text-sm font-medium">Long URL</label>
          <input
            name="original_url"
            type="url"
            required
            placeholder="https://example.com/very/long/path"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-ring"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom alias (optional)</label>
            <input
              name="custom_alias"
              type="text"
              pattern="[a-zA-Z0-9_-]+"
              placeholder="my-link"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title (optional)</label>
            <input
              name="title"
              type="text"
              placeholder="Campaign landing"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-ring"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {pending ? "Creating…" : "Shorten URL"}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Your links ({links.length})</h2>
        {links.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No links yet. Create your first short URL above.
          </div>
        ) : (
          <ul className="space-y-3">
            {links.map((link) => {
              const short = `${appUrl}/s/${link.short_code}`;
              return (
                <li
                  key={link.id}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {link.title || link.short_code}
                      </span>
                      {!link.is_active ? (
                        <span className="text-xs text-muted-foreground">Inactive</span>
                      ) : null}
                    </div>
                    <a
                      href={short}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {short}
                    </a>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{link.original_url}</p>
                    <p className="text-xs text-muted-foreground mt-1">{link.click_count} clicks</p>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => copy(link.short_code)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      {copied === link.short_code ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(() => void toggleAction(link.id, !link.is_active))
                      }
                      className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted"
                    >
                      {link.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startTransition(() => void deleteAction(link.id))}
                      className="rounded-lg border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
