export type ExecutionMode = "LIVE" | "PAPER" | "REPLAY" | "FIXTURE";
export type EvidenceState = "VERIFIED" | "OBSERVED" | "INFERRED" | "UNKNOWN";
export type FreshnessState = "CURRENT" | "DELAYED" | "STALE" | "UNAVAILABLE";
export type QualificationState =
  | "EXPLORATORY"
  | "PARTIAL"
  | "QUALIFIED"
  | "BLOCKED"
  | "UNVERIFIED";

export type AgentId = "M01" | "M02" | "M03" | "M04";

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  responsibility: string;
  color: string;
  glyph: string;
  configured_model: string;
  qualification_state: QualificationState;
  runtime_state: string;
  href: string;
  provider_dependencies: string[];
  last_observed?: string | null;
  latest_summary?: string | null;
}

export interface PublicEvent {
  event_id: string;
  event_type: string;
  family: string;
  source: string;
  occurred_at: string;
  published_at: string;
  mode: ExecutionMode;
  evidence_state: EvidenceState;
  source_class: string;
  summary: string;
  related: string[];
}

export interface Candidate {
  token: string;
  mint: string | null;
  pool: string | null;
  age_seconds: number | null;
  market_cap: number | null;
  liquidity: number | null;
  volume: number | null;
  buy_sell: number | null;
  unique_wallets: number | null;
  scanner: string | null;
  narrative_match: string | null;
  integrity_verdict: string;
  decision_status: string;
  observed_at: string | null;
}

export interface ScannerProfile {
  id: string;
  name: string;
  activation: string;
}

export interface Scanner {
  id: string;
  code: string;
  name: string;
  purpose: string;
  activation: string;
  qualification: QualificationState;
  configuration_version: string;
  recent_signals: number | null;
  missing_features: string[];
  profiles: ScannerProfile[];
}

export interface Narrative {
  id: string;
  canonical: string;
  taxonomy: string;
  aliases: string[];
  detected_at: string | null;
  sources: string[];
  lifecycle: string;
  memetic_score: number | null;
  score_bounds: string | null;
  evidence_coverage: string | null;
  attention_integrity: string | null;
  saturation_risk: string | null;
  related_mints: string[];
}

export interface DecisionStage {
  id: string;
  title: string;
  description: string;
  timestamp: string | null;
  evidence_state: EvidenceState;
  payload: Record<string, unknown>;
}

export interface Decision {
  id: string;
  domain: "TRADING" | "TREASURY";
  timestamp: string;
  model_identifier: string;
  routing_reason: string;
  structured_response: Record<string, unknown>;
  proposed_action: string;
  policy_verdict: string;
  execution_status: string;
  evidence_references: string[];
  outcome: string;
  summary: string;
  stages: DecisionStage[];
}

export interface ResearchRun {
  id: string;
  category: string;
  title: string;
  dataset: string;
  observation_period: string;
  sample_size: number | null;
  quality_gates: { name: string; detail?: string; state?: string }[];
  findings: string[];
  limitations: string[];
  reproduction: string;
  configuration_version: string;
  evidence_state: EvidenceState;
}

export interface QualificationRow {
  domain: string;
  status: string;
  detail: string;
  last_observation: string | null;
  last_failure: string | null;
}

export interface Wallet {
  id: string;
  role: string;
  address: string;
  balance_cents: number | null;
  state: string;
  note: string;
}

export interface PublicSnapshot {
  schema_version: string;
  snapshot_id: string;
  generated_at: string;
  published_at: string;
  source_runtime_id: string;
  execution_mode: ExecutionMode;
  data_mode: "SNAPSHOT" | "CONNECTED" | "UNAVAILABLE";
  data_quality: string;
  publication_delay_seconds: number;
  snapshot_digest: string;
  system: {
    mode: ExecutionMode;
    runtime_state: string;
    qualification_state: string;
    last_observation: string | null;
    last_failure: string | null;
    freshness: FreshnessState;
    models: {
      id: string;
      role: string;
      label: string;
      configured: boolean;
      qualified: boolean;
      invoked: boolean;
      last_invoked: string | null;
    }[];
    providers: {
      id: string;
      domain: string;
      state: string;
      capability: string;
      last_success: string | null;
      constraint: string | null;
    }[];
  };
  overview: {
    operating_capital_cents: number | null;
    profit_treasury_cents: number | null;
    realized_pnl_cents: number | null;
    unrealized_pnl_cents: number | null;
    creator_fees_cents: number | null;
    open_positions: number | null;
    intelligence_expenditure_cents: number | null;
    operational_runway_days: number | null;
    notes: string[];
    observed_at: string | null;
    data_quality: string;
    trading_balance_cents?: number | null;
    operational_balance_cents?: number | null;
    intelligence_available_cents?: number | null;
    open_position_records?: {
      token: string;
      pair_id: string;
      entry_price: string | null;
      entry_cents: number | null;
      mark_price_usd: string | null;
      entry_at: string | null;
    }[];
  };
  agents: Agent[];
  events: PublicEvent[];
  market: {
    scanners: Scanner[];
    candidates: Candidate[];
    activation: string;
    qualification: QualificationState;
  };
  memetic: {
    narratives: Narrative[];
    scanners: Scanner[];
    providers: { id: string; state: string; note: string }[];
    momentum: { cultural: number[]; memetic: number[]; financial: number[] };
  };
  ecosystem: {
    own_token: {
      mint: string | null;
      launch_state: string;
      market_cap: number | null;
      liquidity: number | null;
      holders: number | null;
      creator_fees: number | null;
      operating_mode: string;
    };
    health: { dimension: string; value: number | null; note: string }[];
    history: { at: string; market_cap: number | null; liquidity: number | null }[];
  };
  economy: {
    fee_policy: { creator_dev_pct: number; creator_operating_pct: number; note: string };
    allocation: { domain: string; pct: number; wallet: string; note: string }[];
    allocation_observed_cents?: Record<string, number>;
    wallets: Wallet[];
    transfers: {
      id: string;
      domain: string;
      amount_cents: number;
      state: string;
      timestamp: string;
    }[];
    prepaid_credits?: { status: string; remaining_micros: number | null; runway_days: number | null };
    reconciliation: { label: string; value_cents: number | null; note: string }[];
  };
  treasury: {
    available_cents: number | null;
    recommendation: string;
    policy_verdict: string;
    actions: {
      id: string;
      action: string;
      amount_cents: number | null;
      state: string;
      timestamp: string;
    }[];
    automation_paused?: boolean;
  };
  decisions: Decision[];
  research: {
    runs: ResearchRun[];
    calibration: { id: string; state: string; note: string }[];
    edge_status: string;
  };
  qualification: QualificationRow[];
  limitations: string[];
}

export interface ApiEnvelope<T> {
  schema_version: string;
  generated_at: string;
  observed_at: string;
  published_at: string;
  freshness: FreshnessState;
  execution_mode: ExecutionMode;
  data: T;
  limitations: string[];
}
