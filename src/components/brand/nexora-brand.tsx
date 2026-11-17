"use client";

import Image from "next/image";

type MarkProps = { size?: number; priority?: boolean; className?: string };

export function NexoraMark({ size = 34, priority = false, className = "" }: MarkProps) {
  return (
    <Image
      src="/nexora-mark.webp"
      alt="Nexora orbital logo"
      width={size}
      height={size}
      sizes={size + "px"}
      priority={priority}
      className={"shrink-0 rounded-lg object-cover " + className}
    />
  );
}

export function NexoraBrand({ size = 34, subtitle = "TwoTany", priority = false, className = "" }: MarkProps & { subtitle?: string }) {
  return (
    <span className={"inline-flex min-w-0 items-center gap-2.5 " + className}>
      <NexoraMark size={size} priority={priority} />
      <span className="min-w-0 leading-tight text-left">
        <span className="block text-sm font-semibold tracking-tight text-foreground">Nexora</span>
        {subtitle ? <span className="block text-[10px] tracking-wide text-muted-foreground">{subtitle}</span> : null}
      </span>
    </span>
  );
}
