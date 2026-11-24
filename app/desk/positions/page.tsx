import { EmptyState, Panel, PanelHeader, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";
import { shortAddress, usd } from "@/lib/format";

export const metadata = { title: "Positions and Trade History" };

export default async function PositionsPage() {
  const snapshot = await getSnapshot();
  const positions = snapshot.overview.open_position_records ?? [];
  const positionEvents = snapshot.events.filter((event) => event.family === "position");

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="Trading"
        title="Positions and Trade History"
        description="Open positions and observed position events. Paper and actual balances are never mixed."
        action={<StatusPill tone="border-border text-text-muted">{snapshot.overview.open_positions ?? 0} open</StatusPill>}
      />

      <Panel>
        <PanelHeader eyebrow="Open positions" title="Current Exposure" />
        {positions.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No open position was observed." description="Empty exposure is shown as empty, not as zero." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Pair</th>
                  <th className="text-right">Entry</th>
                  <th className="text-right">Mark</th>
                  <th>Entry time</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position, index) => (
                  <tr key={`${position.token}-${index}`}>
                    <td className="text-text-primary">{shortAddress(position.token)}</td>
                    <td>{shortAddress(position.pair_id)}</td>
                    <td className="text-right tabular-nums">{usd(position.entry_cents)}</td>
                    <td className="text-right tabular-nums">{position.mark_price_usd ?? "—"}</td>
                    <td>{position.entry_at ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader eyebrow="Position events" title="Trade History" />
        {positionEvents.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No position event was observed." description="Trade history is populated only from observed position events." />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {positionEvents.slice().reverse().map((event) => (
              <div key={event.event_id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-text-primary">{event.event_type}</p>
                  <p className="truncate text-[11px] text-text-secondary">{event.summary}</p>
                </div>
                <span className="shrink-0 font-mono text-[9px] text-text-muted">{event.occurred_at}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
