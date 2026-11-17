import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  chatCompletion,
  listConfiguredProviders,
  raceOpenRouterModels,
  resolveProvider,
  OPENROUTER_MODELS,
  type AIProviderId,
} from "@/lib/ai/providers";

export async function GET() {
  const configured = listConfiguredProviders();
  return NextResponse.json({
    providers: configured,
    labels: {
      openrouter: "OpenRouter (multi-model)",
      xai: "Grok (xAI)",
      openai: "ChatGPT (OpenAI)",
      gemini: "Gemini (Google)",
    },
    openrouterModels: OPENROUTER_MODELS,
    hasOpenRouter: configured.includes("openrouter"),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  const conversationId = body.conversationId as string | undefined;
  const providerId = body.provider as AIProviderId | undefined;
  const mode = (body.mode as string) || "single";
  const modelOverride = body.model as string | undefined;

  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const configured = listConfiguredProviders();
  if (!configured.length) {
    return NextResponse.json(
      {
        error:
          "No AI provider configured. Add OPENROUTER_API_KEY (recommended) or XAI_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY in Vercel, then redeploy.",
        configured,
      },
      { status: 503 }
    );
  }

  let convId = conversationId;
  if (!convId) {
    const { data: conv, error } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: user.id,
        title: message.slice(0, 60),
        tool_context: "chat",
        model: mode === "race" ? "race" : providerId || "auto",
      })
      .select("id")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    convId = conv.id;
  }

  await supabase.from("ai_messages").insert({
    conversation_id: convId,
    role: "user",
    content: message,
  });

  const { data: history } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true })
    .limit(40);

  const messages = [
    {
      role: "system" as const,
      content:
        "You are Nexora AI, a professional assistant in the Nexora workspace. Be clear, accurate, and practical.",
    },
    ...(history || []).map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ];

  try {
    let reply: string;
    let usedModel = "";
    let usedProvider = "";

    if (mode === "race" && configured.includes("openrouter")) {
      const raceModels = OPENROUTER_MODELS.slice(0, 4).map((m) => m.id);
      const raced = await raceOpenRouterModels(messages, raceModels);
      reply = raced.reply;
      usedModel = raced.model;
      usedProvider = "openrouter";
    } else {
      const provider = resolveProvider(providerId);
      reply = await chatCompletion(provider, messages, {
        modelOverride:
          provider.id === "openrouter" ? modelOverride : undefined,
      });
      usedModel = modelOverride || provider.model;
      usedProvider = provider.id;
    }

    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: reply,
    });

    return NextResponse.json({
      conversationId: convId,
      reply,
      provider: usedProvider,
      model: usedModel,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI request failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }
  await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
