import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  chatCompletion,
  listConfiguredProviders,
  resolveProvider,
  type AIProviderId,
} from "@/lib/ai/providers";

export async function GET() {
  const configured = listConfiguredProviders();
  return NextResponse.json({
    providers: configured,
    labels: {
      xai: "Grok (xAI)",
      openai: "ChatGPT (OpenAI)",
      gemini: "Gemini (Google)",
    },
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

  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const provider = resolveProvider(providerId);
  if (!provider.apiKey) {
    return NextResponse.json(
      {
        error:
          "No AI provider configured. Add XAI_API_KEY, OPENAI_API_KEY, and/or GEMINI_API_KEY in Vercel / .env.local.",
        configured: listConfiguredProviders(),
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
        model: `${provider.id}:${provider.model}`,
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

  try {
    const reply = await chatCompletion(provider, [
      {
        role: "system",
        content:
          "You are Nexora AI, a helpful assistant inside the Nexora workspace. Be clear, practical, and useful. When helping with documents or tasks, do the work the user asks for.",
      },
      ...(history || []).map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ]);

    await supabase.from("ai_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: reply,
      metadata: { provider: provider.id, model: provider.model },
    });

    return NextResponse.json({
      conversationId: convId,
      reply,
      provider: provider.id,
      model: provider.model,
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
    return NextResponse.json(
      { error: "conversationId required" },
      { status: 400 }
    );
  }

  const { data: conv } = await supabase
    .from("ai_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await supabase
    .from("ai_messages")
    .delete()
    .eq("conversation_id", conversationId);
  await supabase.from("ai_conversations").delete().eq("id", conversationId);

  return NextResponse.json({ success: true, deleted: conversationId });
}
