import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { createExpense } from "@/lib/tools/workspace";

export const metadata = { title: "Expenses" };
const fmt = (n: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(n || 0);
  } catch {
    return (currency || "???") + " " + new Intl.NumberFormat("en-IN").format(n || 0);
  }
};

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: rows }, { status }] = await Promise.all([
    supabase.from("expenses").select("id,type,amount,currency,category,description,date").eq("user_id", user.id).order("date", { ascending: false }).limit(200),
    searchParams,
  ]);
  const items = rows || [];
  const currencyTotals = new Map<string, { income: number; expenses: number }>();
  for (const item of items) {
    const currency = item.currency || "INR";
    const total = currencyTotals.get(currency) || { income: 0, expenses: 0 };
    if (item.type === "income") total.income += Number(item.amount);
    else total.expenses += Number(item.amount);
    currencyTotals.set(currency, total);
  }
  if (!currencyTotals.size) currencyTotals.set("INR", { income: 0, expense¶»§q«^