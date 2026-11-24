import { QualificationIndicator, StatusPill } from "@/components/ui/primitives";
import type { Scanner } from "@/lib/types";

export function ScannerGrid({ scanners }: { scanners: Scanner[] }) {
  if (!scanners.length) {
    return <p className="text-xs text-text-muted">No scanner configuration was observed.</p>;
  }
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {scanners.map((scanner) => (
        <div key={scanner.id} className="rounded border border-border bg-surface p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-brand-gold">{scanner.id}</span>
            <StatusPill tone="border-border text-text-muted">{scanner.activation}</StatusPill>
          </div>
          <p className="mt-1 font-display text-sm text-text-primary">{scanner.name}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{scanner.purpose}</p>
          <dl className="mt-2 space-y-1 font-mono text-[9px] text-text-muted">
            <div className="flex justify-between gap-2">
              <dt>Configuration</dt>
              <dd className="truncate text-text-secondary">{scanner.configuration_version}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Recent signals</dt>
              <dd className="text-text-secondary">{scanner.recent_signals ?? "—"}</dd>
            </div>
          </dl>
          <div className="mt-2 flex flex-wrap gap-1">
            {scanner.profiles.map((profile) => (
              <span key={profile.id} className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] text-text-muted">
                {profile.name}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <QualificationIndicator state={scanner.qualification} />
            <span className="font-mono text-[9px] text-text-muted">{scanner.missing_features.length} missing features</span>
          </div>
        </div>
      ))}
    </div>
  );
}
