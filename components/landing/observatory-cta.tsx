import Link from "next/link";

import { ExecutionModeIndicator, FreshnessIndicator } from "@/components/ui/primitives";
import type { PublicSnapshot } from "@/lib/types";

const LINKS = [
  { href: "/desk", label: "Observatory" },
  { href: "/explorer", label: "Decision Explorer" },
  { href: "/research", label: "Research" },
  { href: "/economy", label: "Economy" },
  { href: "/system", label: "System Status" },
] as const;

export function ObservatoryCTA({ snapshot }: { snapshot: PublicSnapshot }) {
  return (
    <section className="landing-hero-glow rounded border border-[var(--brand-stone)] p-6 sm:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <ExecutionModeIndicator mode={snapshot.execution_mode} />
        <FreshnessIndicator state={snapshot.system.freshness} />
      </div>
      <h2 className="landing-display mt-4 text-2xl font-medium text-[var(--brand-ivory)] sm:text-3xl">
        THE MYTH IS THE INVITATION.
        <br />
        THE MACHINE IS THE SUBSTANCE.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
        The evidence is the proof. The public observatory is read-only. No wallet connection is required and no
        execution controls are exposed.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/desk"
          className="rounded border border-[var(--brand-alchemical)] bg-[var(--brand-alchemical)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#0B0B0C] transition-opacity hover:opacity-90"
        >
          Explore the Observatory
        </Link>
        {LINKS.slice(1).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded border border-[var(--brand-stone)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--brand-ivory)] transition-colors hover:border-[var(--brand-alchemical)]"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
