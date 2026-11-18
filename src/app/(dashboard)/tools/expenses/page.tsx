"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function ExpensesPage() {
  const [transactions, setTransactions] = useState<
    Array<{ id: string; desc: string; amount: number; category: string; date: string }>
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nexora-expenses");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("General");

  const categories = ["General", "Food", "Travel", "Software", "Utilities", "Other"];

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  function addTransaction() {
    if (!desc.trim() || !amount.trim()) return;
    const transaction = {
      id: String(Date.now()),
      desc: desc.trim(),
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    };
    setTransactions((t) => [...t, transaction]);
    setDesc("");
    setAmount("");
    if (typeof window !== "undefined") {
      localStorage.setItem("nexora-expenses", JSON.stringify([...transactions, transaction]));
    }
  }

  function deleteTransaction(id: string) {
    setTransactions((t) => t.filter((tx) => tx.id !== id));
    if (typeof window !== "undefined") {
      localStorage.setItem("nexora-expenses", JSON.stringify(transactions.filter((tx) => tx.id !== id)));
    }
  }

  return (
    <AppShell title="Expenses">
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        {/* Summary Card */}
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-rose-500/10 to-orange-500/5 p-8">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Balance</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">
            ${total.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {transactions.length} transactions
          </p>
        </div>

        {/* Input Form */}
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 space-y-4">
          <label className="text-sm font-medium text-muted-foreground">Add Transaction</label>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description (e.g. Lunch)"
              className="col-span-2 rounded-xl border border-border/80 bg-background/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              step="0.01"
              className="rounded-xl border border-border/80 bg-background/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/60 text-muted-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={addTransaction}
            disabled={!desc.trim() || !amount.trim()}
            className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-45 hover:opacity-90 transition-all"
          >
            Add Transaction
          </button>
        </div>

        {/* Transactions List */}
        <div className="rounded-2xl border border-border/60 bg-card/40">
          <div className="p-4 border-b border-border/60">
            <h3 className="text-sm font-medium">Recent Transactions</h3>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {[...transactions]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 50)
                .map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 hover:bg-background/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.desc}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.date.slice(0, 10)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-destructive">-${tx.amount.toFixed(2)}</span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}