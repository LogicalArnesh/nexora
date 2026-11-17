import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim();

  if (!city) {
    return NextResponse.json({ error: "City is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        error:
          "OPENWEATHER_API_KEY is not configured. Add it in Vercel environment variables.",
        configured: false,
      },
      { status: 503 }
    );
  }

  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${key}&units=metric`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(10000) }
    );
    if (!currentRes.ok) {
      const err = await currentRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || "City not found" },
        { status: currentRes.status }
      );
    }
    const current = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city
      )}&appid=${key}&units=¶»§q«^