import { AppShell } from "@/components/layout/app-shell";
import { DocumentAiClient } from "@/components/tools/document-ai-client";
export const metadata = { title: "AI Documents" };
export default function AiPdfPage() {
  return <AppShell title="AI Documents"><div className="mx-auto max-w-4xl space-y-6 nexora-fade-up"><div><p className="text-sm text-muted-foreground">AI workspace</p><h1 className="text-2xl font-semibold">PDF assistant</h1><p className="mt-1 text-sm text-muted-foreground">Upload, summarize, question, and transform text from a PDF.</p></div><DocumentAiClient /></div></AppShell>;
}
