"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Spinner } from "@/components/ui/loading";

type Msg = { role: "user" | "assistant"; content: string; meta?: string };
type ProviderId = "openrouter" | "xai" | "openai" | "gemini";

const LABELS: Record<ProviderId, string> = {
  openrouter: "OpenRouter",
  xai: "Grok · xAI",
  openai: "ChatGPT · OpenAI",
  gemini: "Gemini · Google",
};

type OrModel = { id: string; label: string };

export default function AiChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderId[]>([]);
  const [provider, setProvider] = useState<ProviderId | "">("");
  const [orModels, setOrModels] = useState<OrModel[]>([]);
  const [model, setModel] = useState("");
  const [mode, setMode] = useState<"single" | "race">("single");
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
        const models = (d.openrouterModels || []) as OrModel[];
        setOrModels(models);
        if (models[0]) setModel(models[0].id);
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
        "No AI keys on the server. Add OPENROUTER_API_KEY (recommended) or XAI_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY in Vercel, then Redeploy."
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
          model: provider === "openrouter" ? model : undefined,
          mode:
            mode === "race" && providers.includes("openrouter")
              ? "race"
              : "single",
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
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const canRace = providers.includes("openrouter");

  return (
    <AppShell title="AI Chat">
      <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as ProviderId)}
            disabled={!providers.length}
            className="rounded-lg border border-border/80 bg-card/80 px-2.5 py-1.5 text-sm"
          >
            {!ready ? (
              <option>Loading…</option>
            ) : providers.length === 0 ? (
              <option value="">No keys configured</option>
            ) : (
              providers.map((p) => (
                <option key={p} value={p}>
                  {LABELS[p]}
                </option>
              ))
            )}
          </select>

          {provider === "openrouter" && orModels.length > 0 && mode === "single" ? (
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-lg border border-border/80 bg-card/80 px-2.5 py-1.5 text-sm max-w-[200px]"
            >
              {orModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          ) : null}

          {canRace ? (
            <div className="flex rounded-lg border border-border/80 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`px-3 py-1.5 ${
                  mode === "single"
                    ? "bg-primary/20 text-foreground"
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                Single
              </button>
              <button
                type="button"
                onClick={() => setMode("race")}
                className={`px-3 py-1.5 ${
                  mode === "race"
                    ? "bg-primary/20 text-foreground"
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                Race models
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void closeChat()}
            className="ml-auto text-xs rounded-lg border border-border/80 px-3 py-1.5 text-muted-foreground hover:text-foreground"
          >
            New chat
          </button>
        </div>

        {!providers.length && ready ? (
          <div className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm leading-relaxed">
            Add OPENROUTER_API_KEY (or XAI/OPENAI/GEMINI keys) in Vercel
            Environment Variables, then Redeploy. Keys are not stored in
            Supabase Auth.
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto rounded-2xl border border-border/60 bg-card/30 p-4 space-y-4 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center px-6">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-violet-500/25">
                AI
              </div>
              <p className="text-sm font-medium">Multi-model workspace chat</p>
              <p className="mt-2 text-xs text-muted-foreground max-w-sm leading-relaxed">
                Single model or Race several OpenRouter models. New chat clears
                server storage.
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
                    <div className="mt-2 text-[10px] opacity-60 font-mono">
                      {m.meta}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              <span>{mode === "race" ? "Racing models…" : "Generating…"}</span>
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
