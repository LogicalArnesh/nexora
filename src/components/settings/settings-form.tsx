"use client";
import { saveSettings } from "@/lib/settings/actions";

const messages: Record<string, string> = {
  saved: "Your settings have been saved.",
  username: "Username must be 3â€“32 characters and use only letters, numbers, or underscores.",
  password: "Password must contain at least 8 characters.",
  mismatch: "The password confirmation does not match.",
  "password-error": "The password could not be updated. Please try again.",
  "save-error": "Profile details could not be saved. Please try again.",
};
export function SettingsForm({ fullName, username, bio, email, status }: {
  fullName: string; username: string; bio: string; email: string; status?: string;
}) {
  return <form action={saveSettings} className="space-y-5">
    {status && <p role="status" className={"rounded-xl border px-4 py-3 text-sm " + (status === "saved" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-rose-500/30 bg-rose-500/10 text-rose-200")}>{messages[status] || "Unable to save settings."}</p>}
    <section className="rounded-2xl border border-border/70 bg-card/50 p-5 space-y-4">
      <div><h2 className="font-semibold">Profile details</h2><p className="mt-1 text-sm text-muted-foreground">These details appear across your Nexora workspace.</p></div>
      <label className="block space-y-1.5 text-sm"><span className="text-muted-foreground">Email address</span><input value={email} readOnly className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 tex¶»§q«^