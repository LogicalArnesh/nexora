"use client";

import { useState, useTransition } from "react";

type Note = {
  id: string;
  title: string;
  content: string | null;
  is_pinned: boolean;
  updated_at: string;
};

export function NotesClient({
  notes,
  createAction,
  updateAction,
  deleteAction,
  pinAction,
}: {
  notes: Note[];
  createAction: (fd: FormData) => Promise<{ error?: string }>;
  updateAction: (id: string, fd: FormData) => Promise<{ error?: string }>;
  deleteAction: (id: string) => Promise<{ error?: string }>;
  pinAction: (id: string, isPinned: boolean) => Promise<{ error?: string }>;
}) {
  const [selected, setSelected] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = selected
        ? await updateAction(selected.id, fd)
        : await createAction(fd);
      if (res.error) setError(res.error);
      else {
        setSelected(null);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary"
        >
          + New note
        </button>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => setSelected(n)}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors ${
                    selected?.id === n.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {n.is_pinned ? (
                      <span className="text-xs text-primary">Pinned</span>
                    ) : null}
                    <span className="font-medium text-sm truncate">{n.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {n.content || "Empty"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={save} className="rounded-2xl border border-border bg-card p-5 space-y-4 h-fit">
        {error ? (
          <div className="text-sm text-destructive border border-destructive/40 rounded-lg px-3 py-2">
            {error}
          </div>
        ) : null}
        <input
          key={selected?.id || "new"}
          name="title"
          defaultValue={selected?.title || ""}
          placeholder="Title"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus-ring"
        />
        <textarea
          key={(selected?.id || "new") + "-c"}
          name="content"
          defaultValue={selected?.content || ""}
          rows={12}
          placeholder="Write something…"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-ring resize-y min-h-[200px]"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "Saving…" : selected ? "Update" : "Create"}
          </button>
          {selected ? (
            <>
              <button
                type="button"
                onClick={() =>
                  startTransition(() => void pinAction(selected.id, !selected.is_pinned))
                }
                className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
              >
                {selected.is_pinned ? "Unpin" : "Pin"}
              </button>
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    await deleteAction(selected.id);
                    setSelected(null);
                  })
                }
                className="rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                Delete
              </button>
            </>
          ) : null}
        </div>
      </form>
    </div>
  );
}
