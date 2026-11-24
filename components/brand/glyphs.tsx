import type { SVGProps } from "react";

type GlyphProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 48, ...props }: GlyphProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function ScoutGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <circle cx="24" cy="24" r="18" strokeOpacity="0.35" />
      <circle cx="24" cy="24" r="11" strokeOpacity="0.6" />
      <circle cx="24" cy="24" r="4" />
      <path d="M24 3v9M24 36v9M3 24h9M36 24h9" strokeOpacity="0.7" />
      <path d="M24 24 38 14" strokeOpacity="0.9" />
      <path d="M24 24a11 11 0 0 1 11-11" strokeOpacity="0.35" strokeDasharray="2 3" />
      <circle cx="38" cy="14" r="1.6" />
    </svg>
  );
}

export function MindGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path d="M24 6 41 36H7Z" strokeOpacity="0.35" />
      <path d="M24 6v30M7 36l17-11 17 11" strokeOpacity="0.55" />
      <circle cx="24" cy="6" r="2" />
      <circle cx="41" cy="36" r="2" />
      <circle cx="7" cy="36" r="2" />
      <circle cx="24" cy="25" r="2.4" />
      <circle cx="15.5" cy="15.5" r="1.2" strokeOpacity="0.7" />
      <circle cx="32.5" cy="15.5" r="1.2" strokeOpacity="0.7" />
      <path d="M15.5 15.5 24 25l8.5-9.5" strokeOpacity="0.5" strokeDasharray="2 3" />
    </svg>
  );
}

export function WatcherGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 24s7-11 20-11 20 11 20 11-7 11-20 11S4 24 4 24Z" strokeOpacity="0.6" />
      <circle cx="24" cy="24" r="7" />
      <circle cx="24" cy="24" r="2.6" />
      <ellipse cx="24" cy="24" rx="21" ry="8" strokeOpacity="0.3" transform="rotate(-24 24 24)" />
      <circle cx="40" cy="15" r="1.4" />
    </svg>
  );
}

export function ExecutorGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="6" width="36" height="36" strokeOpacity="0.35" />
      <rect x="12" y="12" width="24" height="24" strokeOpacity="0.7" transform="rotate(45 24 24)" />
      <rect x="18" y="18" width="12" height="12" />
      <path d="M24 3v6M24 39v6M3 24h6M39 24h6" strokeOpacity="0.7" />
      <circle cx="24" cy="24" r="2.2" />
    </svg>
  );
}

/**
 * Archetype glyph family (WO-012-A §7).
 *
 * These are the memetic presentation symbols — Eye, Flame, Pulse and the
 * Hand / convergence seal. They are used by the landing layer and by the
 * convergence seal. The operational glyphs above remain in use for the
 * public observatory agent cards.
 */
export function EyeGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 24s7-11 20-11 20 11 20 11-7 11-20 11S4 24 4 24Z" strokeOpacity="0.65" />
      <circle cx="24" cy="24" r="7" strokeOpacity="0.9" />
      <circle cx="24" cy="24" r="2.6" />
      <path d="M24 3v6M24 39v6M3 24h6M39 24h6" strokeOpacity="0.55" />
      <circle cx="40" cy="11" r="1.4" strokeOpacity="0.8" />
    </svg>
  );
}

export function FlameGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path
        d="M24 4c2.4 5.6 8.4 9.8 8.4 16.4A8.4 8.4 0 0 1 24 28.8a8.4 8.4 0 0 1-8.4-8.4C15.6 13.8 21.6 9.6 24 4Z"
        strokeOpacity="0.8"
      />
      <path d="M24 20.4c1.2 2.4 3.6 4.2 3.6 7.2a3.6 3.6 0 0 1-7.2 0c0-3 2.4-4.8 3.6-7.2Z" strokeOpacity="0.55" />
      <path d="M24 34v10M17 40h14" strokeOpacity="0.45" />
      <circle cx="24" cy="27.6" r="1.4" />
    </svg>
  );
}

export function PulseGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <circle cx="24" cy="24" r="18" strokeOpacity="0.35" />
      <circle cx="24" cy="24" r="11" strokeOpacity="0.6" />
      <path d="M3 24h10l3-7 4 14 3-7h12" strokeOpacity="0.9" />
      <circle cx="24" cy="24" r="2" />
      <circle cx="41" cy="24" r="1.4" strokeOpacity="0.8" />
    </svg>
  );
}

/**
 * Hand / convergence seal: four forces converge on the centre.
 */
export function HandGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <rect x="11" y="11" width="26" height="26" transform="rotate(45 24 24)" strokeOpacity="0.4" />
      <path d="M24 4v13M21.5 14.5 24 17l2.5-2.5" strokeOpacity="0.8" />
      <path d="M24 44V31M21.5 33.5 24 31l2.5 2.5" strokeOpacity="0.8" />
      <path d="M4 24h13M14.5 21.5 17 24l-2.5 2.5" strokeOpacity="0.8" />
      <path d="M44 24H31M33.5 21.5 31 24l2.5 2.5" strokeOpacity="0.8" />
      <circle cx="24" cy="24" r="3" />
    </svg>
  );
}

export const GLYPHS = {
  scout: ScoutGlyph,
  mind: MindGlyph,
  watcher: WatcherGlyph,
  executor: ExecutorGlyph,
  eye: EyeGlyph,
  flame: FlameGlyph,
  pulse: PulseGlyph,
  hand: HandGlyph,
} as const;

export type GlyphName = keyof typeof GLYPHS;

export function AgentGlyph({ glyph, ...props }: GlyphProps & { glyph: string }) {
  const Component = GLYPHS[glyph as GlyphName] ?? ExecutorGlyph;
  return <Component {...props} />;
}
