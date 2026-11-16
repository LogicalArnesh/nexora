export type AIProviderId = "xai" | "openai" | "gemini";

export type AIProviderConfig = {
  id: AIProviderId;
  label: string;
  model: string;
  baseUrl: string;
  apiKey: string | undefined;
  kind: "openai-compatible" | "gemini";
};

export function getProvider(id: AIProviderId): AIProviderConfig {
  const providers: Record<AIProviderId, AIProviderConfig> = {
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
  return (["xai", "openai", "gemini"] as AIProviderId[]).filter((id) =>
    Boolean(getProvider(id).apiKey)
  );
}

export function resolveProvider(preferred?: string): AIProviderConfig {
  const id = preferred as AIProviderId | undefined;
  if (id && getProvider(id).apiKey) return getProvider(id);
  for (const fallback of ["xai", "openai", "gemini"] as AIProviderId[]) {
    const p = getProvider(fallback);
    if (p.apiKey) return p;
  }
  return getProvider("xai");
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chatCompletion(
  provider: AIProviderConfig,
  messages: ChatMessage[],
  opts?: { temperature?: number }
): Promise<string> {
  if (!provider.apiKey) {
    throw new Error(
      `${provider.label} is not configured. Add the API key in Vercel environment variables and redeploy.`
    );
  }
  if (provider.kind === "gemini") {
    return geminiChat(provider, messages, opts?.temperature ?? 0.7);
  }
  return openaiCompatibleChat(provider, messages, opts?.temperature ?? 0.7);
}

async function openaiCompatibleChat(
  provider: AIProviderConfig,
  messages: ChatMessage[],
  temperature: number
): Promise<string> {
  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
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
