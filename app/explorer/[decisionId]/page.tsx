import Link from "next/link";
import { notFound } from "next/navigation";

import { DecisionStateBadge, EvidenceTrail } from "@/components/evidence/evidence-trail";
import { Panel, PanelHeader, SectionHeading, StatusPill, Timestamp } from "@/components/ui/primitives";
import { findDecision, getSnapshot } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ decisionId: string }> }) {
  const { decisionId } = await params;
  const snapshot = await getSnapshot();
  const decision = findDecision(snapshot, decisionId);
  return { title: decision ? `Decision ${decision.id}` : "Decision not found" };
}

export default async function DecisionExplorerPage({ params }: { params: Promise<{ decisionId: string }> }) {
  const { decisionId } = await params;
  const snapshot = await getSnapshot();
  const decision = findDecision(snapshot, decisionId);
  if (!decision) notFound();

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow={`${decision.domain} decision`}
        title={decision.id}
        description={decision.summary}
        action={<DecisionStateBadge state={decision.policy_verdict} />}
      />

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel className="min-w-0">
          <PanelHeader eyebrow="Evidence trail" title="Discovery → Outcome" />
          <div className="p-4">
            <EvidenceTrail stages={decision.stages} />
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader eyebrow="Decision record" title="Structured Fields" />
            <dl className="divide-y divide-border">
              {[
                ["Decision ID", decision.id],
                ["Domain", decision.domain],
                ["Timestamp", <Timestamp key="ts" value={decision.timestamp} />],
                ["Model identifier", decision.model_identifier],
                ["Routing reason", decision.routing_reason],
                ["Proposed action", decision.proposed_action],
                ["Policy verdict", decision.policy_verdict],
                ["Execution status", decision.execution_status],
                ["Outcome", decision.outcome],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <dt className="font-mono text-[10px] text-text-muted">{label}</dt>
                  <dd className="text-right font-mono text-[10px] text-text-secondary">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel>
            <PanelHeader eyebrow="Structured response" title="Model Output" />
            <pre className="max-h-72 max-w-full overflow-auto p-4 font-mono text-[10px] leading-relaxed text-text-secondary">
              {JSON.stringify(decision.structured_response, null, 2)}
            </pre>
          </Panel>

          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Boundary</p>
            <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">
              This explorer publishes structured model outputs and evidence-based summaries. Internal chain-of-thought,
              private system prompts, credentials and unrestricted raw model inputs are not published. A proposal is not
              an execution.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill tone="border-border text-text-muted">PROPOSED</StatusPill>
              <StatusPill tone="border-border text-text-muted">EVALUATED</StatusPill>
              <StatusPill tone="border-border text-text-muted">AUTHORIZED</StatusPill>
              <StatusPill tone="border-border text-text-muted">REJECTED</StatusPill>
              <StatusPill tone="border-border text-text-muted">SETTLED</StatusPill>
            </div>
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/explorer" className="font-mono text-[11px] text-brand-gold hover:underline">
          ← All decisions
        </Link>
        <Link href="/desk/decisions" className="font-mono text-[11px] text-brand-gold hover:underline">
          Decision intelligence →
        </Link>
      </div>
    </div>
  );
}
