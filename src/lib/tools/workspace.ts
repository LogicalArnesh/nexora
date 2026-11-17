"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createProject(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") || "").trim().slice(0, 100);
  const description = String(formData.get("description") || "").trim().slice(0, 1000);
  if (!name) redirect("/tools/projects?status=missing-name");
  const { error } = await supabase.from("projects").insert({ user_id: user.id, name, description, status: "active" });
  if (error) redirect("/tools/projects?status=error");
  revalidatePath("/tools/projects");
  redirect("/tools/projects?status=created");
}

export async function createProjectTask(formData: FormData) {
  const { supabase, user } = await requireUser();
  const projectId = String(formData.get("project_id") || "");
  const title = String(formData.get("title") || "").trim().slice(0, 160);
  if (!/^[0-9a-f-]{36}$/i.test(projectId) || !title) redirect("/tools/projects?status=invalid-task");
  const { data: project } = await supabase.from("projects").select("id").eq("id", projectId).eq("user_id", user.id).maybeSingle();
  if (!project) redirect("/tools/projects?status=invalid-project");
  const¶»§q«^