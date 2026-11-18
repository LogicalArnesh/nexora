"use client";

import { useState, useRef } from "react";
import { AppShell } from "@/components/layout/app-shell";

const MODES = [
  { id: "ask", label: "Ask", desc: "Question & Answer" },
  { id: "summarize", label: "Summarize", desc: "Bullet points" },
  { id: "edit", label: "Edit", desc: "Instructional edit" },
  { id: "notes", label: "Notes", desc: "Key takeaways" },
  { id: "quiz", label: "Quiz", desc: "5 test questions" },
];

export default function AiPdfPage() {
  const [document, setDocument] = useState("");
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("ask");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    if (!file.type.includes("text") && !file.name.endsWith(".txt") && !file.name.endsWith(".md")) {
      setError("Please upload a .txt or .md file. For PDFs, copy and paste the text below.");
      return;
    }

    try {
      const text = await file.text();
      setDocument(text.slice(0, 120000));
    } catch (err) {
      setError("Failed to read file.");
    }
  }

  async function runAi() {
    if (!document.trim()) {
      setError("Please provide a document first.");
      return;
    }
    if (mode === "ask" && !question.trim()) {
      setError("Please ask a question about the document.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setMeta(null);

    try {
      const res = await fetch("/api/ai/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document,
          question,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "AI request failed");
      } else {
        setResult(data.answer);
        setMeta(`${data.provider} · ${data.model}`);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="AI Documents">
      <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-2 h-[calc(100vh-10rem)]">
        {/* Input Panel */}
        <div className="flex flex-col space-y-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Source Document</h2>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-3 py-1.5 rounded-lg border border-border/80 hover:bg-white/5 transition-colors"
              >
                Upload Text
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.md"
              />
              <button
                onClick={() => setDocument("")}
                className="text-xs px-3 py-1.5 rounded-lg border border-border/80 text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="Paste document text here, or upload a text file..."
            className="flex-1 w-full rounded-2xl border border-border/60 bg-card/30 p-4 text-sm outline-none focus:ring-2 focus:ring-primary/25 resize-none font-mono"
          />

          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex-1 min-w-[80px] px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    mode === m.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 hover:border-primary/30 text-muted-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={mode === "ask" ? "Ask a question..." : "Additional instructions (optional)..."}
                className="flex-1 rounded-xl border border-border/80 bg-card/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
                onKeyDown={(e) => e.key === "Enter" && runAi()}
              />
              <button
                onClick={runAi}
                disabled={loading || !document.trim()}
                className="shrink-0 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-45 hover:opacity-95 transition-all"
              >
                {loading ? "..." : "Run AI"}
              </button>
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div className="flex flex-col space-y-4 overflow-hidden">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">AI Analysis</h2>

          <div className="flex-1 rounded-2xl border border-border/60 bg-card/50 p-6 overflow-y-auto relative">
            {error && (
              <div className="rounded-xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
                {error}
              </div>
            )}

            {result ? (
              <div className="space-y-4 nexora-fade-up">
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                  {result}
                </div>
                {meta && (
                  <div className="pt-4 border-t border-border/30 text-[10px] text-muted-foreground font-mono">
                    {meta}
                  </div>
                )}
              </div>
            ) : !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                </div>
                <p className="text-sm">Ready to analyze</p>
                <p className="text-xs mt-1">Select a mode and click Run AI to start.</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-xs text-muted-foreground animate-pulse">Nexora AI is thinking...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
