import Link from "next/link";

import { Monolith } from "@/components/landing/monolith";
import { ExecutionModeIndicator, FreshnessIndicator, StatusPill } from "@/components/ui/primitives";
import { timestamp } from "@/lib/format";
import type { PublicSnapshot } from "@/lib/types";

export function Hero({ snapshot }: { snapshot: PublicSnapshot }) {
  const token = snapshot.ecosystem.own_token;
  const launchState = token.launch_state || "UNKNOWN";
  const contract = token.mint ? token.mint : "Not published";

  return (
    <section className="landing-hero-glow relative">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="border-[var(--brand-stone)] text-[var(--brand-alchemical)]">THE FOURTH</StatusPill>
            <ExecutionModeIndicator mode={snapshot.execution_mode} />
            <FreshnessIndicator state={snapshot.system.freshness} />
          </div>

          <h1 className="landing-display mt-5 text-[2.65rem] font-medium leading-[0.95] text-[var(--brand-ivory)] sm:text-6xl">
            INTELLIGENCE
            <br />
            MADE MATTER.
          </h1>
          <p className="mt-4 font-display text-lg text-[var(--brand-ivory)]/80">Four instances. One entity.</p>
          <p className="landing-prose mt-3">
            A tokenized autonomous trading desk designed to observe, interpret, sustain and act.
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--brand-alchemical)]">
            THE FOURTH MAKES IT REAL.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/desk"
              className="rounded border border-[var(--brand-alchemical)] bg-[var(--brand-alchemical)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#0B0B0C] transition-opacity hover:opacity-90"
            >
              Explore the Observatory
            </Link>
            <Link
              href="#architecture"
              className="rounded border border-[var(--brand-stone)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--brand-ivory)] transition-colors hover:border-[var(--brand-alchemical)]"
            >
              Discover the Architecture
            </Link>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[var(--brand-stone)] pt-4 font-mono text-[11px] sm:grid-cols-4">
            <div>
              <dt className="text-[var(--text-muted)]">Proposed ticker</dt>
              <dd className="mt-0.5 text-[var(--brand-ivory)]">$IV</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Token launch</dt>
              <dd className="mt-0.5 text-[var(--brand-ivory)]">{launchState}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Contract</dt>
              <dd className="mt-0.5 truncate text-[var(--brand-ivory)]">{contract}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Snapshot</dt>
              <dd className="mt-0.5 text-[var(--brand-ivory)]">{timestamp(snapshot.generated_at)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-[var(--text-muted)]">
            Ticker and launch status are shown separately. No active contract address is published.
          </p>
        </div>

        <figure className="min-w-0">
          <Monolith className="mx-auto w-full max-w-[520px]" />
          <figcaption className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Symbolic artwork. Not runtime data.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
