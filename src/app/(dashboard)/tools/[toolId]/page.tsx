import { redirect } from "next/navigation";

const MAP: Record<string, string> = {
  "ai-chat": "/tools/ai-chat",
  "ai-pdf": "/tools/ai-pdf",
  notes: "/tools/notes",
  projects: "/tools/projects",
  resume: "/tools/resume",
  "url-shortener": "/tools/url-shortener",
  weather: "/tools/weather",
  expenses: "/tools/expenses",
};

export default async function ToolAliasPage({
  params,
}: {
  params: Promise<{ toolId: string }>;
}) {
  const { toolId } = await params;
  redirect(MAP[toolId] || "/explore");
}
