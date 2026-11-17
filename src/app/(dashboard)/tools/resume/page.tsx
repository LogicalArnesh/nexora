import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { createResume } from "@/lib/tools/workspace";
export const metadata = { title: "Resume Builder" };
type Resume = { id: string; title: string; template: string; data: { full_name?: string; email?: string; headline?: string; summary?: string; skills?: string[] }; created_at: string };
export default async function ResumePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const [{ data }, { status }] = await Promise.all([supabase.from("resumes").select("id,title,template,data,created_at").eq("user_id", user.id).order("updated_at", { ascending: false }), searchParams]);
  const resumes = (data || []) as Resume[];
  return <AppShell title="Resume Builder"><div className="mx-auto max-w-5xl space-y-6 nexora-fade-up">
    <div><p className="text-sm text-muted-foreground">Career tools</p><h1 className="text-2xl font-semibold">Resume builder</h1><p className="mt-1 text-sm text-muted-foreground">Create a clean resume draft and keep versions in your workspace.</p></div>
    {status && <p role="status" className="rounded-xl border border-border bg-card p-3 text-sm">{status === "created" ? "Resume draft saved." : "Enter at least a resume title and your name."}</p>}
    <form act¶»§q«^