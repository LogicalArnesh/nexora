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
          "No AI provider configured. Add OPENROUTER_API_KEY (recommended), XAI_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY.",
      },
      { status: 503 }
    );
  }

  const modeInstructions: Record<string, string> = {
    a¶»§q«^