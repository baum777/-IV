import { Panel, PanelHeader, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";
import { relative } from "@/lib/format";

export const metadata = { title: "System Status and Qualification" };

const STATUS_TONE: Record<string, string> = {
  IMPLEMENTED: "border-positive/40 text-positive",
  UNIT_TESTED: "border-positive/40 text-positive",
  INTEGRATION_TESTED: "border-positive/40 text-positive",
  DOCUMENTATION_VERIFIED: "border-positive/40 text-positive",
  PROVIDER_VERIFIED: "border-positive/40 text-positive",
  EMPIRICALLY_QUALIFIED: "border-positive/40 text-positive",
  PARTIAL: "border-warning/40 text-warning",
  BLOCKED: "border-negative/40 text-negative",
  FAILED: "border-negative/40 text-negative",
  UNVERIFIED: "border-unknown/40 text-unknown",
};

export default async function SystemPage() {
  const snapshot = await getSnapshot();
  const system = snapshot.system;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="System Status"
        title="Runtime and Provider Qualification"
        description="Technical implementation and empirical qualification are independent. Sensitive infrastructure information is redacted."
        action={<StatusPill tone="border-border text-text-muted">{system.qualification_state}</StatusPill>}
      />

      <div className="grid gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Mode</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{system.mode}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Runtime</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{system.runtime_state}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Freshness</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{system.freshness}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Last observation</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{relative(system.last_observation)}</p>
        </div>
      </div>

      <Panel>
        <PanelHeader eyebrow="Qualification" title="Capability Domains" />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>Status</th>
                <th>Detail</th>
                <th>Last observation</th>
                <th>Last failure</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.qualification.map((row) => (
                <tr key={row.domain}>
                  <td className="text-text-primary">{row.domain}</td>
                  <td>
                    <StatusPill tone={STATUS_TONE[row.status] ?? "border-border text-text-muted"}>{row.status}</StatusPill>
                  </td>
                  <td className="max-w-[420px] whitespace-normal">{row.detail}</td>
                  <td>{row.last_observation ?? "—"}</td>
                  <td>{row.last_failure ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="Models" title="Configured and Invoked Models" />
          <div className="divide-y divide-border">
            {system.models.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-text-muted">No model invocation was observed in this snapshot.</p>
            ) : (
              system.models.map((model) => (
                <div key={model.role} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="font-mono text-[11px] text-text-primary">{model.label}</p>
                    <p className="text-[10px] text-text-muted">{model.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill tone={model.invoked ? "border-positive/40 text-positive" : "border-border text-text-muted"}>
                      {model.invoked ? "INVOKED" : "CONFIGURED"}
                    </StatusPill>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Providers" title="Observed Provider Constraints" />
          <div className="divide-y divide-border">
            {system.providers.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-text-muted">No provider state was observed in this snapshot.</p>
            ) : (
              system.providers.map((provider, index) => (
                <div key={`${provider.domain}-${index}`} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-text-primary">{provider.domain}</span>
                    <StatusPill tone="border-border text-text-muted">{provider.state}</StatusPill>
                  </div>
                  <p className="mt-1 text-[10px] text-text-muted">{provider.capability}</p>
                  {provider.constraint ? <p className="mt-1 text-[10px] text-warning">{provider.constraint}</p> : null}
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Qualification semantics</p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          IMPLEMENTED, UNIT_TESTED, INTEGRATION_TESTED, DOCUMENTATION_VERIFIED, PROVIDER_VERIFIED and
          EMPIRICALLY_QUALIFIED are distinct states. PARTIAL, BLOCKED, FAILED and UNVERIFIED are published without
          softening. A successful build does not prove live trading capability.
        </p>
      </Panel>
    </div>
  );
}
