"use client";
import { useState } from "react";
import Image from "next/image";

type WeatherResult = {
  configured?: boolean;
  error?: string;
  current?: { name?: string; country?: string; temp?: number; feels_like?: number; humidity?: number; wind?: number; description?: string; icon?: string };
  forecast?: Array<{ dt_txt?: string; main?: { temp?: number }; weather?: Array<{ description?: string; icon?: string }> }>;
};
export function WeatherClient() {
  const [city, setCity] = useState("New Delhi");
  const [data, setData] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);
  async function search(event: React.FormEvent) {
    event.preventDefault();
    if (!city.trim()) return;
    setLoading(true); setData(null);
    try {
      const response = await fetch("/api/weather?city=" + encodeURIComponent(city.trim()), { signal: AbortSignal.timeout(15000) });
      const result = await response.json();
      setData(response.ok ? result : { error: result.error || "Weather could not be loaded." });
    } catch {
      setData({ error: "Weather request timed out. Please try again." });
    } finally { setLoading(false); }
  }
  return <div className="space-y-5">
    <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
      <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3" />
      <button disabled={load¶»§q«^