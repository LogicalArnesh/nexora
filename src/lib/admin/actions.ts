"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function setTokenBalance(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/dashboard");

  const userId = String(formData.get("user_id") || "");
  const balance = Number(formData.get("balance"));
  const reason = String(formData.get("reason") || "Administrator token balance update").slice(0, 240);
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !Number.isSafeInteger(balance) || balance < 0 || balance > 1000000000000) redirect("/admin?status=invalid");

  const { error } = await supabase.rpc("admin_set_nexora_token_balance", {
    p_user_id: userId, p_balance: balance, p_reason: reason,
  });
  if (error) redirect("/admin?status=error");
  revalidatePath("/admin");
  revalidatePath("/subscription");
  redirect("/admin?status=saved");
}
