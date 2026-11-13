"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function generateCode(length = 7) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function createShortUrl(formData: FormData) {
  const originalUrl = String(formData.get("original_url") || "").trim();
  const customAlias = String(formData.get("custom_alias") || "").trim() || null;
  const title = String(formData.get("title") || "").trim() || null;

  if (!originalUrl) {
    return { error: "URL is required." };
  }
  try {
    new URL(originalUrl);
  } catch {
    return { error: "Enter a valid URL (include https://)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const shortCode = customAlias || generateCode();

  const { data, error } = await supabase
    .from("shortened_urls")
    .insert({
      user_id: user.id,
      original_url: originalUrl,
      short_code: shortCode,
      custom_alias: customAlias,
      title,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "That short code or alias is already taken." };
    }
    return { error: error.message };
  }

  revalidatePath("/tools/url-shortener");
  return { data };
}

export async function deleteShortUrl(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("shortened_urls")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/tools/url-shortener");
  return { success: true };
}

export async function toggleShortUrl(id: string, isActive: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("shortened_urls")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/tools/url-shortener");
  return { success: true };
}
