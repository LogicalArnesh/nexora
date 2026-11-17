import { NexoraMark } from "@/components/brand/nexora-brand";

export default function Loading() {
  return (
    <main className="nexora-loading-screen" role="status" aria-live="polite" aria-label="Loading Nexora">
      <div className="nexora-loading-mark"><NexoraMark size={48} priority /></div>
      <div className="nexora-loading-wordmark">Nexora <span className="text-primary">TwoTany</span></div>
      <div className="nexora-loading-track"><span /></div>
      <p>Preparing your workspace…</p>
      <span className="sr-only">If this takes too long, the page will show an error with a retry option.</span>
    </main>
  );
}
