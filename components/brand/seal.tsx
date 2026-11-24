import { AgentGlyph } from "./glyphs";

interface SealProps {
  size?: number;
  className?: string;
}

const NODES = [
  { id: "M01", label: "M01", glyph: "eye", x: 300, y: 74, color: "#508FCF" },
  { id: "M02", label: "M02", glyph: "flame", x: 526, y: 226, color: "#A78BFA" },
  { id: "M03", label: "M03", glyph: "pulse", x: 526, y: 374, color: "#36B5A0" },
  { id: "M04", label: "M04", glyph: "hand", x: 300, y: 300, color: "#D5B477" },
];

export function FourthSeal({ size = 560, className = "" }: SealProps) {
  return (
    <svg
      viewBox="0 0 600 600"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="The Fourth Seal: three intelligence instances converge on the fourth decision instance."
    >
      <defs>
        <radialGradient id="seal-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E4C994" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#C4A36E" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#C4A36E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="seal-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C4A36E" stopOpacity="0.18" />
          <stop offset="50%" stopColor="#E4C994" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#C4A36E" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      <g stroke="url(#seal-line)" fill="none" strokeWidth="1.2">
        <rect x="80" y="80" width="440" height="440" strokeOpacity="0.75" />
        <rect x="120" y="120" width="360" height="360" strokeOpacity="0.6" />
        <rect x="160" y="160" width="280" height="280" strokeOpacity="0.45" />
        <path d="M80 80 520 520M520 80 80 520" strokeOpacity="0.28" />
        <circle cx="300" cy="300" r="220" strokeOpacity="0.4" />
        <circle cx="300" cy="300" r="140" strokeOpacity="0.55" />
        <circle cx="300" cy="300" r="86" strokeOpacity="0.7" />
      </g>

      <circle cx="300" cy="300" r="150" fill="url(#seal-core)" className="seal-breathe" />

      <g stroke="url(#seal-line)" fill="none" strokeWidth="1" strokeDasharray="3 5">
        <path d="M300 74 300 300" />
        <path d="M526 226 300 300" />
        <path d="M526 374 300 300" />
      </g>

      <g fill="none" stroke="#C4A36E" strokeWidth="1" strokeOpacity="0.7">
        <path d="M300 74v-14M300 74h14M526 226h14M526 226v-14M526 374h14M526 374v14" />
      </g>

      {NODES.map((node) => (
        <g key={node.id} transform={`translate(${node.x - 30}, ${node.y - 30})`}>
          <circle cx="30" cy="30" r="30" fill="#10141B" stroke={node.color} strokeWidth="1.4" strokeOpacity="0.9" />
          <g color={node.color} transform="translate(12, 12)">
            <AgentGlyph glyph={node.glyph} size={36} />
          </g>
        </g>
      ))}

      <g className="seal-rotate" style={{ transformOrigin: "300px 300px" }}>
        <circle cx="300" cy="300" r="196" fill="none" stroke="#C4A36E" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="1 7" />
      </g>

      <g fill="none" stroke="#C4A36E" strokeWidth="1.2" strokeOpacity="0.8">
        <rect x="272" y="272" width="56" height="56" transform="rotate(45 300 300)" />
        <rect x="286" y="286" width="28" height="28" />
      </g>

      <g fill="#C4A36E" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="2" textAnchor="middle" opacity="0.85">
        <text x="300" y="42">THE FOURTH</text>
        <text x="300" y="574">MAKES IT REAL</text>
      </g>
    </svg>
  );
}
