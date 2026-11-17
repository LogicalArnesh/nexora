export default function Loading() {
  return (
    <main className="nexora-loading-screen" role="status" aria-live="polite" aria-label="Loading Nexora">
      <div className="nexora-loading-mark">N</div>
      <div className="nexora-loading-wordmark">Nexora</div>
      <div className="nexora-loading-track"><span /></div>
      <p>Preparing your workspace…</p>
      <span className="sr-only">If this takes too long, the page will show an error with a retry option.</span>
    </main>
  );
}
