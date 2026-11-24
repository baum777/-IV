"use client";

import { useMemo, useState } from "react";

import { StatusPill } from "@/components/ui/primitives";
import { AGENT_HEX } from "@/lib/evidence";
import { timestamp } from "@/lib/format";
import type { PublicEvent } from "@/lib/types";

const FAMILIES = ["ALL", "market", "narrative", "ecosystem", "decision", "treasury", "payment", "position"];

const AGENT_BY_FAMILY: Record<string, string> = {
  market: "M01",
  narrative: "M02",
  ecosystem: "M03",
  decision: "M04",
  treasury: "M04",
  payment: "M04",
  position: "M04",
};

export function ActivityFeed({ events, limit = 20 }: { events: PublicEvent[]; limit?: number }) {
  const [family, setFamily] = useState("ALL");
  const filtered = useMemo(() => {
    const list = family === "ALL" ? events : events.filter((event) => event.family === family);
    return list.slice().reverse().slice(0, limit);
  }, [events, family, limit]);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2">
        {FAMILIES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFamily(option)}
            className={`rounded border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] transition-colors ${
              family === option
                ? "border-brand-gold text-brand-gold"
                : "border-border text-text-muted hover:border-border-strong hover:text-text-secondary"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-text-muted">No events in this family.</p>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((event) => {
            const agent = AGENT_BY_FAMILY[event.family] ?? "M04";
            return (
              <li key={event.event_id} className="flex items-start gap-3 px-3 py-2.5">
                <span
                  aria-hidden
                  className="mt-1.5 size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: AGENT_HEX[agent] }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] text-text-primary">{event.event_type}</span>
                    <StatusPill tone="border-border text-text-muted">{event.source_class}</StatusPill>
                    <span className="font-mono text-[9px] text-text-muted">{timestamp(event.occurred_at)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-text-secondary">{event.summary}</p>
                  <p className="mt-0.5 font-mono text-[9px] text-text-muted" title={timestamp(event.occurred_at)}>
                    {timestamp(event.occurred_at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
