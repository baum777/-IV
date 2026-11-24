import type { ReactNode } from "react";
import Link from "next/link";

import { EvidenceIndicator, ExecutionModeIndicator, FreshnessIndicator, StatusPill } from "@/components/ui/primitives";
import { timestamp, usd } from "@/lib/format";
import type { PublicSnapshot } from "@/lib/types";

function ReadModelCard({
  label,
  value,
  detail,
  footer,
  href,
  badge,
}: {
  label: string;
  value: ReactNode;
  detail: ReactNode;
  footer: string;
  href: string;
  badge: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded border border-[var(--brand-stone)] bg-[#0B0B0C]/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
        {badge}
      </div>
      <p className="mt-3 font-display text-lg text-[var(--brand-ivory)]">{value}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">{detail}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span className="font-mono text-[10px] text-[var(--text-muted)]">{footer}</span>
        <Link
          href={href}
          className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--brand-alchemical)] hover:underline"
        >
          Open →
        </Link>
      </div>
    </div>
  );
}

export function Proof({ snapshot }: { snapshot: PublicSnapshot }) {
  const implemented = snapshot.qualification.filter((row) => row.status === "IMPLEMENTED").length;
  const blocked = snapshot.qualification.filter((row) => row.status === "BLOCKED").length;
  const partial = snapshot.qualification.filter((row) => row.status === "PARTIAL").length;
  const unverified = snapshot.qualification.filter((row) => row.status === "UNVERIFIED").length;

  const latestAgent = snapshot.agents.reduce<string | null>((latest, agent) => {
    if (!agent.last_observed) return latest;
    if (!latest) return agent.last_observed;
    return agent.last_observed > latest ? agent.last_observed : latest;
  }, null);

  const latestQualification = snapshot.qualification.reduce<string | null>((latest, row) => {
    if (!row.last_observation) return latest;
    if (!latest) return row.last_observation;
    return row.last_observation > latest ? row.last_observation : latest;
  }, null);

  const candidate = snapshot.market.candidates[0];
  const decision = snapshot.decisions[0];
  const research = snapshot.research.runs[0];
  const transfer = snapshot.economy.transfers[0];
  const token = snapshot.ecosystem.own_token;

  return (
    <section id="evidence" className="scroll-mt-28">
      <div className="border-b border-[var(--brand-stone)] pb-4">
        <p className="landing-eyebrow">Section VI · Proof, Not Promises</p>
        <h2 className="landing-display mt-2 text-3xl font-medium text-[var(--brand-ivory)]">
          DON&apos;T TRUST THE NARRATIVE.
          <br />
          OBSERVE THE SYSTEM.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          These are the public read models behind the landing page. Missing observations are labelled unavailable rather
          than filled with invented activity.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ReadModelCard
          label="Agent Activity"
          badge={<FreshnessIndicator state={snapshot.system.freshness} />}
          value={`${snapshot.agents.length} instances`}
          detail={`${implemented} implemented · ${blocked} blocked qualification rows`}
          footer={latestAgent ? timestamp(latestAgent) : "UNAVAILABLE"}
          href="/desk"
        />

        <ReadModelCard
          label="Latest Market Observations"
          badge={<ExecutionModeIndicator mode={snapshot.execution_mode} />}
          value={`${snapshot.market.candidates.length} candidates`}
          detail={`${snapshot.market.scanners.length} scanners · activation ${snapshot.market.activation}`}
          footer={candidate?.observed_at ? timestamp(candidate.observed_at) : "UNAVAILABLE"}
          href="/desk/market"
        />

        <ReadModelCard
          label="Decision Records"
          badge={<ExecutionModeIndicator mode={snapshot.execution_mode} />}
          value={`${snapshot.decisions.length} records`}
          detail={decision ? `${decision.proposed_action} · ${decision.policy_verdict}` : "No decision records observed"}
          footer={decision?.timestamp ? timestamp(decision.timestamp) : "UNAVAILABLE"}
          href="/explorer"
        />

        <ReadModelCard
          label="Research Runs"
          badge={<EvidenceIndicator state={research?.evidence_state ?? "UNKNOWN"} />}
          value={`${snapshot.research.runs.length} runs`}
          detail={`Edge status: ${snapshot.research.edge_status}`}
          footer={research?.observation_period ?? "UNAVAILABLE"}
          href="/research"
        />

        <ReadModelCard
          label="Economic Flows"
          badge={<ExecutionModeIndicator mode={snapshot.execution_mode} />}
          value={`${snapshot.economy.transfers.length} observed transfers`}
          detail={`${snapshot.economy.wallets.length} wallets · fee split ${snapshot.economy.fee_policy.creator_dev_pct}:${snapshot.economy.fee_policy.creator_operating_pct}`}
          footer={transfer ? timestamp(transfer.timestamp) : "None observed"}
          href="/economy"
        />

        <ReadModelCard
          label="Provider Qualification"
          badge={<StatusPill tone="border-[var(--brand-stone)] text-[var(--text-muted)]">{snapshot.qualification.length} rows</StatusPill>}
          value={`${implemented} implemented · ${blocked} blocked`}
          detail={`${partial} partial · ${unverified} unverified`}
          footer={latestQualification ? timestamp(latestQualification) : "UNAVAILABLE"}
          href="/system"
        />

        <ReadModelCard
          label="Funding Status"
          badge={<StatusPill tone="border-[var(--brand-stone)] text-[var(--text-muted)]">{token.launch_state}</StatusPill>}
          value={token.mint ? "Contract published" : "No contract published"}
          detail={`Creator fees observed: ${usd(token.creator_fees)}`}
          footer={timestamp(snapshot.generated_at)}
          href="/treasury"
        />
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-[var(--text-muted)]">
        Snapshot {snapshot.snapshot_id.slice(0, 12)} · generated {timestamp(snapshot.generated_at)}. Research figures are
        archived evidence, not live runtime statistics. No fabricated activity counters or artificial live feed.
      </p>
    </section>
  );
}
