import Link from "next/link";

const METAPHORS = [
  { metaphor: "Perception", system: "Market, memetic and economic inputs", href: "/desk" },
  { metaphor: "Nervous system", system: "Four-agent decision path", href: "/desk" },
  { metaphor: "Memory", system: "Public projection and evidence trail", href: "/explorer" },
  { metaphor: "Metabolism", system: "Creator-fee and treasury accounting", href: "/economy" },
  { metaphor: "Homeostasis", system: "Policy gate and deterministic controls", href: "/docs" },
  { metaphor: "Body", system: "Paper trading runtime", href: "/desk" },
  { metaphor: "Immune response", system: "Qualification and freshness checks", href: "/system" },
] as const;

export function LivingMachine() {
  return (
    <section id="living-machine" className="scroll-mt-28">
      <div className="border-b border-[var(--brand-stone)] pb-4">
        <p className="landing-eyebrow">Section V · The Living Machine</p>
        <h2 className="landing-display mt-2 text-3xl font-medium text-[var(--brand-ivory)]">
          A SYSTEM WITH A BODY.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          The metaphor is a reading aid, not a claim of consciousness. Every organ maps to a public, inspectable
          mechanism.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded border border-[var(--brand-stone)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--brand-stone)] font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <th className="px-4 py-3 font-normal">Metaphor</th>
              <th className="px-4 py-3 font-normal">Public mechanism</th>
              <th className="px-4 py-3 text-right font-normal">Observe</th>
            </tr>
          </thead>
          <tbody>
            {METAPHORS.map((row) => (
              <tr key={row.metaphor} className="border-b border-[var(--brand-stone)] last:border-b-0">
                <td className="px-4 py-3 font-display text-sm text-[var(--brand-ivory)]">{row.metaphor}</td>
                <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{row.system}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={row.href}
                    className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--brand-alchemical)] hover:underline"
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
        No consciousness, sentience or autonomous intent is claimed. The system executes deterministic policy over
        recorded evidence.
      </p>
    </section>
  );
}
