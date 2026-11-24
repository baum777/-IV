import { HowItWorks } from "@/components/architecture/how-it-works";

export function Architecture() {
  return (
    <section id="architecture" className="scroll-mt-28">
      <div className="border-b border-[var(--brand-stone)] pb-4">
        <p className="landing-eyebrow">Section III · How It Works</p>
        <h2 className="landing-display mt-2 text-3xl font-medium text-[var(--brand-ivory)]">
          FOUR INSTANCES. ONE DECISION PATH.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          Observe, decide, verify. M04 evaluates evidence and proposes action; the deterministic policy gate holds
          authority. The public observatory never holds execution authority.
        </p>
      </div>
      <div className="mt-6">
        <HowItWorks />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-muted)]">
        M04 authority is not execution authority. Model confidence is not a calibrated probability of profit.
      </p>
    </section>
  );
}
