"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

type Msg = { role: "user" | "assistant"; content: string; meta?: string };

const THINK_STEPS = [
  "Understanding your request…",
  "Selecting the best model…",
  "Running parallel reasoning…",
  "Checking consistency…",
  "Preparing the answer…",
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasKeys, setHasKeys] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/ai/chat")
      .then((r) => r.json())
      .then((d) => setHasKeys((d.providers || []).length > 0))
      .catch(() => setHasKeys(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, step]);

  useEffect(() => {
    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
  }, []);

  function startProgress() {
    setStep(0);
    if (stepTimer.current) clearInterval(stepTimer.current);
    stepTimer.current = setInterval(() => {
      setStep((s) => Math.min(s + 1, THINK_STEPS.length - 1));
    }, 900);
  }

  function stopProgress() {
    if (stepTimer.current) clearInterval(stepTimer.current);
    stepTimer.current = null;
  }

  async function closeChat() {
    if (conversationId) {
      try {
        await fetch(
          `/api/ai/chat?conversationId=${encodeURIComponent(conversationId)}`,
          { method: "DELETE" }
        );
      } catch {
        /* ignore */
      }
    }
    setMessages([]);
    setConversationId(null);
    setError(null);
    setInput("");
    inputRef.current?.focus();
  }

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    if (hasKeys === false) {
      setError(
        "No AI keys configured. Add OPENROUTER_API_KEY in Vercel and redeploy."
      );
      return;
    }
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    startProgress();
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId,
          mode: "auto",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      if (data.conversationId) setConversationId(data.conversationId);
      const meta = [data.provider, data.model].filter(Boolean).join(" · ");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply, meta },
      ]);
    } catch {
      setError("Network error. Try again.");
    } finally {
      stopProgress();
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <AppShell title="AI Chat">
      <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">
            Auto model · parallel when available
          </p>
          <button
            type="button"
            onClick={() => void closeChat()}
            className="text-xs rounded-lg border border-border/80 px-3 py-1.5 text-muted-foreground hover:text-foreground"
          >
            New chat
          </button>
        </div>

        {hasKeys === false ? (
          <div className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm">
            Add OPENROUTER_API_KEY in Vercel, then Redeploy.
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto rounded-2xl border border-border/60 bg-card/30 p-4 space-y-4 scroll-smooth">
          {messages.length === 0 && !loading ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-6">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-violet-500/25">
                AI
              </div>
              <p className="text-sm font-medium">Ask anything</p>
              <p className="mt-2 text-xs text-muted-foreground max-w-sm leading-relaxed">
                Nexora picks the model automatically and shows live progress.
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/70 rounded-bl-md border border-border/30"
                  }`}
                >
                  {m.content}
                  {m.meta ? (
                    <div className="mt-2 text-[10px] opacity-55 font-mono">
                      {m.meta}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}

          {loading ? (
            <div className="rounded-2xl border border-border/40 bg-muted/30 px-4 py-3 space-y-2 max-w-md">
              {THINK_STEPS.map((label, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 text-xs ${
                      active
                        ? "text-foreground opacity-100"
                        : done
                          ? "text-muted-foreground opacity-70"
                          : "text-muted-foreground opacity-35"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        active
                          ? "bg-primary animate-pulse"
                          : done
                            ? "bg-primary/60"
                            : "bg-border"
                      }`}
                    />
                    <span>{label}</span>
                    {active ? (
                      <span className="ml-auto text-[10px] text-primary font-medium">
                        live
                      </span>
                    ) : null}
                  </div>
                );
              })}
              <div className="pt-1 h-1 rounded-full bg-border/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700 ease-out"
                  style={{
                    width: `${((step + 1) / THINK_STEPS.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <div className="mt-3 rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <form onSubmit={send} className="mt-3 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Message… Enter to send"
            className="flex-1 resize-none rounded-xl border border-border/80 bg-card/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 max-h-36"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-45"
          >
            {loading ? "…" : "Send"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
