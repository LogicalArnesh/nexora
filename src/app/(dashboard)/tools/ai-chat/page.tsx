"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

type Msg = { role: "user" | "assistant"; content: string; meta?: string };

const THINK_STEPS = [
  "Understanding your request…",
  "Reading attached context…",
  "Selecting the best model…",
  "Running parallel reasoning…",
  "Preparing the answer…",
];

export default function AiChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [doc, setDoc] = useState("");
  const [docName, setDocName] = useState<string | null>(null);
  const [showDoc, setShowDoc] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasKeys, setHasKeys] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/ai/chat", { signal: AbortSignal.timeout(12000) })
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
    }, 850);
  }

  function stopProgress() {
    if (stepTimer.current) clearInterval(stepTimer.current);
    stepTimer.current = null;
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      setError("Upload .txt / .md / .csv / .json, or paste PDF text into Attach.");
      e.target.value = "";
      return;
    }
    try {
      const text = await file.text();
      setDoc(text.slice(0, 80000));
      setDocName(file.name);
      setShowDoc(true);
    } catch {
      setError("Could not read file.");
    }
    e.target.value = "";
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
      setError("Add OPENROUTER_API_KEY in Vercel and Redeploy.");
      return;
    }
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    startProgress();
    const payloadMessage = doc.trim()
      ? `Document context (${docName || "attached"}):\n---\n${doc.slice(0, 60000)}\n---\n\nUser question:\n${text}`
      : text;
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        signal: AbortSignal.timeout(60000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: payloadMessage,
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
    } catch (err) {
      setError(err instanceof DOMException && err.name === "TimeoutError"
        ? "This AI request took too long (60 seconds). Please try again with a shorter prompt."
        : "Network error. Check your connection and try again.");
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
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setShowDoc((v) => !v)}
            className={`text-xs rounded-lg border px-3 py-1.5 transition-all duration-200 ${
              showDoc || doc
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {doc ? `Document · ${docName || "pasted"}` : "Attach document"}
          </button>
          <label className="text-xs rounded-lg border border-border/80 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer transition-all duration-200">
            Upload file
            <input
              type="file"
              accept=".txt,.md,.csv,.json,.log,text/plain"
              className="hidden"
              onChange={onFile}
            />
          </label>
          {doc ? (
            <button
              type="button"
              onClick={() => {
                setDoc("");
                setDocName(null);
              }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear doc
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void closeChat()}
            className="ml-auto text-xs rounded-lg border border-border/80 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
          >
            New chat
          </button>
        </div>

        {showDoc ? (
          <div className="mb-3 rounded-xl border border-border/60 bg-card/40 p-3 space-y-2 nexora-fade-up">
            <p className="text-[11px] text-muted-foreground">
              Attached context is sent with each message (.txt / .md / paste).
            </p>
            <textarea
              value={doc}
              onChange={(e) => {
                setDoc(e.target.value);
                if (!docName) setDocName("pasted");
              }}
              rows={5}
              placeholder="Paste document text here…"
              className="w-full rounded-lg border border-border/80 bg-background/50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
        ) : null}

        {hasKeys === false ? (
          <div className="mb-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm">
            AI needs OPENROUTER_API_KEY (or XAI/OPENAI/GEMINI) in Vercel → Redeploy.
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto rounded-2xl border border-border/60 bg-card/30 p-4 space-y-4 scroll-smooth">
          {messages.length === 0 && !loading ? (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center px-6">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-violet-500/25">
                AI
              </div>
              <p className="text-sm font-medium">Ask anything</p>
              <p className="mt-2 text-xs text-muted-foreground max-w-sm leading-relaxed">
                Auto model selection with live progress. Attach a document for grounded answers.
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
                    className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
                      active
                        ? "opacity-100 text-foreground"
                        : done
                          ? "opacity-70 text-muted-foreground"
                          : "opacity-30 text-muted-foreground"
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
            className="shrink-0 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-45 hover:opacity-95 active:scale-[0.98] transition-all duration-150"
          >
            {loading ? "…" : "Send"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
