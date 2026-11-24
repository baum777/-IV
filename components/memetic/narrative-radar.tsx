import { EmptyState } from "@/components/ui/primitives";
import type { Narrative } from "@/lib/types";

const TAXONOMY_COLORS = ["#508FCF", "#A78BFA", "#36B5A0", "#D5B477", "#D46B6B", "#8992A0"];

function colorFor(taxonomy: string) {
  let hash = 0;
  for (let index = 0; index < taxonomy.length; index += 1) hash = (hash * 31 + taxonomy.charCodeAt(index)) % 997;
  return TAXONOMY_COLORS[hash % TAXONOMY_COLORS.length];
}

export function NarrativeRadar({ narratives }: { narratives: Narrative[] }) {
  if (!narratives.length) {
    return (
      <EmptyState
        title="No narrative cluster was observed in this snapshot."
        description="Narrative nodes are drawn only from observed narrative evidence. The observatory does not fabricate clusters to keep the interface visually active."
      />
    );
  }

  const size = 520;
  const center = size / 2;
  const radius = 180;
  const positioned = narratives.map((narrative, index) => {
    const angle = (index / Math.max(narratives.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const score = narrative.memetic_score ?? 20;
    const nodeRadius = 8 + Math.min(28, Math.max(0, score / 3));
    return {
      narrative,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      r: nodeRadius,
      color: colorFor(narrative.taxonomy ?? "UNKNOWN"),
    };
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
      <div className="rounded border border-border bg-surface">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full" role="img" aria-label="Narrative radar of observed narrative clusters.">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#272D36" strokeWidth="1" />
          <circle cx={center} cy={center} r={radius * 0.66} fill="none" stroke="#272D36" strokeWidth="1" strokeDasharray="3 5" />
          <circle cx={center} cy={center} r={radius * 0.33} fill="none" stroke="#272D36" strokeWidth="1" strokeDasharray="3 5" />
          <circle cx={center} cy={center} r={4} fill="#C4A36E" />
          {positioned.map(({ narrative, x, y, r, color }) => (
            <g key={narrative.id}>
              <line x1={center} y1={center} x2={x} y2={y} stroke={color} strokeOpacity="0.25" strokeWidth="1" />
              <circle cx={x} cy={y} r={r} fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.2" />
              <text x={x} y={y + r + 14} textAnchor="middle" fill="#A0A7B1" fontSize="10" fontFamily="monospace">
                {narrative.canonical}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <aside className="rounded border border-border bg-surface p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Legend</p>
        <ul className="mt-2 space-y-2 text-[11px] text-text-secondary">
          <li>Node size — observed attention / memetic score</li>
          <li>Node color — taxonomy</li>
          <li>Radial distance — defined lifecycle position</li>
          <li>Connections — evidence-backed relationships</li>
        </ul>
        <div className="mt-3 space-y-1 border-t border-border pt-2">
          {positioned.map(({ narrative, color }) => (
            <div key={narrative.id} className="flex items-center gap-2 font-mono text-[10px]">
              <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="truncate text-text-secondary">{narrative.canonical}</span>
              <span className="ml-auto text-text-muted">{narrative.lifecycle ?? "—"}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
