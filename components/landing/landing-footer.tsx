import Link from "next/link";

import { timestamp } from "@/lib/format";
import type { PublicSnapshot } from "@/lib/types";

export function LandingFooter({ snapshot }: { snapshot: PublicSnapshot }) {
  const token = snapshot.ecosystem.own_token;

  return (
    <footer className="border-t border-[var(--brand-stone)] pt-8">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <p className="landing-display text-lg tracking-[0.28em] text-[var(--brand-ivory)]">THE FOURTH</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-alchemical)]">
            INTELLIGENCE MADE MATTER.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
            The memetic identity of TATD. TATD is the technical architecture; the public observatory is the evidence.
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Observatory</p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
            <li>
              <Link href="/desk" className="hover:text-[var(--brand-alchemical)]">
                Trading Desk
              </Link>
            </li>
            <li>
              <Link href="/explorer" className="hover:text-[var(--brand-alchemical)]">
                Decision Explorer
              </Link>
            </li>
            <li>
              <Link href="/research" className="hover:text-[var(--brand-alchemical)]">
                Research
              </Link>
            </li>
            <li>
              <Link href="/docs" className="hover:text-[var(--brand-alchemical)]">
                Living Whitepaper
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Economy</p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
            <li>
              <Link href="/economy" className="hover:text-[var(--brand-alchemical)]">
                Economic Observatory
              </Link>
            </li>
            <li>
              <Link href="/treasury" className="hover:text-[var(--brand-alchemical)]">
                Profit Treasury
              </Link>
            </li>
            <li>
              <Link href="/system" className="hover:text-[var(--brand-alchemical)]">
                System Status
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Status</p>
          <dl className="mt-2 space-y-1 text-xs text-[var(--text-muted)]">
            <div className="flex justify-between gap-2">
              <dt>Proposed ticker</dt>
              <dd className="text-[var(--brand-ivory)]">$IV</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Token launch</dt>
              <dd className="text-[var(--brand-ivory)]">{token.launch_state}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Contract</dt>
              <dd className="text-[var(--brand-ivory)]">{token.mint ? "Published" : "Not published"}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Snapshot</dt>
              <dd className="text-[var(--brand-ivory)]">{timestamp(snapshot.generated_at)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--brand-stone)] pt-4 font-mono text-[10px] text-[var(--text-muted)]">
        <p>Read-only. No wallet connection. No execution controls. Experimental system.</p>
        <p>Not financial advice. No guaranteed returns. Digital assets carry risk.</p>
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-alchemical)]">
        THE FOURTH MAKES IT REAL.
      </p>
    </footer>
  );
}
