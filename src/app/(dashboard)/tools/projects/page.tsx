import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { createProject, createProjectTask, updateProjectTaskStatus } from "@/lib/tools/workspace";
export const metadata = { title: "Projects" };
type Project = { id: string; name: string; description: string | null; status: string };
type Task = { id: string; project_id: string; title: string; status: string; priority: string; due_date: string | null };
const columns = [{ id: "todo", label: "To do" }, { id: "in_progress", label: "In progress" }, { id: "completed", label: "Completed" }];
export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login");
  const [{ data: projects }, { data: tasks }, { status }] = await Promise.all([
    supabase.from("projects").select("id,name,description,status").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("tasks").select("id,project_id,title,status,priority,due_date").eq("user_id", user.id).order("position"),
    searchParams,
  ]);
  const list = (projects || []) as Project[]; const taskList = (tasks || []) as Task[];
  return <AppShell title="Projects"><div className="space-y-6 nexora-fade-up">
    <div><p className="text-sm text-muted-foreground">Productivity</p><h1 classNam¶»§q«^