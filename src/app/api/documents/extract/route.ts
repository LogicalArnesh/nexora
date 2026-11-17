import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to upload a document." }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a PDF file first." }, { status: 400 });
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 415 });
    }
    if (file.size < 1 || file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "PDFs must be smaller than 10 MB." }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json({ error: "This file does not look like a valid PDF." }, { status: 400 });
    }

    const parsed = await pdfParse(bytes, { max: 40 });
    const text = String(parsed.text || "").replace(/\u0000/g, "").trim().slice(0, 120000);
    if (!text) {
      return NextResponse.json({ error: "No selectable text was found. Scanned/image-only PDFs¶»§q«^