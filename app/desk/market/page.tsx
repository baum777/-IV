import { CandidateTable } from "@/components/market/candidate-table";
import { ScannerGrid } from "@/components/market/scanner-grid";
import { Panel, PanelHeader, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";

export const metadata = { title: "M01 Market Intelligence" };

export default async function MarketPage() {
  const snapshot = await getSnapshot();
  const qualified = snapshot.market.candidates.filter((candidate) => candidate.decision_status === "BUY_CANDIDATE").length;
  const rejected = snapshot.market.candidates.filter((candidate) => candidate.decision_status === "REJECT").length;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="M01 — The Scout"
        title="Market Intelligence"
        description="On-chain market discovery. Candidate evidence is published without identifying tokens by ticker alone."
        action={<StatusPill tone="border-border text-text-muted">{snapshot.market.activation}</StatusPill>}
      />

      <div className="grid gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-3">
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Observed candidates</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{snapshot.market.candidates.length}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Qualified</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{qualified}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Rejected</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{rejected}</p>
        </div>
      </div>

      <Panel>
        <PanelHeader eyebrow="Scanner families" title="Scanner Grid" />
        <div className="p-3">
          <ScannerGrid scanners={snapshot.market.scanners} />
        </div>
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Candidate evidence" title="Candidate Table" />
        <CandidateTable candidates={snapshot.market.candidates} />
      </Panel>

      <Panel className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Candidate detail</p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          Candidate detail views are available from the candidate table in connected mode. This archived snapshot does
          not include per-candidate orderflow, wallet intelligence or developer intelligence. Those fields remain
          explicitly unavailable rather than fabricated.
        </p>
      </Panel>
    </div>
  );
}
