import Link from "next/link";

import { usd } from "@/lib/format";
import type { PublicSnapshot } from "@/lib/types";

const TREASURY_CATEGORIES = [
  "Buyback & Burn",
  "Buyback & Liquidity",
  "Buyback & Holder Airdrop",
  "Hold Reserve",
] as const;

export function Metabolism({ snapshot }: { snapshot: PublicSnapshot }) {
  const economy = snapshot.economy;
  const fee = economy.fee_policy;
  const transfers = economy.transfers.length;
  const operating = economy.wallets.filter((wallet) => wallet.id !== "W00");

  return (
    <section id="metabolism" className="scroll-mt-28">
      <div className="border-b border-[var(--brand-stone)] pb-4">
        <p className="landing-eyebrow">Section IV · The Metabolism</p>
        <h2 className="landing-display mt-2 text-3xl font-medium text-[var(--brand-ivory)]">
          A MEME WITH METABOLISM.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          The token funds the entity. Creator fees are split 20:80 between the developer wallet and the operating
          wallet. Configured allocations and observed capital flows are displayed separately.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded border border-[var(--brand-stone)] bg-[#0B0B0C]/60 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-alchemical)]">
            Configured fee split
          </p>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full border border-[var(--brand-stone)]">
            <div className="bg-[var(--brand-alchemical)]" style={{ width: `${fee.creator_dev_pct}%` }} />
            <div className="bg-[#508FCF]" style={{ width: `${fee.creator_operating_pct}%` }} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[var(--brand-ivory)]">
            <span>W00 Developer · {fee.creator_dev_pct}%</span>
            <span>W01 Operating · {fee.creator_operating_pct}%</span>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-[var(--text-muted)]">{fee.note}</p>

          <dl className="mt-5 space-y-1.5 border-t border-[var(--brand-stone)] pt-3 font-mono text-[11px]">
            {economy.allocation.map((entry) => (
              <div key={entry.wallet} className="flex items-center justify-between gap-2">
                <dt className="text-[var(--text-muted)]">
                  {entry.wallet} · {entry.domain}
                </dt>
                <dd className="text-[var(--brand-ivory)]">{entry.pct}%</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-[10px] leading-relaxed text-[var(--text-muted)]">
            Observed transfers in this snapshot: {transfers}. Configured policy is not a settlement record.
          </p>
        </div>

        <div className="rounded border border-[var(--brand-stone)] bg-[#0B0B0C]/60 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-alchemical)]">
            Operating architecture
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--brand-ivory)]">
            <li>W01 · Trading Capital</li>
            <li>W01B · Intelligence Funding</li>
            <li>W01C · Operational Funding · x402</li>
            <li>W02 · Profit Treasury</li>
          </ul>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-alchemical)]">
            Permitted treasury categories
          </p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--text-muted)]">
            {TREASURY_CATEGORIES.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>

          <p className="mt-4 text-[11px] leading-relaxed text-[var(--text-muted)]">
            Positive realized net trading profits are routed to W02. No completed settlement is claimed in this
            snapshot.
          </p>

          <dl className="mt-4 space-y-1.5 border-t border-[var(--brand-stone)] pt-3 font-mono text-[11px]">
            {operating.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between gap-2">
                <dt className="text-[var(--text-muted)]">
                  {wallet.id} · {wallet.role}
                </dt>
                <dd className="text-[var(--brand-ivory)]">{usd(wallet.balance_cents)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
        <Link href="/economy" className="text-[var(--brand-alchemical)] hover:underline">
          Economic Observatory →
        </Link>
        <Link href="/treasury" className="text-[var(--brand-alchemical)] hover:underline">
          Profit Treasury →
        </Link>
      </div>
    </section>
  );
}
