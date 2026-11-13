import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotesClient } from "@/components/tools/notes-client";
import {
  createNote,
  deleteNote,
  togglePinNote,
  updateNote,
} from "@/lib/tools/notes";

export const metadata = { title: "Notes" };

export default async function NotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen bg-nexora-gradient">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Dashboard
          </Link>
          <span className="text-sm font-medium">Notes</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Capture ideas. Pin important notes.
          </p>
        </div>
        <NotesClient
          notes={notes || []}
          createAction={createNote}
          updateAction={updateNote}
          deleteAction={deleteNote}
          pinAction={togglePinNote}
        />
      </main>
    </div>
  );
}
