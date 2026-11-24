import { readFile } from "node:fs/promises";
import path from "node:path";

import type { PublicSnapshot } from "./types";

const SNAPSHOT_PATH = process.env.PUBLIC_SNAPSHOT_PATH || path.join(process.cwd(), "public", "data", "snapshot.json");

export interface SnapshotLoad {
  snapshot: PublicSnapshot | null;
  error: string | null;
  loaded_at: string;
}

function unavailableSnapshot(error: string): PublicSnapshot {
  return {
    schema_version: "1.0",
    snapshot_id: "unavailable",
    generated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
    source_runtime_id: "unavailable",
    execution_mode: "PAPER",
    data_mode: "UNAVAILABLE",
    data_quality: "UNAVAILABLE",
    publication_delay_seconds: 0,
    snapshot_digest: "",
    system: {
      mode: "PAPER",
      runtime_state: "OFFLINE",
      qualification_state: "UNVERIFIED",
      last_observation: null,
      last_failure: error,
      freshness: "UNAVAILABLE",
      models: [],
      providers: [],
    },
    overview: {
      operating_capital_cents: null,
      profit_treasury_cents: null,
      realized_pnl_cents: null,
      unrealized_pnl_cents: null,
      creator_fees_cents: null,
      open_positions: null,
      intelligence_expenditure_cents: null,
      operational_runway_days: null,
      notes: [error],
      observed_at: null,
      data_quality: "UNAVAILABLE",
      open_position_records: [],
    },
    agents: [],
    events: [],
    market: { scanners: [], candidates: [], activation: "UNKNOWN", qualification: "UNVERIFIED" },
    memetic: { narratives: [], scanners: [], providers: [], momentum: { cultural: [], memetic: [], financial: [] } },
    ecosystem: {
      own_token: { mint: null, launch_state: "PRE_LAUNCH", market_cap: null, liquidity: null, holders: null, creator_fees: null, operating_mode: "UNKNOWN" },
      health: [],
      history: [],
    },
    economy: {
      fee_policy: { creator_dev_pct: 20, creator_operating_pct: 80, note: "Policy unavailable" },
      allocation: [],
      wallets: [],
      transfers: [],
      reconciliation: [],
    },
    treasury: { available_cents: null, recommendation: "UNKNOWN", policy_verdict: "UNVERIFIED", actions: [] },
    decisions: [],
    research: { runs: [], calibration: [], edge_status: "UNVERIFIED" },
    qualification: [],
    limitations: [error],
  };
}

function recomputeFreshness(generatedAt: string | null | undefined): "CURRENT" | "DELAYED" | "STALE" | "UNAVAILABLE" {
  if (!generatedAt) return "UNAVAILABLE";
  const generated = new Date(generatedAt).getTime();
  if (Number.isNaN(generated)) return "UNAVAILABLE";
  const ageSeconds = Math.max(0, (Date.now() - generated) / 1000);
  if (ageSeconds <= 900) return "CURRENT";
  if (ageSeconds <= 86400) return "DELAYED";
  return "STALE";
}

export async function loadSnapshot(): Promise<SnapshotLoad> {
  try {
    const raw = await readFile(SNAPSHOT_PATH, "utf8");
    const snapshot = JSON.parse(raw) as PublicSnapshot;
    if (!snapshot.schema_version || !snapshot.snapshot_id) {
      throw new Error("Snapshot is missing schema_version or snapshot_id");
    }
    snapshot.system.freshness = recomputeFreshness(snapshot.generated_at);
    return { snapshot, error: null, loaded_at: new Date().toISOString() };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Snapshot unavailable";
    return { snapshot: unavailableSnapshot(message), error: message, loaded_at: new Date().toISOString() };
  }
}

export async function getSnapshot(): Promise<PublicSnapshot> {
  return (await loadSnapshot()).snapshot as PublicSnapshot;
}

export function findDecision(snapshot: PublicSnapshot, id: string) {
  return snapshot.decisions.find((decision) => decision.id === id || decision.id === `decision-${id}`) ?? null;
}

export function findResearchRun(snapshot: PublicSnapshot, id: string) {
  return snapshot.research.runs.find((run) => run.id === id) ?? null;
}
