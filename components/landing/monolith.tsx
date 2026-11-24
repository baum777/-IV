import { AgentGlyph } from "@/components/brand/glyphs";

const NODES = [
  { id: "M01", glyph: "eye", x: 528, y: 300, color: "#508FCF" },
  { id: "M02", glyph: "flame", x: 320, y: 528, color: "#C8873F" },
  { id: "M03", glyph: "pulse", x: 112, y: 300, color: "#36B5A0" },
  { id: "M04", glyph: "hand", x: 320, y: 112, color: "#D5B477" },
] as const;

/**
 * Obsidian Monolith — narrative artwork (WO-012-A §5).
 *
 * A central obsidian cube with a luminous golden core and the four
 * archetypal instances around it. This is symbolic geometry, not a
 * runtime diagram. It is labelled as artwork wherever it is used.
 */
export function Monolith({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 640"
      className={className}
      role="img"
      aria-label="Obsidian Monolith: a central black cube with a luminous golden core, surrounded by the four archetypal instances."
    >
      <defs>
        <radialGradient id="monolith-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0E2BE" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#D5B477" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#B69A65" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="monolith-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B69A65" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#E9DFC8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#B69A65" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="monolith-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B1B1D" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0B0B0C" stopOpacity="0.98" />
        </linearGradient>
      </defs>

      {/* Restrained sacred geometry frame */}
      <g fill="none" stroke="#B69A65" strokeWidth="1">
        <rect x="60" y="60" width="520" height="520" strokeOpacity="0.25" />
        <rect x="100" y="100" width="440" height="440" strokeOpacity="0.16" />
        <circle cx="320" cy="320" r="250" strokeOpacity="0.2" />
        <circle cx="320" cy="320" r="196" strokeOpacity="0.14" strokeDasharray="1 7" />
      </g>

      {/* Core glow behind the monolith */}
      <circle cx="320" cy="300" r="170" fill="url(#monolith-core)" className="seal-breathe" />

      {/* Connectors sit behind the cube */}
      <g stroke="url(#monolith-line)" strokeWidth="1" strokeDasharray="3 5" fill="none">
        <path d="M320 300 320 112" />
        <path d="M320 300 528 300" />
        <path d="M320 300 320 528" />
        <path d="M320 300 112 300" />
      </g>

      {/* Obsidian cube */}
      <g stroke="url(#monolith-line)" strokeWidth="1.2" strokeLinejoin="round">
        <polygon points="320,150 452,226 320,302 188,226" fill="url(#monolith-face)" />
        <polygon points="188,226 320,302 320,438 188,362" fill="#101012" fillOpacity="0.95" />
        <polygon points="452,226 320,302 320,438 452,362" fill="#141416" fillOpacity="0.95" />
      </g>

      {/* Luminous core at the seam */}
      <circle cx="320" cy="320" r="46" fill="url(#monolith-core)" />
      <circle cx="320" cy="320" r="18" fill="none" stroke="#E9DFC8" strokeOpacity="0.5" />
      <circle cx="320" cy="320" r="10" fill="#F0E2BE" fillOpacity="0.9" />

      {/* Four archetypal instances */}
      {NODES.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r="30"
            fill="#0B0B0C"
            stroke={node.color}
            strokeWidth="1.4"
            strokeOpacity="0.9"
          />
          <g color={node.color} transform={`translate(${node.x - 20}, ${node.y - 20})`}>
            <AgentGlyph glyph={node.glyph} size={40} />
          </g>
        </g>
      ))}
    </svg>
  );
}
