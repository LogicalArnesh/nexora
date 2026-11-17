"use client";
import { useState } from "react";

type Mode = "ask" | "summarize" | "edit" | "notes" | "quiz";
export function DocumentAiClient() {
  const [file, setFile] = useState<File | null>(null);
  const [document, setDocument] = useState("");
  const [fileInfo, setFileInfo] = useState<{ name: string; pages: number; chars: number } | null>(null);
  const [mode, setMode] = useState<Mode>("summarize");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function extract() {
    if (!file) return;
    setLoading(true); setError(""); setAnswer(""); setDocument("");
    try {
      const body = new FormData(); body.set("file", file);
      const response = await fetch("/api/documents/extract", { method: "POST", body, signal: AbortSignal.timeout(35000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not read this PDF.");
      setDocument(data.text);
      setFileInfo({ name: data.fileName, pages: data.pageCount, chars: data.characterCount });
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF extraction failed.");
    } finally { setLoading(false); }
  }

  async function runAi() {
    if (!document) return;
    if ((mode === "ask" || mode === "edit") && !question.trim()) { setError("Enter a question or edit instruction."); return; }
    setLoading(true); setE¶»§q«^