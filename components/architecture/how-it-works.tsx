"use client";

import { useState } from "react";

const NODES = [
  {
    id: "observe",
    label: "OBSERVE",
    title: "Three intelligence streams",
    detail:
      "M01 observes on-chain market activity. M02 observes cultural narratives. M03 observes the economic condition of the system. Each instance produces structured evidence, not orders.",
    io: "Input: on-chain markets, cultural signals, own-token metrics. Output: candidate evidence.",
  },
  {
    id: "decide",
    label: "DECIDE",
    title: "M04 evaluates evidence",
    detail:
      "M04 receives the converged evidence set and proposes an action. It does not execute. The proposal is a structured, inspectable object.",
    io: "Input: M01, M02 and M03 evidence. Output: proposed action with rationale.",
  },
  {
    id: "authorize",
    label: "AUTHORIZE",
    title: "Deterministic policy gate",
    detail:
      "The authority layer checks deterministic policy: capital limits, position limits, risk rules and custody constraints. A proposal may be rejected regardless of model confidence.",
    io: "Input: proposed action. Output: PASS or REJECT with reason codes.",
  },
  {
    id: "execute",
    label: "EXECUTE",
    title: "Trading or treasury runtime",
    detail:
      "Only authorized actions reach execution. The public observatory never holds signing authority. Execution is recorded as a receipt and later reconciled.",
    io: "Input: authorized action. Output: execution receipt and position state.",
  },
  {
    id: "verify",
    label: "VERIFY",
    title: "Outcome reconciliation",
    detail:
      "Observed outcomes are compared with the proposed action. Discrepancies are recorded as evidence, not hidden.",
    io: "Input: execution receipt. Output: outcome record.",
  },
  {
    id: "learn",
    label: "LEARN",
    title: "Research and calibration",
    detail:
      "Research runs evaluate scanner and decision quality. Calibration candidates are proposed. No configuration is promoted without explicit qualification.",
    io: "Input: outcomes. Output: research findings and calibration candidates.",
  },
];

export function HowItWorks() {
  const [selected, setSelected] = useState(NODES[0].id);
  const active = NODES.find((node) => node.id === selected) ?? NODES[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 rounded border border-border bg-background p-4">
        <div className="flex flex-wrap items-center gap-2">
          {NODES.map((node, index) => (
            <div key={node.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelected(node.id)}
                className={`rounded border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                  selected === node.id
                    ? "border-brand-gold bg-surface-raised text-brand-gold"
                    : "border-border text-text-muted hover:border-border-strong hover:text-text-secondary"
                }`}
              >
                {node.label}
              </button>
              {index < NODES.length - 1 ? (
                <span aria-hidden className="text-text-muted">→</span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded border border-border bg-surface p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand-gold">{active.label}</p>
          <p className="mt-2 font-display text-base font-medium text-text-primary">{active.title}</p>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">{active.detail}</p>
          <p className="mt-3 border-t border-border pt-3 font-mono text-[10px] leading-relaxed text-text-muted">{active.io}</p>
        </div>
      </div>

      <aside className="rounded border border-border bg-surface p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Authority boundary</p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          M04 proposes actions. The deterministic authority layer determines whether a proposed action may execute.
          Model confidence is not a probability of profit.
        </p>
        <div className="mt-4 space-y-2 border-t border-border pt-4 font-mono text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Proposal</span>
            <span className="text-text-secondary">M04</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Authority</span>
            <span className="text-brand-gold">Policy Gate</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Execution</span>
            <span className="text-positive">Qualified only</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Feedback</span>
            <span className="text-text-secondary">Evidence</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
