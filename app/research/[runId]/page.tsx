import Link from "next/link";
import { notFound } from "next/navigation";

import { EvidenceIndicator, Panel, PanelHeader, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { findResearchRun, getSnapshot } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const snapshot = await getSnapshot();
  const run = findResearchRun(snapshot, runId);
  return { title: run ? `Research ${run.id}` : "Research run not found" };
}

export default async function ResearchRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const snapshot = await getSnapshot();
  const run = findResearchRun(snapshot, runId);
  if (!run) notFound();

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow={run.category}
        title={run.title}
        description={`Run ${run.id}`}
        action={<EvidenceIndicator state={run.evidence_state} />}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Panel>
            <PanelHeader eyebrow="Findings" title="Reported Results" />
            <ul className="divide-y divide-border">
              {run.findings.map((finding, index) => (
                <li key={index} className="px-4 py-3 text-[11px] leading-relaxed text-text-secondary">
                  {finding}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader eyebrow="Limitations" title="Known Constraints" />
            <ul className="divide-y divide-border">
              {run.limitations.length === 0 ? (
                <li className="px-4 py-3 text-[11px] text-text-muted">No limitation recorded in the artifact.</li>
              ) : (
                run.limitations.map((limitation, index) => (
                  <li key={index} className="px-4 py-3 text-[11px] leading-relaxed text-text-secondary">
                    {limitation}
                  </li>
                ))
              )}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader eyebrow="Quality gates" title="Gate Results" />
            <div className="divide-y divide-border">
              {run.quality_gates.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-text-muted">No quality gate recorded.</p>
              ) : (
                run.quality_gates.map((gate, index) => (
                  <div key={index} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <div>
                      <p className="font-mono text-[11px] text-text-primary">{gate.name}</p>
                      {gate.detail ? <p className="text-[10px] text-text-muted">{gate.detail}</p> : null}
                    </div>
                    <StatusPill tone="border-border text-text-muted">{gate.state ?? "UNKNOWN"}</StatusPill>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader eyebrow="Metadata" title="Run Record" />
            <dl className="divide-y divide-border">
              {[
                ["Run ID", run.id],
                ["Dataset", run.dataset],
                ["Observation period", run.observation_period],
                ["Sample size", run.sample_size ?? "—"],
                ["Configuration version", run.configuration_version],
                ["Evidence state", run.evidence_state],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <dt className="font-mono text-[10px] text-text-muted">{label}</dt>
                  <dd className="text-right font-mono text-[10px] text-text-secondary">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Reproduction</p>
            <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">{run.reproduction}</p>
          </Panel>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/research" className="font-mono text-[11px] text-brand-gold hover:underline">
          ← All research
        </Link>
        <Link href="/system" className="font-mono text-[11px] text-brand-gold hover:underline">
          Qualification status →
        </Link>
      </div>
    </div>
  );
}
