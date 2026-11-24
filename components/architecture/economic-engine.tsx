"use client";

import { useState } from "react";

import { usd } from "@/lib/format";
import type { PublicSnapshot } from "@/lib/types";

const DOMAINS = [
  {
    id: "W00",
    label: "Developer",
    share: "20%",
    detail: "Developer wallet. Receives 20% of creator fees.",
    color: "#C4A36E",
  },
  {
    id: "W01",
    label: "Operating",
    share: "80%",
    detail: "Operating wallet. Receives 80% of creator fees and funds the system.",
    color: "#508FCF",
  },
  {
    id: "W01B",
    label: "Intelligence",
    share: "16%",
    detail: "Model-related expenditures through approved model providers.",
    color: "#A78BFA",
  },
  {
    id: "W01C",
    label: "Operational",
    share: "8%",
    detail: "Market, memetic and on-chain data provider expenditures.",
    color: "#36B5A0",
  },
  {
    id: "W02",
    label: "Profit Treasury",
    share: "residual",
    detail: "Positive realized net trading profits under the existing profit policy.",
    color: "#D5B477",
  },
];

export function EconomicEngine({ snapshot }: { snapshot: PublicSnapshot }) {
  const [selected, setSelected] = useState(DOMAINS[0].id);
  const active = DOMAINS.find((domain) => domain.id === selected) ?? DOMAINS[0];
  const wallet = snapshot.economy.wallets.find((item) => item.id === active.id);
  const observed = snapshot.economy.allocation_observed_cents ?? {};

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 rounded border border-border bg-background p-4">
        <div className="flex flex-wrap items-center gap-2">
          {DOMAINS.map((domain, index) => (
            <div key={domain.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelected(domain.id)}
                className={`rounded border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                  selected === domain.id
                    ? "border-brand-gold bg-surface-raised text-brand-gold"
                    : "border-border text-text-muted hover:border-border-strong hover:text-text-secondary"
                }`}
              >
                {domain.id} · {domain.label}
              </button>
              {index < DOMAINS.length - 1 ? <span aria-hidden className="text-text-muted">→</span> : null}
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded border border-border bg-surface p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Configured policy</p>
            <p className="mt-2 font-mono text-sm text-text-primary">20:80 creator fee split</p>
            <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
              W01 internal proposal: 70% trading, 20% intelligence, 10% operational.
            </p>
          </div>
          <div className="rounded border border-border bg-surface p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Observed allocation</p>
            <p className="mt-2 font-mono text-sm text-text-primary">
              {usd(observed.trading ?? null)} trading
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
              {usd(observed.intelligence ?? null)} intelligence · {usd(observed.operational ?? null)} operational
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded border border-border">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="bg-surface text-text-muted">
              <tr>
                <th className="px-3 py-2 font-normal">Wallet</th>
                <th className="px-3 py-2 font-normal">Role</th>
                <th className="px-3 py-2 text-right font-normal">Observed balance</th>
                <th className="px-3 py-2 text-right font-normal">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {snapshot.economy.wallets.map((item) => (
                <tr key={item.id} className="text-text-secondary">
                  <td className="px-3 py-2 text-text-primary">{item.id}</td>
                  <td className="px-3 py-2">{item.role}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{usd(item.balance_cents)}</td>
                  <td className="px-3 py-2 text-right text-text-muted">{item.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="rounded border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: active.color }}>
            {active.id}
          </span>
          <span className="font-mono text-[10px] text-text-muted">{active.share}</span>
        </div>
        <p className="mt-2 font-display text-base font-medium text-text-primary">{active.label}</p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">{active.detail}</p>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 font-mono text-[10px]">
          <div className="flex justify-between gap-2">
            <dt className="text-text-muted">Observed balance</dt>
            <dd className="text-right text-text-secondary">{wallet ? usd(wallet.balance_cents) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-text-muted">Address</dt>
            <dd className="text-right text-text-secondary">{wallet?.address ?? "MASKED"}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-text-muted">Evidence</dt>
            <dd className="text-right text-text-secondary">{wallet?.state ?? "UNKNOWN"}</dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-border pt-3 text-[10px] leading-relaxed text-text-muted">
          Configured allocations and observed transfers are shown separately. No double counting between reserved
          capital and prepaid provider balances.
        </p>
      </aside>
    </div>
  );
}
