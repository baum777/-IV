import Link from "next/link";

import { ExecutionModeIndicator, FreshnessIndicator, StatusPill } from "@/components/ui/primitives";
import { timestamp } from "@/lib/format";
import type { PublicSnapshot } from "@/lib/types";

export function SiteHeader({ snapshot }: { snapshot: PublicSnapshot }) {
  const generated = snapshot.generated_at;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative flex size-7 items-center justify-center border border-brand-gold/40">
            <span className="absolute inset-1 rotate-45 border border-brand-gold/50" />
            <span className="size-1.5 bg-brand-gold" />
          </span>
          <span className="font-display text-sm font-medium tracking-[0.28em] text-text-primary">TATD</span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted sm:inline">
            Public Observatory
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ExecutionModeIndicator mode={snapshot.execution_mode} />
          <span className="hidden md:inline-flex">
            <FreshnessIndicator state={snapshot.system.freshness} />
          </span>
          <StatusPill tone="border-border text-text-secondary">
            {snapshot.data_mode === "UNAVAILABLE" ? "RUNTIME NOT CONNECTED" : "ARCHIVED SNAPSHOT"}
          </StatusPill>
          <span className="hidden font-mono text-[10px] text-text-muted lg:inline">
            {timestamp(generated)}
          </span>
        </div>
      </div>
    </header>
  );
}
