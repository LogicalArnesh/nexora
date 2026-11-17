export type AIProviderId = "openrouter" | "xai" | "openai" | "gemini";

export type AIProviderConfig = {
  id: AIProviderId;
  label: string;
  model: string;
  baseUrl: string;
  apiKey: string | undefined;
  kind: "openai-compatible" | "gemini";
};

export const OPENROUTER_MODELS = [
  { id: "x-ai/grok-3-mini", label: "Grok 3 Mini" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek Chat" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
] as const;

export function getProvider(id: AIProviderId): AIProviderConfig {
  const providers: Record<AIProviderId, AIProviderConfig> = {
    openrouter: {
      id: "openrouter",
      label: "OpenRouter",
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      kind: "openai-compatible",
    },
    xai: {
      id: "xai",
      label: "Grok (xAI)",
      model: process.env.XAI_MODEL || "grok-3-mini",
      baseUrl: process.env.XAI_BASE_URL || "https://api.x.ai/v1",
      apiKey: process.env.XAI_API_KEY,
      kind: "openai-compatible",
    },
    openai: {
      id: "openai",
      label: "ChatGPT (OpenAI)",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY,
      kind: "openai-compatible",
    },
    gemini: {
      id: "gemini",
      label: "Gemini (Google)",
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      baseUrl:
        process.env.GEMINI_BASE_URL ||
        "https://generativelanguage.googleapis.com/v1beta",
      apiKey: process.env.GEMINI_API_KEY,
      kind: "gemini",
    },
  };
  return providers[id];
}

export function listConfiguredProviders(): AIProviderId[] {
  return (["openrouter", "xai", "openai", "gemini"] as AIProviderId[]).filter(
    (id) => Boolean(getProvider(id).apiKey)
  );
}

export function resolveProvider(preferred?: string): AIProviderConfig {
  const id = preferred as AIProviderId | undefined;
  if (id && getProvider(id).apiKey) return getProvider(id);
  for (const fallback of [
    "openrouter",
    "xai",
    "openai",
    "gemini",
  ] as AIProviderId[]) {
    const p = getProvider(fallback);
    if (p.apiKey) return p;
  }
  return getProvider("openrouter");
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chatCompletion(
  provider: AIProviderConfig,
  messages: ChatMessage[],
  opts?: { temperature?: number; modelOverride?: string }
): Promise<string> {
  if (!provider.apiKey) {
    throw new Error(
      `${provider.label} is not configured. Add the API key in Vercel and redeploy.`
    );
  }
  if (provider.kind === "gemini") {
    return geminiChat(provider, messages, opts?.temperature ?? 0.7);
  }
  return openaiCompatibleChat(
    provider,
    messages,
    opts?.temperature ?? 0.7,
    opts?.modelOverride
  );
}

export async function raceOpenRouterModels(
  promptMessages: ChatMessage[],
  modelIds: string[]
): Promise<{ reply: string; model: string }> {
  const provider = getProvider("openrouter");
  if (!provider.apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }
  const results = await Promise.allSettled(
    modelIds.map(async (model) => {
      const reply = await openaiCompatibleChat(
        provider,
        promptMessages,
        0.7,
        model
      );
      return { reply, model };
    })
  );
  for (const r of results) {
    if (r.status === "fulfilled" && r.value.reply) return r.value;
  }
  const err = results.find((r) => r.status === "rejected") as
    | PromiseRejectedResult
    | undefined;
  throw new Error(
    err?.reason instanceof Error
      ? err.reason.message
      : "All raced models failed."
  );
}

async function openaiCompatibleChat(
  provider: AIProviderConfig,
  messages: ChatMessage[],
  temperature: number,
  modelOverride?: string
): Promise<string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${provider.apiKey}`,
    "Content-Type": "application/json",
  };
  if (provider.id === "openrouter") {
    headers["HTTP-Referer"] =
      process.env.NEXT_PUBLIC_APP_URL || "https://nexora.app";
    headers["X-Title"] = "Nexora";
  }
  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: modelOverride || provider.model,
      messages,
      temperature,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `${provider.label} error (${res.status}): ${err.slice(0, 400)}`
    );
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response from the model.";
}

async function geminiChat(
  provider: AIProviderConfig,
  messages: ChatMessage[],
  temperature: number
): Promise<string> {
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const url = `${provider.baseUrl}/models/${provider.model}:generateContent?key=${provider.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: { temperature },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(
      `${provider.label} error (${res.status}): ${err.slice(0, 400)}`
    );
  }
  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text)
      .join("") || "No response from the model."
  );
}
