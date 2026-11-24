import Link from "next/link";

import { EmptyState, EvidenceIndicator, Panel, PanelHeader, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";
import { timestamp } from "@/lib/format";

export const metadata = { title: "Decision and Evidence Explorer" };

export default async function ExplorerPage() {
  const snapshot = await getSnapshot();

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="Transparency"
        title="Decision & Evidence Explorer"
        description="Every published decision has a stable, directly linkable evidence trail."
        action={<StatusPill tone="border-border text-text-muted">{snapshot.decisions.length} decisions</StatusPill>}
      />

      <Panel>
        <PanelHeader eyebrow="Decision records" title="Published Decisions" />
        {snapshot.decisions.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No decision was observed." description="The explorer lists decisions from the published snapshot only." />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {snapshot.decisions.slice().reverse().map((decision) => (
              <Link key={decision.id} href={`/explorer/${decision.id}`} className="block px-4 py-3 hover:bg-surface-hover">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-text-primary">{decision.id}</span>
                    <StatusPill tone="border-border text-text-muted">{decision.domain}</StatusPill>
                    <StatusPill tone="border-border text-text-muted">{decision.proposed_action}</StatusPill>
                  </div>
                  <EvidenceIndicator state={decision.policy_verdict === "PASSED" ? "OBSERVED" : "INFERRED"} />
                </div>
                <p className="mt-1 text-[11px] text-text-secondary">{decision.summary}</p>
                <p className="mt-1 font-mono text-[9px] text-text-muted">
                  {timestamp(decision.timestamp)} · {decision.model_identifier} · {decision.execution_status}
                </p>
              </Link>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
