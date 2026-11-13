"use client";

import { useActionState } from "react";
import { resetPassword, type AuthState } from "@/lib/auth/actions";

const initial: AuthState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-ring placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm" className="text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Repeat password"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-ring placeholder:text-muted-foreground"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 focus-ring"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
