"use client";
import { useActionState } from "react";
import { saveProfile, type AuthState } from "@/lib/auth/actions";
const initialState: AuthState = {};
export function SettingsForm({ fullName, username, bio }: { fullName: string; username: string; bio: string }) {
  const [state, action, pending] = useActionState(saveProfile, initialState);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</div> : null}
      {state.success ? <div role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{state.success}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm"><span className="font-medium">Display name</span><input name="full_name" defaultValue={fullName} maxLength={80} placeholder="Your name" className="w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30" /></label>
        <label className="space-y-2 text-sm"><span className="font-medium">Username</span><input name="username" defaultValue={username} maxLength={20} pattern="[A-Za-z0-9_]{3,20}" placeholder="your_username" className="w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30" /><span className="block text-xs text-muted-foreground">3–20 letters, numbers, or underscores.</span></label>
      </div>
      <label className="block space-y-2 text-sm"><span className="font-medium">Bio</span><textarea name="bio" defaultValue={bio} maxLength={240} rows={3} placeholder="A little about you…" className="w-full resize-y rounded-xl border border-border bg-background/70 px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary/30" /></label>
      <div className="flex flex-wrap items-center gap-3"><button type="submit" disabled={pending} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{pending ? "Saving…" : "Save changes"}</button><span className="text-xs text-muted-foreground">Your email address is managed by your sign-in provider.</span></div>
    </form>
  );
}
