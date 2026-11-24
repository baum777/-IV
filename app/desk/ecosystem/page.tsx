import { LineChart } from "@/components/charts/line-chart";
import { EmptyState, Panel, PanelHeader, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";
import { usd } from "@/lib/format";

export const metadata = { title: "M03 Own Token Observatory" };

export default async function EcosystemPage() {
  const snapshot = await getSnapshot();
  const token = snapshot.ecosystem.own_token;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="M03 — The Watcher"
        title="Own Token Observatory"
        description="The economic condition of the system. Real-data observatory: no synthetic token health values are shown."
        action={<StatusPill tone="border-border text-text-muted">{token.launch_state}</StatusPill>}
      />

      <div className="grid gap-px overflow-hidden rounded border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Operating mode</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{token.operating_mode}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Market cap</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{token.market_cap === null ? "—" : usd(token.market_cap)}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Liquidity</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{token.liquidity === null ? "—" : usd(token.liquidity)}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Holders</p>
          <p className="mt-1 font-mono text-lg text-text-primary">{token.holders ?? "—"}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="Health radar" title="Economic Health Dimensions" />
          <div className="p-4">
            {snapshot.ecosystem.health.length === 0 ? (
              <EmptyState
                title="No health dimension was observed."
                description="M03 publishes health dimensions only when the corresponding evidence is available."
              />
            ) : (
              <div className="space-y-3">
                {snapshot.ecosystem.health.map((dimension) => (
                  <div key={dimension.dimension}>
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-text-secondary">{dimension.dimension}</span>
                      <span className="text-text-primary">{dimension.value ?? "—"}</span>
                    </div>
                    <div className="mt-1 h-1 w-full bg-border">
                      <div
                        className="h-1 bg-agent-m03"
                        style={{ width: `${Math.max(0, Math.min(100, dimension.value ?? 0))}%` }}
                      />
                    </div>
                    {dimension.note ? <p className="mt-1 text-[10px] text-text-muted">{dimension.note}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Market history" title="Own Token Market Cap" />
          <div className="p-4">
            <LineChart
              points={snapshot.ecosystem.history.map((point) => ({ x: point.at, y: point.market_cap }))}
              label="Market cap history"
              color="#36B5A0"
              unavailable="No own-token market history is available in this snapshot."
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="Liquidity" title="Liquidity History" />
          <div className="p-4">
            <LineChart
              points={snapshot.ecosystem.history.map((point) => ({ x: point.at, y: point.liquidity }))}
              label="Liquidity history"
              color="#508FCF"
              unavailable="No liquidity history is available in this snapshot."
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Fees" title="Creator Fee Generation" />
          <div className="p-4">
            <EmptyState
              title="No fee time series was observed."
              description="Only the current observed creator-fee balance is available. The observatory does not synthesize a fee history."
            />
          </div>
        </Panel>
      </div>

      <Panel className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Operating mode history</p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          Operating modes: EXPANSION, STANDARD, DEFENSIVE, PRESERVATION, PRE_LAUNCH, UNKNOWN. This snapshot reports the
          current M03 assessment only. Historical mode transitions are not published without observed events.
        </p>
      </Panel>
    </div>
  );
}
