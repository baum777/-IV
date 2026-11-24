import { EconomicEngine } from "@/components/architecture/economic-engine";
import { EmptyState, Panel, PanelHeader, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";
import { usd } from "@/lib/format";

export const metadata = { title: "Economic Observatory" };

export default async function EconomyPage() {
  const snapshot = await getSnapshot();
  const economy = snapshot.economy;
  const credits = economy.prepaid_credits;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="Economic Observatory"
        title="Tokenized Economic Architecture"
        description="Creator fee distribution, wallet separation and provider expenditures. Configured policy and observed balances are shown separately."
        action={<StatusPill tone="border-border text-text-muted">20:80</StatusPill>}
      />

      <Panel>
        <PanelHeader eyebrow="Fee distribution" title="Economic Engine" />
        <div className="p-3">
          <EconomicEngine snapshot={snapshot} />
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="Allocation" title="Configured Policy" />
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Wallet</th>
                  <th className="text-right">Share</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {economy.allocation.map((row) => (
                  <tr key={row.domain}>
                    <td className="text-text-primary">{row.domain}</td>
                    <td>{row.wallet}</td>
                    <td className="text-right tabular-nums">{row.pct}%</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Observed" title="Wallet Balances" />
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Wallet</th>
                  <th>Role</th>
                  <th className="text-right">Balance</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {economy.wallets.map((wallet) => (
                  <tr key={wallet.id}>
                    <td className="text-text-primary">{wallet.id}</td>
                    <td>{wallet.role}</td>
                    <td className="text-right tabular-nums">{usd(wallet.balance_cents)}</td>
                    <td>{wallet.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="History" title="Creator Fee History" />
          <div className="p-4">
            <EmptyState title="No fee time series was observed." description="Only the current observed creator-fee balance is available." />
          </div>
        </Panel>
        <Panel>
          <PanelHeader eyebrow="History" title="Provider Expenditure" />
          <div className="p-4">
            <EmptyState title="No provider expenditure history was observed." description="Provider credit observations are unavailable in this snapshot." />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="Prepaid" title="Provider Credit State" />
          <div className="p-4">
            {credits ? (
              <dl className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Status</dt>
                  <dd className="text-text-primary">{credits.status}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Remaining</dt>
                  <dd className="text-text-primary">{credits.remaining_micros === null ? "—" : credits.remaining_micros}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-text-muted">Runway</dt>
                  <dd className="text-text-primary">{credits.runway_days === null ? "—" : `${credits.runway_days}d`}</dd>
                </div>
              </dl>
            ) : (
              <EmptyState title="No prepaid credit observation." description="Prepaid provider balance is unknown." />
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Reconciliation" title="Settlement Reconciliation" />
          <div className="divide-y divide-border">
            {economy.reconciliation.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-text-muted">No reconciliation row was observed.</p>
            ) : (
              economy.reconciliation.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="font-mono text-[11px] text-text-primary">{row.label}</p>
                    <p className="text-[10px] text-text-muted">{row.note}</p>
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-text-secondary">
                    {typeof row.value_cents === "number" ? usd(row.value_cents) : "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Accounting semantics</p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          Configured policy, observed balance, pending transfer, confirmed transfer, simulated transfer, prepaid
          provider balance and consumed credits are distinct states. No double counting between wallets, reserved
          capital and prepaid balances. Website hosting expenditure is not authorized by the operational wallet policy.
        </p>
      </Panel>
    </div>
  );
}
