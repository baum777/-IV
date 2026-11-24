import Link from "next/link";

import { EmptyState, EvidenceIndicator, Panel, PanelHeader, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";

export const metadata = { title: "Research Observatory" };

export default async function ResearchPage() {
  const snapshot = await getSnapshot();
  const research = snapshot.research;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="Research Observatory"
        title="Empirical Development"
        description="Research findings are labeled as reported or observed evidence. Disputed results are not published as validated ground truth."
        action={<StatusPill tone="border-border text-text-muted">Edge: {research.edge_status}</StatusPill>}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Panel>
          <PanelHeader eyebrow="Research runs" title="Published Runs" />
          {research.runs.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No research run was observed." description="Research runs are published from archived artifacts only." />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {research.runs.map((run) => (
                <Link key={run.id} href={`/research/${run.id}`} className="block px-4 py-3 hover:bg-surface-hover">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-text-primary">{run.id}</span>
                    <EvidenceIndicator state={run.evidence_state} />
                  </div>
                  <p className="mt-1 font-display text-sm text-text-primary">{run.title}</p>
                  <p className="mt-1 text-[11px] text-text-secondary">{run.findings[0] ?? "No finding recorded."}</p>
                  <p className="mt-1 font-mono text-[9px] text-text-muted">
                    {run.category} · {run.sample_size ?? "—"} samples · {run.configuration_version}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel>
            <PanelHeader eyebrow="Calibration" title="Configuration States" />
            <div className="divide-y divide-border">
              {research.calibration.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-text-muted">No calibration state observed.</p>
              ) : (
                research.calibration.map((item) => (
                  <div key={item.id} className="px-4 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-text-primary">{item.id}</span>
                      <StatusPill tone="border-border text-text-muted">{item.state}</StatusPill>
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">{item.note}</p>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Qualification boundary</p>
            <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">
              Trading edge not validated. Calibration candidates are not promoted to active configuration without
              empirical qualification. Historical figures are archived evidence, not current runtime statistics.
            </p>
          </Panel>
        </div>
      </div>

      <Panel className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Categories</p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          Quantitative Market Research · Memetic Research · Scanner Calibration · Decision Model Qualification ·
          Strategy Evaluation · Research Economics · Cross-Agent Ablation.
        </p>
      </Panel>
    </div>
  );
}
