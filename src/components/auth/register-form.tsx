"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "@/lib/auth/actions";

const initial: AuthState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="full_name" className="text-sm font-medium">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          placeholder="Alex Rivera"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-ring placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-ring placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
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

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 focus-ring"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
