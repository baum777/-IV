import Link from "next/link";

import { EmptyState, EvidenceIndicator, Panel, PanelHeader, SectionHeading, StatusPill, Timestamp } from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";

export const metadata = { title: "M04 Decision Intelligence" };

export default async function DecisionsPage() {
  const snapshot = await getSnapshot();
  const trading = snapshot.decisions.filter((decision) => decision.domain === "TRADING");
  const treasury = snapshot.decisions.filter((decision) => decision.domain === "TREASURY");

  const renderGroup = (title: string, eyebrow: string, decisions: typeof snapshot.decisions) => (
    <Panel>
      <PanelHeader eyebrow={eyebrow} title={title} action={<StatusPill tone="border-border text-text-muted">{decisions.length}</StatusPill>} />
      {decisions.length === 0 ? (
        <div className="p-4">
          <EmptyState title="No decision in this domain." description="Rejected and abstained decisions are included when they are observed." />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {decisions.slice().reverse().map((decision) => (
            <Link key={decision.id} href={`/explorer/${decision.id}`} className="block px-4 py-3 hover:bg-surface-hover">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-text-primary">{decision.id}</span>
                  <StatusPill tone="border-border text-text-muted">{decision.proposed_action}</StatusPill>
                </div>
                <EvidenceIndicator state={decision.policy_verdict === "PASSED" ? "OBSERVED" : "INFERRED"} />
              </div>
              <p className="mt-1 truncate text-[11px] text-text-secondary">{decision.summary}</p>
              <dl className="mt-2 grid gap-x-4 gap-y-1 font-mono text-[9px] text-text-muted sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex justify-between gap-2">
                  <dt>Model</dt>
                  <dd className="truncate text-text-secondary">{decision.model_identifier}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Routing</dt>
                  <dd className="truncate text-text-secondary">{decision.routing_reason ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Policy</dt>
                  <dd className="truncate text-text-secondary">{decision.policy_verdict}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Execution</dt>
                  <dd className="truncate text-text-secondary">{decision.execution_status}</dd>
                </div>
              </dl>
              <div className="mt-1">
                <Timestamp value={decision.timestamp} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Panel>
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="M04 — The Executor"
        title="Decision Intelligence"
        description="Model output, policy verdict and execution outcome are distinct. A proposal is not an execution."
      />
      <div className="rounded border border-border bg-surface px-4 py-3">
        <p className="text-xs leading-relaxed text-text-secondary">
          Groundhog 1 and Bison 1 are distinct decision routes. Model confidence is not a calibrated probability of
          profitable execution. Rejected and abstained decisions are included.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {renderGroup("Trading Decisions", "TRADING", trading)}
        {renderGroup("Treasury Decisions", "TREASURY", treasury)}
      </div>
    </div>
  );
}
