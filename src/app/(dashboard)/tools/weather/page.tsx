import { AppShell } from "@/components/layout/app-shell";
import { WeatherClient } from "@/components/tools/weather-client";
export const metadata = { title: "Weather" };
export default function WeatherPage() {
  return <AppShell title="Weather"><div className="mx-auto max-w-3xl space-y-5 nexora-fade-up"><div><p className="text-sm text-muted-foreground">Live conditions</p><h1 className="text-2xl font-semibold">Weather</h1><p className="mt-1 text-sm text-muted-foreground">Current conditions and a short forecast by city.</p></div><WeatherClient /><p className="text-xs text-muted-foreground">Weather data requires an OpenWeather API key configured by the app administrator.</p></div></AppShell>;
}
