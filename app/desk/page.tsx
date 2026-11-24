import Link from "next/link";

import { AgentNetwork } from "@/components/agents/agent-network";
import { LineChart } from "@/components/charts/line-chart";
import { ActivityFeed } from "@/components/feed/activity-feed";
import {
  DataUnavailable,
  EvidenceIndicator,
  Kpi,
  Panel,
  PanelHeader,
  SectionHeading,
  StatusPill,
  Timestamp,
} from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";
import { relative, usd } from "@/lib/format";

export const metadata = { title: "Trading Desk" };

export default async function DeskPage() {
  const snapshot = await getSnapshot();
  const { overview } = snapshot;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="Public Trading Observatory"
        title="Trading Desk"
        description="The actual system state. Every metric links to its evidence where evidence exists."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="border-border text-text-muted">{snapshot.data_mode}</StatusPill>
            <StatusPill tone="border-border text-text-muted">{snapshot.data_quality}</StatusPill>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded border border-border bg-border md:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Operating capital" value={usd(overview.operating_capital_cents)} hint="W01 + reserves" />
        <Kpi label="Profit treasury" value={usd(overview.profit_treasury_cents)} hint="W02" />
        <Kpi label="Realized net PnL" value={usd(overview.realized_pnl_cents)} hint="Paper" />
        <Kpi
          label="Unrealized PnL"
          value={overview.unrealized_pnl_cents === null ? "—" : usd(overview.unrealized_pnl_cents)}
          hint={overview.unrealized_pnl_cents === null ? "Unavailable" : "Open positions"}
        />
        <Kpi label="Creator fees" value={usd(overview.creator_fees_cents)} hint="Received" />
        <Kpi label="Open positions" value={overview.open_positions ?? "—"} hint="Observed" />
        <Kpi
          label="Intelligence spend"
          value={overview.intelligence_expenditure_cents === null ? "—" : usd(overview.intelligence_expenditure_cents)}
          hint={overview.intelligence_expenditure_cents === null ? "Unavailable" : "Observed"}
        />
        <Kpi
          label="Operational runway"
          value={overview.operational_runway_days === null ? "—" : `${overview.operational_runway_days}d`}
          hint={overview.operational_runway_days === null ? "Unavailable" : "Estimated"}
        />
      </div>

      {overview.notes.length ? (
        <div className="grid gap-2 md:grid-cols-2">
          {overview.notes.map((note) => (
            <DataUnavailable key={note} reason={note} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel>
          <PanelHeader
            eyebrow="Signature view"
            title="Agent Network"
            action={<StatusPill tone="border-border text-text-muted">{snapshot.agents.length} instances</StatusPill>}
          />
          <div className="p-3">
            <AgentNetwork agents={snapshot.agents} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Chronological"
            title="System Activity Feed"
            action={<Link href="/explorer" className="font-mono text-[10px] text-brand-gold hover:underline">Explorer →</Link>}
          />
          <ActivityFeed events={snapshot.events} limit={12} />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHeader eyebrow="Ecosystem" title="Own-Token Market History" />
          <div className="p-4">
            <LineChart
              points={snapshot.ecosystem.history.map((point) => ({ x: point.at, y: point.market_cap }))}
              label="Market cap history"
              unavailable="No own-token market history is available in this snapshot."
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Capital" title="Capital Distribution" />
          <div className="divide-y divide-border">
            {snapshot.economy.wallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-text-primary">{wallet.id}</p>
                  <p className="truncate text-[10px] text-text-muted">{wallet.role}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[11px] tabular-nums text-text-primary">{usd(wallet.balance_cents)}</p>
                  <p className="font-mono text-[9px] text-text-muted">{wallet.state}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="M01"
            title="Current Candidates"
            action={<Link href="/desk/market" className="font-mono text-[10px] text-brand-gold hover:underline">Market →</Link>}
          />
          <div className="divide-y divide-border">
            {snapshot.market.candidates.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-text-muted">No candidate was observed in this snapshot.</p>
            ) : (
              snapshot.market.candidates.slice(0, 5).map((candidate, index) => (
                <div key={`${candidate.mint ?? candidate.pool ?? "candidate"}-${index}`} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] text-text-primary">{candidate.mint ?? candidate.pool ?? "Unknown mint"}</p>
                    <p className="truncate text-[10px] text-text-muted">
                      {candidate.scanner ?? "scanner"} · {candidate.integrity_verdict ?? "UNKNOWN"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[11px] tabular-nums text-text-primary">{usd(candidate.market_cap)}</p>
                    <p className="font-mono text-[9px] text-text-muted">{candidate.decision_status ?? "—"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="M04"
            title="Latest Decisions"
            action={<Link href="/desk/decisions" className="font-mono text-[10px] text-brand-gold hover:underline">Decisions →</Link>}
          />
          <div className="divide-y divide-border">
            {snapshot.decisions.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-text-muted">No decision was observed in this snapshot.</p>
            ) : (
              snapshot.decisions.slice(-4).reverse().map((decision) => (
                <Link key={decision.id} href={`/explorer/${decision.id}`} className="block px-4 py-2.5 hover:bg-surface-hover">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] text-text-primary">{decision.id}</span>
                    <StatusPill tone="border-border text-text-muted">{decision.domain}</StatusPill>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-text-secondary">{decision.summary}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <Timestamp value={decision.timestamp} />
                    <EvidenceIndicator state={decision.policy_verdict === "PASS" ? "OBSERVED" : "INFERRED"} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader eyebrow="System" title="System Health" action={<Link href="/system" className="font-mono text-[10px] text-brand-gold hover:underline">System →</Link>} />
        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-surface px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Mode</p>
            <p className="mt-1 font-mono text-sm text-text-primary">{snapshot.system.mode}</p>
          </div>
          <div className="bg-surface px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Qualification</p>
            <p className="mt-1 font-mono text-sm text-text-primary">{snapshot.system.qualification_state}</p>
          </div>
          <div className="bg-surface px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Last observation</p>
            <p className="mt-1 font-mono text-sm text-text-primary">{relative(snapshot.system.last_observation)}</p>
          </div>
          <div className="bg-surface px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Runtime</p>
            <p className="mt-1 font-mono text-sm text-text-primary">{snapshot.data_mode === "UNAVAILABLE" ? "NOT CONNECTED" : "SNAPSHOT"}</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
