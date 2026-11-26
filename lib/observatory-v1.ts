import { z } from "zod";

const label = z.string().min(1).max(180).refine(value =>
  !/[<>\u0000-\u001f]/.test(value) &&
  !/(?:https?:\/\/|(?:^|\s)\/(?:home|tmp|var|etc)\/|(?:sk-|ghp_|Bearer\s)\S+)/i.test(value)
);
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
const time = z.string().datetime();
const cents = z.number().int().safe();
const count = cents.nonnegative();
const metric = z.number().finite().nonnegative().max(1e15);
const optional = <T extends z.ZodTypeAny>(value: T) => value.nullish();
export const elements = ["FIRE", "WATER", "AIR", "EARTH"] as const;
export const stages = ["OBSERVED", "HYPOTHESIZED", "TESTED", "REVISED"] as const;
export const providers = ["Solana WebSocket", "Solana RPC", "DexPaprika REST", "Jupiter quotes", "OpenRouter", "Runtime worker", "Observatory projection"] as const;

export const projection = z.object({
  version: z.literal("tatd.observatory.v1"),
  publishedAt: time,
  sourceRevision: z.string().regex(/^[a-f0-9]{40}$/),
  session: optional(z.object({
    id, classification: label, state: z.enum(["STANDBY", "ACTIVE", "COMPLETED", "FAILED"]),
    mode: z.literal("PAPER_ONLY"), startedAt: optional(time), heartbeatAt: optional(time),
    durationSeconds: count.min(1).max(86400), elapsedSeconds: optional(count),
  }).strict()),
  instances: z.array(z.object({
    element: z.enum(elements), identity: label, model: optional(label),
    state: z.enum(["OBSERVING", "INTERPRETING", "PROPOSING", "WAITING", "EVALUATING", "IDLE", "UNVERIFIED"]),
    observation: optional(label), decision: optional(label), hypothesis: optional(label),
    budgetRemaining: optional(count), experience: optional(label), heartbeatAt: optional(time),
  }).strict()).max(4).default([]).refine(rows => new Set(rows.map(row => row.element)).size === rows.length),
  economy: optional(z.object({
    initial: optional(count), equity: optional(cents), available: optional(count), reserved: optional(count),
    realized: optional(cents), unrealized: optional(cents), fees: optional(count), reserve: optional(count),
    drawdownBps: optional(count.max(10000)),
  }).strict()),
  market: z.array(z.object({
    id, at: time, token: id, kind: z.enum(["CONFIRMED_LAUNCH", "CONFIRMED_GRADUATION", "SPOT_OBSERVATION"]),
    provider: z.enum(["Solana WebSocket", "Solana RPC", "DexPaprika REST", "Jupiter quotes"]),
    priceUsd: optional(metric), liquidityUsd: optional(metric), trades: optional(count),
    quote: z.enum(["AVAILABLE", "UNAVAILABLE", "UNVERIFIED"]).default("UNVERIFIED"),
  }).strict()).max(60).default([]),
  execution: z.array(z.object({
    id, at: time, element: optional(z.enum(elements)), summary: label,
    stage: z.enum(["PROPOSAL", "HOLD", "SKIP", "REJECTED", "GRANTED", "RESERVED", "ENTRY", "EXIT", "FILL", "RECONCILED"]),
    receipt: optional(id), estimatedFeeCents: optional(count),
    fillOwner: optional(z.literal("M04")),
  }).strict().refine(item => !["ENTRY", "EXIT", "FILL"].includes(item.stage) || Boolean(item.fillOwner && item.receipt))).max(60).default([]),
  positions: z.array(z.object({ id, token: id, exposureCents: optional(count) }).strict()).max(30).default([]),
  esge: z.array(z.object({
    id, hypothesisId: id, at: time, element: z.enum(elements), stage: z.enum(stages),
    summary: label, prediction: optional(label), decision: optional(label), outcome: optional(label),
    contradiction: optional(label), candidate: optional(label),
  }).strict()).max(60).default([]),
  health: z.array(z.object({
    service: z.enum(providers), at: time, state: z.enum(["CONNECTED", "DEGRADED", "RATE_LIMITED", "STALE", "UNAVAILABLE", "UNVERIFIED"]),
    qualified: optional(z.boolean()), quotaRemaining: optional(count),
  }).strict()).max(7).default([]).refine(rows => new Set(rows.map(row => row.service)).size === rows.length),
}).strict().superRefine((data, ctx) => {
  const session = data.session;
  const latest = Date.parse(data.publishedAt);
  const times = [session?.startedAt, session?.heartbeatAt, ...data.instances.map(row => row.heartbeatAt),
    ...[...data.market, ...data.execution, ...data.esge, ...data.health].map(row => row.at)];
  if (times.some(value => value && Date.parse(value) > latest)) {
    ctx.addIssue({ code: "custom", message: "Observation follows publication" });
  }
  if (session?.state === "ACTIVE" && (!session.startedAt || !session.heartbeatAt || session.elapsedSeconds == null) ||
      session?.startedAt && session.heartbeatAt && session.startedAt > session.heartbeatAt ||
      session?.elapsedSeconds != null && session.elapsedSeconds > session.durationSeconds) {
    ctx.addIssue({ code: "custom", message: "Invalid session timing" });
  }
  for (const rows of [data.market, data.execution, data.esge, data.positions]) {
    if (new Set(rows.map(row => row.id)).size !== rows.length) {
      ctx.addIssue({ code: "custom", message: "Duplicate record ID" });
    }
  }
});

export type Projection = z.infer<typeof projection>;
export type Reading = { mode: "CONNECTED" | "SNAPSHOT"; data: Projection } |
  { mode: "UNAVAILABLE"; reason: "MISSING" | "INVALID" | "STALE" | "INTERRUPTED" };

export const freshnessMs = 120_000;

export function readProjection(raw: unknown, mode: "CONNECTED" | "SNAPSHOT", now: number): Reading {
  const result = projection.safeParse(raw);
  if (!result.success) return { mode: "UNAVAILABLE", reason: "INVALID" };
  const { data } = result;
  const published = Date.parse(data.publishedAt);
  if (published > now + 5000) return { mode: "UNAVAILABLE", reason: "INVALID" };
  const heartbeat = Date.parse(data.session?.heartbeatAt ?? "");
  if (mode === "CONNECTED" && (now - published > freshnessMs ||
      data.session?.state === "ACTIVE" && (now - heartbeat > freshnessMs ||
        now - Date.parse(data.session.startedAt!) >= data.session.durationSeconds * 1000))) {
    return { mode: "UNAVAILABLE", reason: "STALE" };
  }
  return { mode, data };
}

export function readResponse(raw: unknown, now: number): Reading {
  const envelope = z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("CONNECTED"), data: z.unknown() }).strict(),
    z.object({ mode: z.literal("SNAPSHOT"), data: z.unknown() }).strict(),
    z.object({ mode: z.literal("UNAVAILABLE"), reason: z.enum(["MISSING", "INVALID", "STALE", "INTERRUPTED"]) }).strict(),
  ]).safeParse(raw);
  if (!envelope.success) return { mode: "UNAVAILABLE", reason: "INVALID" };
  const value = envelope.data;
  return value.mode === "UNAVAILABLE" ? value : readProjection(value.data, value.mode, now);
}
