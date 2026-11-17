"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signIn, type AuthState } from "@/lib/auth/actions";

const initial: AuthState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initial);
  const [tab, setTab] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpMsg, setOtpMsg] = useState<string | null>(null);
  const [otpErr, setOtpErr] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpErr(null);
    setOtpMsg(null);
    if (!email.trim()) {
      setOtpErr("Enter your email.");
      return;
    }
    setOtpBusy(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setOtpErr(data.error || "Could not send the code. Try again.");
        return;
      }
      setOtpSent(true);
      setOtpMsg(data.message || "Check your inbox for a 6-digit code and a secure link.");
    } catch {
      setOtpErr("Network error. Check your connection and try again.");
    } finally {
      setOtpBusy(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setOtpErr(null);
    setOtpBusy(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: otp.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setOtpErr(data.error || "Invalid code.");
        return;
      }
      window.location.href = redirectTo || data.redirectTo || "/dashboard";
    } catch {
      setOtpErr("Could not verify the code. Try again.");
    } finally {
      setOtpBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl border border-white/10 p-1 bg-black/20">
        <button
          type="button"
          onClick={() => setTab("password")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
            tab === "password"
              ? "bg-white/10 text-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setTab("otp")}
          className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
            tab === "otp"
              ? "bg-white/10 text-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Email code
        </button>
      </div>

      {tab === "password" ? (
        <form action={formAction} className="space-y-5">
          {redirectTo ? <input type="hidden" name="redirect" value={redirectTo} /> : null}
          {state.error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          ) : null}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className="w-full rounded-lg border border-input bg-background/80 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">Forgot password?</Link>
            </div>
            <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" className="w-full rounded-lg border border-input bg-background/80 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <button type="submit" disabled={pending} className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{pending ? "Signing in…" : "Sign in"}</button>
          <p className="text-center text-xs text-muted-foreground">No account? <Link href="/register" className="text-primary hover:underline">Create one</Link></p>
        </form>
      ) : (
        <form onSubmit={otpSent ? verifyOtp : sendOtp} className="space-y-5">
          {otpErr ? <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{otpErr}</div> : null}
          {otpMsg ? <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm">{otpMsg}</div> : null}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={otpSent} placeholder="you@company.com" className="w-full rounded-lg border border-input bg-background/80 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60" />
          </div>
          {otpSent ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">6-digit code</label>
              <input type="text" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))} required placeholder="000000" className="w-full rounded-lg border border-input bg-background/80 px-3 py-3 text-center text-lg tracking-[0.35em] font-mono outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          ) : null}
          <button type="submit" disabled={otpBusy} className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{otpBusy ? "Please wait…" : otpSent ? "Verify & continue" : "Send code"}</button>
          {otpSent ? (
            <button type="button" disabled={otpBusy} onClick={() => { setOtpSent(false); setOtp(""); setOtpMsg(null); setOtpErr(null); }} className="w-full text-xs text-muted-foreground hover:text-foreground">Use a different email</button>
          ) : null}
        </form>
      )}
    </div>
  );
}
