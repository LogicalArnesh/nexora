"use client";

type MarkProps = { size?: number; priority?: boolean; className?: string };

export function NexoraMark({ size = 34, className = "" }: MarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Nexora"
      width={size}
      height={size}
      className={"shrink-0 rounded-xl object-cover ring-1 ring-white/10 " + className}
    />
  );
}

export function NexoraBrand({
  size = 34,
  subtitle = "TwoTany",
  className = "",
}: MarkProps & { subtitle?: string }) {
  return (
    <span className={"inline-flex min-w-0 items-center gap-2.5 " + className}>
      <NexoraMark size={size} />
      <span className="min-w-0 leading-tight text-left">
        <span className="block text-sm font-semibold tracking-tight text-foreground">Nexora</span>
        {subtitle ? (
          <span className="block text-[10px] tracking-[0.18em] uppercase text-violet-300/80">{subtitle}</span>
        ) : null}
      </span>
    </span>
  );
}
