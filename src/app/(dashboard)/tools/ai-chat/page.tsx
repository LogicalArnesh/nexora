"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Spinner } from "@/components/ui/loading";

type Msg = { role: "user" | "assistant"; content: string };
type ProviderId = "xai" | "openai" | "gemini";

const LABELS: Record<ProviderId, string> = {
  xai: "Grok · xAI",
  openai: "ChatGPT · OpenAI",
  gemini: "Gemini · Google",
};

export default function AiChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderId[]>([]);
  const [provider, setProvider] = useState<ProviderId | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/ai/chat")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.providers || []) as ProviderId[];
        setProviders(list);
        if (list.length) setProvider(list[0]);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
    if (!providers.length) {
      setError(
        "No AI provider is configured. Add XAI_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in Vercel environment variables, then redeploy."
      );
      return;
    }
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId,
          provider: provider || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
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
      <div className="flex flex-col h-[calc(100vh-9rem)] max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Model</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ProviderId)}
              disabled={!providers.length}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {!ready ? (
                <option>Loading…</option>
              ) : providers.length === 0 ? (
                <option value="">Not configured</option>
              ) : (
                providers.map((p) => (
                  <option key={p} value={p}>
                    {LABELS[p]}
                  </option>
                ))
              )}
            </select>
          </div>
          <button
            type="button"
            onClick={() => void closeChat()}
            className="text-xs rounded-lg border border-border px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            New chat
          </button>
        </div>

        {!providers.length && ready ? (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
            AI keys are missing on the server. In Vercel → Project → Settings →
            Environment Variables, add at least one of XAI_API_KEY, OPENAI_API_KEY,
            or GEMINI_API_KEY, then Redeploy.
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto rounded-2xl border border-border/70 bg-card/40 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center px-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 flex items-center justify-center text-sm font-bold text-white">
                AI
              </div>
              <p className="text-sm font-medium">Start a conversation</p>
              <p className="mt-1.5 text-xs text-muted-foreground max-w-sm leading-relaxed">
                Ask questions, draft copy, or work through problems. New chat
                clears stored messages on the server.
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
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/80 text-foreground rounded-bl-md border border-border/40"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              <span>Generating…</span>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <form onSubmit={send} className="mt-4 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Message… (Enter to send)"
            className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? "…" : "Send"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
