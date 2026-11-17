"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = String(formData.get("full_name") || "").trim().slice(0, 80);
  const username = String(formData.get("username") || "").trim().slice(0, 32);
  const bio = String(formData.get("bio") || "").trim().slice(0, 240);
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm_password") || "");

  if (username && !/^[a-zA-Z0-9_]{3,32}$/.test(username)) redirect("/settings?status=username");
  if (password && password.length < 8) redirect("/settings?status=password");
  if (password !== confirm) redirect("/settings?status=mismatch");
  if (password) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) redirect("/settings?status=password-error");
  }
  const { error } = await supabase.from("profiles").update({
    full_name: fullName || null,
    username: username || null,
    bio: bio || null,
    updated_at: new Date().toISOString(),
  }).eq("id", user.id);
  if (error) redirect("/settings?status=save-error");
  revalidatePath("/settings");
  revalidatePath("/profile");
  redirect("/settings?status=saved");
}
