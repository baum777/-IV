import { NarrativeRadar } from "@/components/memetic/narrative-radar";
import { ScannerGrid } from "@/components/market/scanner-grid";
import { EmptyState, Panel, PanelHeader, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";

export const metadata = { title: "M02 Narrative Observatory" };

export default async function MemeticPage() {
  const snapshot = await getSnapshot();
  const narrative = snapshot.memetic.narratives[0];

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="M02 — The Mind"
        title="Narrative Observatory"
        description="Cultural and narrative intelligence. Narrative clusters are published only where observed evidence exists."
        action={<StatusPill tone="border-border text-text-muted">SHADOW</StatusPill>}
      />

      <Panel>
        <PanelHeader eyebrow="Narrative radar" title="Observed Narrative Clusters" />
        <div className="p-3">
          <NarrativeRadar narratives={snapshot.memetic.narratives} />
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <PanelHeader eyebrow="Narrative profile" title={narrative?.canonical ?? "No narrative profile"} />
          {narrative ? (
            <dl className="grid gap-px bg-border sm:grid-cols-2">
              {[
                ["Taxonomy", narrative.taxonomy],
                ["Lifecycle", narrative.lifecycle],
                ["Memetic score", narrative.memetic_score ?? "—"],
                ["Score bounds", narrative.score_bounds ?? "—"],
                ["Evidence coverage", narrative.evidence_coverage ?? "—"],
                ["Attention integrity", narrative.attention_integrity ?? "—"],
                ["Saturation risk", narrative.saturation_risk ?? "—"],
                ["Related mints", narrative.related_mints.length],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-surface px-4 py-2.5">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">{label}</dt>
                  <dd className="mt-0.5 font-mono text-[11px] text-text-primary">{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="p-4">
              <EmptyState
                title="No narrative profile was observed."
                description="M02 publishes narrative profiles only when cultural evidence is available."
              />
            </div>
          )}
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Provider attribution" title="Cultural Data Providers" />
          <div className="divide-y divide-border">
            {snapshot.memetic.providers.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-text-muted">No cultural provider capability was observed.</p>
            ) : (
              snapshot.memetic.providers.map((provider) => (
                <div key={provider.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="font-mono text-[11px] text-text-primary">{provider.id}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-text-muted">{provider.note}</p>
                  </div>
                  <StatusPill tone="border-border text-text-muted">{provider.state}</StatusPill>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader eyebrow="Memetic scanner families" title="Memetic Scanner Grid" />
        <div className="p-3">
          <ScannerGrid scanners={snapshot.memetic.scanners} />
        </div>
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Momentum comparison" title="Cultural / Memetic / Financial Momentum" />
        <div className="p-4">
          <EmptyState
            title="No comparable momentum series was observed."
            description="Momentum comparison requires three compatible observation windows. The observatory does not interpolate missing evidence as if it were observed data."
          />
        </div>
      </Panel>
    </div>
  );
}
