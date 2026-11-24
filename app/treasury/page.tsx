import { EmptyState, Panel, PanelHeader, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";
import { usd } from "@/lib/format";

export const metadata = { title: "Profit Treasury" };

export default async function TreasuryPage() {
  const snapshot = await getSnapshot();
  const treasury = snapshot.treasury;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="Profit Treasury"
        title="Treasury Observatory"
        description="Positive realized net trading profits under the existing profit policy. No execution buttons. No external influence."
        action={<StatusPill tone="border-border text-text-muted">{treasury.automation_paused ? "PAUSED" : "ACTIVE"}</StatusPill>}
      />

      <div className="grid gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Available treasury</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{usd(treasury.available_cents)}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Recommendation</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{treasury.recommendation}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Policy verdict</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{treasury.policy_verdict}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Actions</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{treasury.actions.length}</p>
        </div>
      </div>

      <Panel>
        <PanelHeader eyebrow="History" title="Treasury Actions" />
        {treasury.actions.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No treasury action was observed." description="Treasury history is populated only from observed treasury decisions." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Action</th>
                  <th className="text-right">Amount</th>
                  <th>State</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {treasury.actions.map((action) => (
                  <tr key={action.id}>
                    <td className="text-text-primary">{action.id}</td>
                    <td>{action.action}</td>
                    <td className="text-right tabular-nums">{usd(action.amount_cents)}</td>
                    <td>{action.state}</td>
                    <td>{action.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Categories and boundaries</p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          HOLD_RESERVE, BUYBACK_BURN, BUYBACK_LIQUIDITY and HOLDER_AIRDROP are treasury action categories. No treasury
          action guarantees token appreciation. Wallet addresses are published only when the operator publication policy
          permits it. Private keys and custody metadata are never exposed.
        </p>
      </Panel>
    </div>
  );
}
