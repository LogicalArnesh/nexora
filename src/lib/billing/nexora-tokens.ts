import type { SupabaseClient } from "@supabase/supabase-js";

export function estimateNexoraCredits(operation: "chat" | "document", inputChars: number, mode = "single") {
  if (operation === "document") return 100;
  if (mode === "race") return 100;
  if (inputChars <= 4_000) return 10;
  if (inputChars <= 24_000) return 25;
  return 60;
}

export function estimateTextTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

export async function reserveNexoraUsage(
  supabase: SupabaseClient,
  args: { credits: number; operation: string; provider?: string; model?: string; inputTokens: number }
) {
  const { data, error } = await supabase.rpc("consume_nexora_tokens", {
    p_credits: args.credits,
    p_operation: args.operation,
    p_provider: args.provider ?? null,
    p_model: args.model ?? null,
    p_input_tokens: args.inputTokens,
  });
  if (error) throw new Error(error.message);
  const result = data as { allowed?: boolean; usage_id?: string; balance?: number; unlimited?: boolean; required?: number };
  if (!result?.allowed || !result.usage_id) {
    const err = new Error("You have run out of Nexora Tokens. Please wait for your next allocation or contact an administrator.");
    Object.assign(err, { status: 402, balance: result?.balance ?? 0, required: result?.required ?? args.credits });
    throw err;
  }
  return result;
}

export async function completeNexoraUsage(supabase: SupabaseClient, usageId: string, outputText: string) {
  const { error } = await supabase.rpc("complete_nexora_usage", {
    p_usage_id: usageId,
    p_output_tokens: estimateTextTokens(outputText),
    p_estimated_cost_usd: 0,
  });
  if (error) console.error("Nexora usage completion failed", error.message);
}

export async function refundNexoraUsage(supabase: SupabaseClient, usageId: string) {
  const { error } = await supabase.rpc("refund_nexora_tokens", { p_usage_id: usageId });
  if (error) console.error("Nexora usage refund failed", error.message);
}
