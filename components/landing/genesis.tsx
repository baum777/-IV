const STAGES = [
  {
    numeral: "I",
    title: "Origin",
    detail: "A point. Intelligence without extension.",
  },
  {
    numeral: "II",
    title: "Polarity",
    detail: "A line. Observation acquires direction.",
  },
  {
    numeral: "III",
    title: "Creation",
    detail: "Three points define a plane. Interpretation acquires structure.",
  },
  {
    numeral: "IV",
    title: "Embodiment",
    detail: "A fourth point leaves the plane. Evidence acquires consequence.",
  },
] as const;

/**
 * Genesis — Point → Line → Triangle → Tetrahedron (WO-012-A §6).
 *
 * CSS-only SVG sequence. The base triangle sits on a drawn plane and the
 * fourth vertex is placed outside that plane, with a dashed altitude back
 * to the centroid. No WebGL. Animations are neutralised by the global
 * prefers-reduced-motion rule and by the explicit landing overrides.
 */
export function Genesis() {
  return (
    <section id="genesis" className="scroll-mt-28">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="landing-eyebrow">Section I · Genesis</p>
          <h2 className="landing-display mt-3 text-3xl font-medium text-[var(--brand-ivory)] sm:text-4xl">
            THE FOURTH GIVES IT FORM.
          </h2>
          <p className="landing-prose mt-4">
            The number four represents embodiment. A point becomes a line. Three non-collinear points define a plane.
            A fourth non-coplanar point enables a body. Three instances observe and interpret reality. The fourth
            evaluates the evidence and proposes action.
          </p>

          <ol className="mt-7 space-y-4">
            {STAGES.map((stage) => (
              <li key={stage.numeral} className="flex gap-4 border-l border-[var(--brand-stone)] pl-4">
                <span className="mt-0.5 font-mono text-[11px] tracking-[0.2em] text-[var(--brand-alchemical)]">
                  {stage.numeral}
                </span>
                <div>
                  <p className="font-display text-sm font-medium text-[var(--brand-ivory)]">{stage.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">{stage.detail}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-7 border-l border-[var(--brand-alchemical)] pl-4 text-sm italic leading-relaxed text-[var(--brand-ivory)]">
            Three creates possibility. The Fourth gives it form.
          </p>
        </div>

        <figure className="min-w-0">
          <svg
            viewBox="0 0 520 520"
            className="mx-auto w-full max-w-[460px]"
            role="img"
            aria-label="Genesis geometry: a point becomes a line, three points define a plane, and a fourth point outside the plane forms a tetrahedron."
          >
            <defs>
              <linearGradient id="genesis-plane" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#B69A65" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#B69A65" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* The plane */}
            <polygon
              points="80,395 300,450 440,350 220,295"
              fill="url(#genesis-plane)"
              stroke="#B69A65"
              strokeOpacity="0.3"
              strokeWidth="1"
              className="genesis-fade"
              style={{ animationDelay: "0.15s" }}
            />

            {/* Base triangle wash */}
            <polygon
              points="140,405 390,405 220,330"
              fill="#B69A65"
              fillOpacity="0.04"
              stroke="none"
              className="genesis-fade"
              style={{ animationDelay: "1.15s" }}
            />

            {/* Edges: line, triangle, then tetrahedron */}
            <g fill="none" strokeWidth="1.4" strokeLinecap="round">
              <path
                d="M140 405 390 405"
                stroke="#C8873F"
                strokeOpacity="0.85"
                pathLength={1}
                className="genesis-draw"
                style={{ animationDelay: "0.75s" }}
              />
              <path
                d="M390 405 220 330"
                stroke="#36B5A0"
                strokeOpacity="0.85"
                pathLength={1}
                className="genesis-draw"
                style={{ animationDelay: "1.15s" }}
              />
              <path
                d="M220 330 140 405"
                stroke="#508FCF"
                strokeOpacity="0.85"
                pathLength={1}
                className="genesis-draw"
                style={{ animationDelay: "1.35s" }}
              />
              <path
                d="M250 150 140 405"
                stroke="#D5B477"
                strokeOpacity="0.75"
                pathLength={1}
                className="genesis-draw"
                style={{ animationDelay: "2.05s" }}
              />
              <path
                d="M250 150 390 405"
                stroke="#D5B477"
                strokeOpacity="0.75"
                pathLength={1}
                className="genesis-draw"
                style={{ animationDelay: "2.25s" }}
              />
              <path
                d="M250 150 220 330"
                stroke="#D5B477"
                strokeOpacity="0.75"
                pathLength={1}
                className="genesis-draw"
                style={{ animationDelay: "2.45s" }}
              />
            </g>

            {/* Altitude: the fourth point is outside the plane */}
            <path
              d="M250 150 250 380"
              stroke="#E9DFC8"
              strokeOpacity="0.35"
              strokeWidth="1"
              strokeDasharray="3 4"
              pathLength={1}
              className="genesis-draw"
              style={{ animationDelay: "2.75s" }}
            />

            {/* Points */}
            <g>
              <circle cx="140" cy="405" r="4" fill="#508FCF" className="genesis-fade" style={{ animationDelay: "0.35s" }} />
              <circle cx="390" cy="405" r="4" fill="#C8873F" className="genesis-fade" style={{ animationDelay: "0.75s" }} />
              <circle cx="220" cy="330" r="4" fill="#36B5A0" className="genesis-fade" style={{ animationDelay: "1.15s" }} />
              <circle cx="250" cy="150" r="5" fill="#D5B477" className="genesis-fade" style={{ animationDelay: "1.75s" }} />
            </g>

            {/* Stage markers */}
            <g
              fontFamily="var(--font-mono)"
              fontSize="10"
              letterSpacing="2"
              fill="#E9DFC8"
              fillOpacity="0.55"
              className="genesis-fade"
              style={{ animationDelay: "2.9s" }}
            >
              <text x="130" y="432" textAnchor="end">
                I
              </text>
              <text x="400" y="432" textAnchor="start">
                II
              </text>
              <text x="208" y="322" textAnchor="end">
                III
              </text>
              <text x="238" y="142" textAnchor="end">
                IV
              </text>
            </g>
          </svg>
          <figcaption className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Symbolic geometry. Not runtime data.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
