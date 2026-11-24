import { Panel, SectionHeading, StatusPill } from "@/components/ui/primitives";
import { getSnapshot } from "@/lib/data";

export const metadata = { title: "Living Whitepaper" };

const SECTIONS = [
  {
    id: "overview",
    title: "System Overview",
    body: "TATD is a tokenized autonomous trading desk. Three intelligence instances perceive market, cultural and ecosystem conditions. A fourth instance evaluates evidence and proposes action. A deterministic policy layer determines whether a proposed action may execute. The public website is a read-only observatory of that system.",
  },
  {
    id: "architecture",
    title: "Four-Agent Architecture",
    body: "M01 The Scout observes on-chain market activity. M02 The Mind observes cultural and narrative signals. M03 The Watcher observes the economic condition of the system. M04 The Executor evaluates evidence and proposes action. M04 does not hold execution authority. The deterministic policy gate is separate from the model.",
  },
  {
    id: "market",
    title: "Market Intelligence",
    body: "Six scanner families cover early ignition, organic growth, graduation, momentum, quiet accumulation and reacceleration. Each family contains aggressive, balanced and selective profiles. Scanner activation and qualification are reported separately. Candidate records are identified by mint, not ticker alone.",
  },
  {
    id: "memetic",
    title: "Memetic Intelligence",
    body: "Narrative clusters are observed across cultural sources. Narrative identity, taxonomy, aliases, replication evidence, attention acceleration, lifecycle, saturation risk and related mints are published when observed. Missing evidence is displayed as unavailable rather than fabricated.",
  },
  {
    id: "ecosystem",
    title: "Ecosystem Intelligence",
    body: "M03 assesses market condition, liquidity, holder distribution, creator fee generation, operational sustainability and treasury condition. Operating modes are EXPANSION, STANDARD, DEFENSIVE, PRESERVATION and PRE_LAUNCH. If the token is not launched, the state is PRE_LAUNCH.",
  },
  {
    id: "decision",
    title: "Decision Intelligence",
    body: "M04 produces structured decisions. Trading decisions include BUY, PASS, WATCH, HOLD and EXIT. Treasury decisions include HOLD_RESERVE, BUYBACK_BURN, BUYBACK_LIQUIDITY and HOLDER_AIRDROP. Groundhog and Bison are distinct decision routes. Model confidence is not a calibrated probability of profitable execution.",
  },
  {
    id: "economy",
    title: "Economic Architecture",
    body: "Creator fees are distributed 20 percent to the developer wallet and 80 percent to the operating wallet. The operating wallet proposes a 70 percent trading, 20 percent intelligence and 10 percent operational allocation. Configured policy and observed balances are displayed separately. The profit treasury receives positive realized net trading profits only.",
  },
  {
    id: "wallets",
    title: "Wallet Separation",
    body: "W00 Developer. W01 Operating. W01B Intelligence Payment. W01C Operational Payment. W02 Profit Treasury. Wallet addresses are published only where the operator publication policy permits. Private keys and custody metadata are never published.",
  },
  {
    id: "payments",
    title: "Payment Architecture",
    body: "Model and operational expenditures may use native x402, prepaid provider credits or other qualified payment modes. Virlo is not labeled as native x402 without verified protocol support. Prepaid balances and consumed credits are tracked without double counting.",
  },
  {
    id: "research",
    title: "Research Methodology",
    body: "Research runs document dataset, observation period, sample size, inclusion and exclusion criteria, quality gates, findings, limitations and reproduction metadata. Reported findings are distinguished from observed findings. Unresolved audit findings are not presented as validated ground truth.",
  },
  {
    id: "evidence",
    title: "Evidence Model",
    body: "Every data element carries execution mode, evidence state, freshness state and qualification state. The states are independent. LIVE, PAPER, REPLAY and FIXTURE are distinct. VERIFIED, OBSERVED, INFERRED and UNKNOWN are distinct. CURRENT, DELAYED, STALE and UNAVAILABLE are distinct.",
  },
  {
    id: "security",
    title: "Security Boundaries",
    body: "The public website is read-only. It does not connect to the private trading database. It does not contain wallet signers, trading runtime credentials or provider credentials. The public projection layer applies an explicit field allowlist, sanitization and redaction. No public mutation endpoint exists.",
  },
  {
    id: "qualification",
    title: "Qualification Status",
    body: "Implementation and empirical qualification are independent. IMPLEMENTED does not mean EMPIRICALLY_QUALIFIED. PARTIAL, BLOCKED, FAILED and UNVERIFIED are published without softening. Live trading remains disabled unless separately authorized.",
  },
  {
    id: "limitations",
    title: "Known Limitations",
    body: "The deployed observatory reads a sanitized snapshot. Live runtime connectivity is not guaranteed. Some provider capabilities are configured but not qualified. Historical research includes unresolved audit findings. Public data may be delayed by the configured publication policy.",
  },
];

export default async function DocsPage() {
  const snapshot = await getSnapshot();
  return (
    <div className="space-y-4 p-4 md:p-6">
      <SectionHeading
        eyebrow="Living Whitepaper"
        title="TATD Technical Description"
        description="Documentation reflects the implemented system. Existing capabilities, target architecture, exploratory research and unqualified capabilities are distinguished."
        action={<StatusPill tone="border-border text-text-muted">v1.0</StatusPill>}
      />

      <div className="grid gap-4 xl:grid-cols-[240px_1fr]">
        <nav className="hidden xl:block">
          <ul className="sticky top-20 space-y-1 border-l border-border pl-3">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="block py-1 text-[11px] text-text-muted hover:text-brand-gold">
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          {SECTIONS.map((section) => (
            <Panel key={section.id} className="scroll-mt-20 p-4" as="section">
              <div id={section.id} />
              <h2 className="font-display text-base text-text-primary">{section.title}</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">{section.body}</p>
            </Panel>
          ))}

          <Panel className="p-4">
            <h2 className="font-display text-base text-text-primary">Snapshot provenance</h2>
            <dl className="mt-2 grid gap-2 font-mono text-[10px] sm:grid-cols-2">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Schema version</dt>
                <dd className="text-text-secondary">{snapshot.schema_version}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Snapshot ID</dt>
                <dd className="truncate text-text-secondary">{snapshot.snapshot_id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Generated at</dt>
                <dd className="text-text-secondary">{snapshot.generated_at}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Data mode</dt>
                <dd className="text-text-secondary">{snapshot.data_mode}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}
