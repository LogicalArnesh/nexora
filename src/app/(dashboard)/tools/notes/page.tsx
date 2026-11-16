import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NotesClient } from "@/components/tools/notes-client";
import {
  createNote,
  deleteNote,
  togglePinNote,
  updateNote,
} from "@/lib/tools/notes";
import { AppShell } from "@/components/layout/app-shell";

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
    <AppShell title="Notes">
      <NotesClient
        notes={notes || []}
        createAction={createNote}
        updateAction={updateNote}
        deleteAction={deleteNote}
        pinAction={togglePinNote}
      />
    </AppShell>
  );
}
