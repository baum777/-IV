import { EvidenceIndicator, StatusPill, Timestamp } from "@/components/ui/primitives";
import type { DecisionStage } from "@/lib/types";

export function EvidenceTrail({ stages }: { stages: DecisionStage[] }) {
  return (
    <ol className="relative space-y-0 border-l border-border pl-0">
      {stages.map((stage, index) => (
        <li key={stage.id} className="relative pb-5 pl-6 last:pb-0">
          <span className="absolute -left-[5px] top-1.5 size-2.5 rounded-full border border-border bg-background" />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-brand-gold">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-sm text-text-primary">{stage.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <EvidenceIndicator state={stage.evidence_state} />
              <Timestamp value={stage.timestamp} />
            </div>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{stage.description}</p>
          {stage.payload && Object.keys(stage.payload).length ? (
            <pre className="mt-2 max-h-56 max-w-full overflow-auto rounded border border-border bg-surface p-3 font-mono text-[10px] leading-relaxed text-text-secondary">
              {JSON.stringify(stage.payload, null, 2)}
            </pre>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function DecisionStateBadge({ state }: { state: string }) {
  const normalized = state.toUpperCase();
  const tone =
    normalized === "PASSED" || normalized === "AUTHORIZED" || normalized === "SETTLED"
      ? "border-positive/40 text-positive"
      : normalized === "REJECTED" || normalized === "FAILED"
        ? "border-negative/40 text-negative"
        : "border-border text-text-muted";
  return <StatusPill tone={tone}>{state}</StatusPill>;
}
