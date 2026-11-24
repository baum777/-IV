"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AgentGlyph } from "@/components/brand/glyphs";
import { QualificationIndicator, StatusPill } from "@/components/ui/primitives";
import { AGENT_HEX } from "@/lib/evidence";
import { timestamp } from "@/lib/format";
import type { Agent } from "@/lib/types";

const POSITIONS: Record<string, { x: number; y: number }> = {
  M01: { x: 130, y: 90 },
  M02: { x: 130, y: 230 },
  M03: { x: 130, y: 370 },
  M04: { x: 500, y: 230 },
};

const GATE = { x: 720, y: 230 };
const EXECUTION = { x: 860, y: 230 };

export function AgentNetwork({ agents }: { agents: Agent[] }) {
  const [selected, setSelected] = useState<string>("M04");
  const active = useMemo(() => agents.find((agent) => agent.id === selected) ?? agents[0], [agents, selected]);

  if (!agents.length) {
    return (
      <div className="rounded border border-dashed border-border p-6 text-center text-xs text-text-muted">
        No agent identity was observed in this snapshot.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="relative min-w-0 overflow-hidden rounded border border-border bg-background">
        <svg viewBox="0 0 900 460" className="h-auto w-full" role="img" aria-label="Agent network: three intelligence instances converge on the fourth decision instance.">
          <defs>
            <pattern id="network-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="900" height="460" fill="url(#network-grid)" />

          {["M01", "M02", "M03"].map((id) => {
            const from = POSITIONS[id];
            const to = POSITIONS.M04;
            const isActive = selected === id || selected === "M04";
            return (
              <line
                key={id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={AGENT_HEX[id]}
                strokeOpacity={isActive ? 0.65 : 0.25}
                strokeWidth={isActive ? 1.4 : 1}
                strokeDasharray={isActive ? undefined : "4 4"}
              />
            );
          })}
          <line x1={POSITIONS.M04.x} y1={POSITIONS.M04.y} x2={GATE.x} y2={GATE.y} stroke="#D5B477" strokeOpacity="0.7" strokeWidth="1.4" />
          <line x1={GATE.x} y1={GATE.y} x2={EXECUTION.x} y2={EXECUTION.y} stroke="#55B88A" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 3" />

          {agents.map((agent) => {
            const position = POSITIONS[agent.id] ?? POSITIONS.M04;
            const isSelected = selected === agent.id;
            return (
              <g
                key={agent.id}
                transform={`translate(${position.x}, ${position.y})`}
                onClick={() => setSelected(agent.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setSelected(agent.id);
                }}
                tabIndex={0}
                role="button"
                aria-label={`${agent.id} ${agent.name}`}
                className="cursor-pointer outline-none"
              >
                <circle r={isSelected ? 34 : 30} fill="#10141B" stroke={agent.color} strokeOpacity={isSelected ? 1 : 0.5} strokeWidth={isSelected ? 1.6 : 1} />
                <g color={agent.color} transform="translate(-14, -14)">
                  <AgentGlyph glyph={agent.glyph} size={28} />
                </g>
                <text x="0" y="50" textAnchor="middle" fill={agent.color} fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.5">
                  {agent.id}
                </text>
                <text x="0" y="64" textAnchor="middle" fill="#A0A7B1" fontFamily="var(--font-mono)" fontSize="9">
                  {agent.name.replace("The ", "")}
                </text>
              </g>
            );
          })}

          <g transform={`translate(${GATE.x}, ${GATE.y})`}>
            <rect x="-34" y="-22" width="68" height="44" fill="#10141B" stroke="#C4A36E" strokeOpacity="0.6" />
            <text x="0" y="-2" textAnchor="middle" fill="#C4A36E" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.2">
              POLICY
            </text>
            <text x="0" y="11" textAnchor="middle" fill="#A0A7B1" fontFamily="var(--font-mono)" fontSize="8">
              GATE
            </text>
          </g>

          <g transform={`translate(${EXECUTION.x}, ${EXECUTION.y})`}>
            <rect x="-30" y="-20" width="60" height="40" fill="#10141B" stroke="#55B88A" strokeOpacity="0.45" />
            <text x="0" y="0" textAnchor="middle" fill="#55B88A" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1">
              EXECUTION
            </text>
            <text x="0" y="10" textAnchor="middle" fill="#747C89" fontFamily="var(--font-mono)" fontSize="7">
              QUALIFIED ONLY
            </text>
          </g>
        </svg>
      </div>

      <aside className="min-w-0 rounded border border-border bg-surface p-4">
        {active ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: active.color }}>
                {active.id}
              </span>
              <StatusPill tone="border-border text-text-muted">{active.runtime_state}</StatusPill>
            </div>
            <div>
              <p className="font-display text-lg font-medium text-text-primary">{active.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">{active.responsibility}</p>
            </div>
            <dl className="space-y-2 border-t border-border pt-3 font-mono text-[10px]">
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">Model</dt>
                <dd className="truncate text-right text-text-secondary">{active.configured_model}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">Last observed</dt>
                <dd className="text-right text-text-secondary">{active.last_observed ? timestamp(active.last_observed) : "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">Providers</dt>
                <dd className="text-right text-text-secondary">{active.provider_dependencies.join(", ") || "—"}</dd>
              </div>
            </dl>
            {active.latest_summary ? (
              <p className="border-t border-border pt-3 text-[11px] leading-relaxed text-text-muted">{active.latest_summary}</p>
            ) : null}
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              <QualificationIndicator state={active.qualification_state} />
              <Link href={active.href} className="font-mono text-[10px] text-brand-gold hover:underline">
                Open →
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
