import { NextResponse } from "next/server";
import { z } from "zod";

import { getSnapshot } from "@/lib/data";
import type { ApiEnvelope, PublicSnapshot } from "@/lib/types";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  cursor: z.coerce.number().int().min(0).optional(),
});

function envelope<T>(snapshot: PublicSnapshot, data: T, limitations: string[] = []): ApiEnvelope<T> {
  return {
    schema_version: snapshot.schema_version,
    generated_at: snapshot.generated_at,
    observed_at: snapshot.system.last_observation ?? snapshot.generated_at,
    published_at: snapshot.published_at,
    freshness: snapshot.system.freshness,
    execution_mode: snapshot.execution_mode,
    data,
    limitations: [...snapshot.limitations, ...limitations],
  };
}

function notFound(snapshot: PublicSnapshot, message: string) {
  return NextResponse.json(envelope(snapshot, { error: message }), { status: 404 });
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const snapshot = await getSnapshot();
  const { path } = await context.params;
  const route = path.join("/");
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json(envelope(snapshot, { error: "Invalid query parameters" }), { status: 400 });
  }
  const { limit = 50, cursor = 0 } = parsed.data;

  if (route === "system") {
    return NextResponse.json(envelope(snapshot, { system: snapshot.system, qualification: snapshot.qualification }));
  }
  if (route === "overview") {
    return NextResponse.json(envelope(snapshot, { overview: snapshot.overview, economy: snapshot.economy }));
  }
  if (route === "agents") {
    return NextResponse.json(envelope(snapshot, snapshot.agents));
  }
  if (route === "events") {
    const events = snapshot.events.slice(cursor, cursor + limit);
    return NextResponse.json(
      envelope(snapshot, { events, next_cursor: cursor + events.length < snapshot.events.length ? cursor + events.length : null }),
    );
  }
  if (route === "market/candidates") {
    return NextResponse.json(envelope(snapshot, snapshot.market.candidates));
  }
  if (route === "market/scanners") {
    return NextResponse.json(envelope(snapshot, snapshot.market.scanners));
  }
  if (route === "positions") {
    return NextResponse.json(envelope(snapshot, snapshot.overview.open_position_records ?? []));
  }
  if (route === "trades") {
    return NextResponse.json(envelope(snapshot, snapshot.decisions.filter((decision) => decision.domain === "TRADING")));
  }
  if (route === "narratives") {
    return NextResponse.json(envelope(snapshot, snapshot.memetic.narratives));
  }
  if (route.startsWith("narratives/")) {
    const id = decodeURIComponent(route.slice("narratives/".length));
    const narrative = snapshot.memetic.narratives.find((item) => item.id === id);
    return narrative ? NextResponse.json(envelope(snapshot, narrative)) : notFound(snapshot, "Narrative not found");
  }
  if (route === "ecosystem") {
    return NextResponse.json(envelope(snapshot, snapshot.ecosystem));
  }
  if (route === "decisions") {
    return NextResponse.json(envelope(snapshot, snapshot.decisions));
  }
  if (route.startsWith("decisions/")) {
    const id = decodeURIComponent(route.slice("decisions/".length));
    const decision = snapshot.decisions.find((item) => item.id === id);
    return decision ? NextResponse.json(envelope(snapshot, decision)) : notFound(snapshot, "Decision not found");
  }
  if (route === "wallets") {
    return NextResponse.json(envelope(snapshot, snapshot.economy.wallets));
  }
  if (route === "fees") {
    return NextResponse.json(envelope(snapshot, { fee_policy: snapshot.economy.fee_policy, reconciliation: snapshot.economy.reconciliation }));
  }
  if (route === "funding") {
    return NextResponse.json(envelope(snapshot, { prepaid: snapshot.economy.prepaid_credits, reconciliation: snapshot.economy.reconciliation }));
  }
  if (route === "treasury") {
    return NextResponse.json(envelope(snapshot, snapshot.treasury));
  }
  if (route === "research/runs") {
    return NextResponse.json(envelope(snapshot, snapshot.research.runs));
  }
  if (route.startsWith("research/runs/")) {
    const id = decodeURIComponent(route.slice("research/runs/".length));
    const run = snapshot.research.runs.find((item) => item.id === id);
    return run ? NextResponse.json(envelope(snapshot, run)) : notFound(snapshot, "Research run not found");
  }
  if (route === "qualification") {
    return NextResponse.json(envelope(snapshot, snapshot.qualification));
  }

  return notFound(snapshot, "Unknown public route");
}

export async function POST() {
  return NextResponse.json({ error: "Public API is read-only" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Public API is read-only" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Public API is read-only" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Public API is read-only" }, { status: 405 });
}
