import { NextResponse } from "next/server";
import { estimateNexoraCredits, estimateTextTokens, reserveNexoraUsage, completeNexoraUsage, refundNexoraUsage } from "@/lib/billing/nexora-tokens";
import { createClient } from "@/lib/supabase/server";
import {
  chatCompletion,
  resolveProvider,
  type AIProviderId,
} from "@/lib/ai/providers";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const document = String(body.document || "").slice(0, 120000);
  const question = String(body.question || "").trim();
  const providerId = body.provider as AIProviderId | undefined;
  const mode = String(body.mode || "ask");

  if (!document) {
    return NextResponse.json(
      { error: "Document text is required" },
      { status: 400 }
    );
  }
  if (!question && mode === "ask") {
    return NextResponse.json(
      { error: "Question is required" },
      { status: 400 }
    );
  }

  const provider = resolveProvider(providerId);
  if (!provider.apiKey) {
    return NextResponse.json(
      {
        error:
          "No AI provider configured. Add XAI_API_KEY, OPENAI_API_KEY, and/or GEMINI_API_KEY.",
      },
      { status: 503 }
    );
  }

  const modeInstructions: Record<string, string> = {
    ask: "Answer using ONLY the document. If not found, say so. Do not invent facts.",
    summarize: "Write a clear structured summary with bullet key points.",
    edit: "Apply the user's edit instructions to the document. Prefer outputting the revised text.",
    notes: "Extract important notes and takeaways as a clean bullet list.",
    quiz: "Generate 5 quiz questions with answers based only on the document.",
  };

  const system = `You are Nexora Document AI. ${modeInstructions[mode] || modeInstructions.ask}`;
  const userContent =
    mode === "ask" || mode === "edit"
      ? `DOCUMENT:\n${document}\n\nUSER REQUEST:\n${question}`
      : `DOCUMENT:\n${document}\n\nTASK: ${mode}${question ? `\nEXTRA: ${question}` : ""}`;

  let usageId: string | undefined;
  try {
    const reservation = await reserveNexoraUsage(supabase, {
      credits: estimateNexoraCredits("document", document.length, mode),
      operation: "Document AI: " + mode,
      provider: providerId,
      model: provider.model,
      inputTokens: estimateTextTokens(document + question),
    });
    usageId = reservation.usage_id;
  } catch (e) {
    const err = e as Error & { status?: number; balance?: number; required?: number };
    return NextResponse.json({ error: err.message, balance: err.balance, required: err.required }, { status: err.status || 500 });
  }

  try {
    const answer = await chatCompletion(
      provider,
      [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      { temperature: mode === "ask" ? 0.2 : 0.4 }
    );
    if (usageId) await completeNexoraUsage(supabase, usageId, answer);
    return NextResponse.json({
      answer,
      provider: provider.id,
      model: provider.model,
      mode,
    });
  } catch (e) {
    if (usageId) await refundNexoraUsage(supabase, usageId);
    const msg = e instanceof Error ? e.message : "AI request failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
