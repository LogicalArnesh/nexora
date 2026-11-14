"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

type Msg = { role: "user" | "assistant"; content: string };
type ProviderId = "xai" | "openai" | "gemini";

const LABELS: Record<ProviderId, string> = {
  xai: "Grok (xAI)",
  openai: "ChatGPT (OpenAI)",
  gemini: "Gemini (Google)",
};

export default function AiChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderId[]>([]);
  const [provider, setProvider] = useState<ProviderId | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ai/chat")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.providers || []) as ProviderId[];
        setProviders(list);
        if (list.length) setProvider(list[0]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
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
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="AI Chat">
      <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Model</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ProviderId)}
              className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
            >
              {providers.length === 0 ? (
                <option value="">No API keys configured</option>
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
            className="text-xs rounded-lg border border-border px-3 py-1.5 hover:bg-muted"
          >
            Close chat (clear storage)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 rounded-2xl border border-border bg-card/50 p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Chat with Grok, ChatGPT, or Gemini. Closing the chat deletes the
              conversation from the server so storage is not wasted.
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {loading ? (
            <div className="text-sm text-muted-foreground">Thinking…</div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <div className="mt-2 text-sm text-destructive">{error}</div>
        ) : null}

        <form onSubmit={send} className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Nexora AI…"
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-ring"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </div>
    </AppShell>
  );
}
