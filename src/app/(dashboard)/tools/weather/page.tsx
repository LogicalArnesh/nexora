"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

type WeatherData = {
  configured: boolean;
  current: {
    name: string;
    country: string;
    temp: number;
    feels_like: number;
    humidity: number;
    wind: number;
    visibility: number;
    description: string;
    icon: string;
  };
  forecast: any[];
  error?: string;
};

export default function WeatherPage() {
  const [city, setCity] = useState("London");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchWeather(targetCity: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(targetCity)}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to fetch weather");
        setData(null);
      } else {
        setData(json);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather(city);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setCity(query);
    fetchWeather(query);
  }

  return (
    <AppShell title="Weather">
      <div className="max-w-4xl mx-auto space-y-6">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city (e.g. Tokyo, New York)..."
            className="flex-1 rounded-xl border border-border/80 bg-card/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/25"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? "..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive nexora-fade-up">
            {error}
          </div>
        )}

        {data?.configured === false && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-500 nexora-fade-up">
            OPENWEATHER_API_KEY is not configured. Add it to your environment variables.
          </div>
        )}

        {data?.current && (
          <div className="grid gap-6 md:grid-cols-3 nexora-fade-up">
            {/* Current Weather Card */}
            <div className="md:col-span-2 rounded-2xl border border-border/60 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">{data.current.name}</h2>
                  <p className="text-muted-foreground">{data.current.country}</p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold tracking-tighter">
                    {Math.round(data.current.temp)}°C
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {data.current.description}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Feels Like</p>
                  <p className="text-sm font-medium">{Math.round(data.current.feels_like)}°C</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Humidity</p>
                  <p className="text-sm font-medium">{data.current.humidity}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Wind</p>
                  <p className="text-sm font-medium">{data.current.wind} m/s</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Visibility</p>
                  <p className="text-sm font-medium">{(data.current.visibility / 1000).toFixed(1)} km</p>
                </div>
              </div>
            </div>

            {/* Weather Icon/Extra info */}
            <div className="rounded-2xl border border-border/60 bg-card/40 p-8 flex flex-col items-center justify-center text-center">
              <img
                src={`https://openweathermap.org/img/wn/${data.current.icon}@4x.png`}
                alt={data.current.description}
                className="w-32 h-32"
              />
              <p className="mt-2 text-lg font-medium capitalize">{data.current.description}</p>
            </div>

            {/* Forecast */}
            {data.forecast && data.forecast.length > 0 && (
              <div className="md:col-span-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">24-Hour Forecast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {data.forecast.map((item: any, i: number) => (
                    <div key={i} className="rounded-xl border border-border/50 bg-card/30 p-3 text-center space-y-2">
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                        alt="icon"
                        className="w-8 h-8 mx-auto"
                      />
                      <p className="text-sm font-bold">{Math.round(item.main.temp)}°</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!data && !loading && !error && (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">Search for a city to see weather data.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
