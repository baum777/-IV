import Link from "next/link";

import { AgentGlyph } from "@/components/brand/glyphs";
import { QualificationIndicator, StatusPill } from "@/components/ui/primitives";
import { ARCHETYPES } from "@/lib/archetypes";
import type { PublicSnapshot } from "@/lib/types";

export function Instances({ snapshot }: { snapshot: PublicSnapshot }) {
  const byId = new Map(snapshot.agents.map((agent) => [agent.id, agent]));

  return (
    <section id="instances" className="scroll-mt-28">
      <div className="border-b border-[var(--brand-stone)] pb-4">
        <p className="landing-eyebrow">Section II · The Four Instances</p>
        <h2 className="landing-display mt-2 text-3xl font-medium text-[var(--brand-ivory)]">
          FOUR ARCHETYPES. ONE ARCHITECTURE.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          Three instances perceive. The fourth evaluates and proposes. Runtime identifiers M01–M04 are unchanged; the
          archetype names are presentation aliases.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ARCHETYPES.map((archetype) => {
          const agent = byId.get(archetype.id);
          return (
            <article
              key={archetype.id}
              className="flex flex-col rounded border border-[var(--brand-stone)] bg-[#0B0B0C]/60 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="flex size-12 items-center justify-center rounded border border-[var(--brand-stone)] bg-[#0B0B0C]"
                  style={{ color: archetype.operationalColor }}
                >
                  <AgentGlyph glyph={archetype.glyph} size={30} />
                </span>
                <StatusPill tone="border-[var(--brand-stone)] text-[var(--text-muted)]">
                  {agent?.runtime_state ?? "UNKNOWN"}
                </StatusPill>
              </div>

              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--brand-alchemical)]">
                {archetype.id}
              </p>
              <h3 className="landing-display mt-1 text-xl font-medium text-[var(--brand-ivory)]">{archetype.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{archetype.technicalRole}</p>

              <dl className="mt-4 space-y-1.5 border-t border-[var(--brand-stone)] pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                <div className="flex justify-between gap-2">
                  <dt>Element</dt>
                  <dd className="text-[var(--brand-ivory)]">{archetype.element}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Direction</dt>
                  <dd className="text-[var(--brand-ivory)]">{archetype.direction}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Principle</dt>
                  <dd className="text-[var(--brand-ivory)]">{archetype.principle}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Runtime</dt>
                  <dd className="truncate text-[var(--brand-ivory)]">{agent?.name ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Role</dt>
                  <dd className="truncate text-[var(--brand-ivory)]">{agent?.role ?? "—"}</dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--brand-stone)] pt-3">
                <QualificationIndicator state={agent?.qualification_state ?? "UNVERIFIED"} />
                <Link
                  href={archetype.route}
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--brand-alchemical)] hover:underline"
                >
                  Open →
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 space-y-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
        <p>M04 proposes; the deterministic policy gate decides. Model confidence is not execution authority.</p>
        <p>
          Narrative accents follow the archetype palette. Operational agent colours in the observatory are unchanged;
          M02 renders in violet operationally and in amber within narrative artwork. Colour is never an operational
          health signal.
        </p>
      </div>
    </section>
  );
}
