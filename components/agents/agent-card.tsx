import Link from "next/link";

import { AgentGlyph } from "@/components/brand/glyphs";
import { QualificationIndicator, StatusPill } from "@/components/ui/primitives";
import { relative } from "@/lib/format";
import type { Agent } from "@/lib/types";

export function AgentCard({ agent, compact = false }: { agent: Agent; compact?: boolean }) {
  return (
    <Link
      href={agent.href}
      className="group flex flex-col rounded-md border border-border bg-surface p-4 transition-colors hover:border-border-strong hover:bg-surface-raised"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded border border-border bg-background" style={{ color: agent.color }}>
            <AgentGlyph glyph={agent.glyph} size={26} />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{agent.id}</p>
            <p className="truncate font-display text-sm font-medium text-text-primary">{agent.name}</p>
          </div>
        </div>
        <StatusPill tone="border-border text-text-muted">{agent.runtime_state}</StatusPill>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-text-secondary">{agent.responsibility}</p>
      {!compact ? (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-border pt-3 font-mono text-[10px]">
          <dt className="text-text-muted">Model</dt>
          <dd className="truncate text-text-secondary">{agent.configured_model}</dd>
          <dt className="text-text-muted">Last observed</dt>
          <dd className="text-text-secondary">{agent.last_observed ? relative(agent.last_observed) : "—"}</dd>
        </dl>
      ) : null}
      <div className="mt-3 flex items-center justify-between gap-2">
        <QualificationIndicator state={agent.qualification_state} />
        <span className="font-mono text-[10px] text-text-muted transition-colors group-hover:text-brand-gold">
          Open observatory →
        </span>
      </div>
    </Link>
  );
}
