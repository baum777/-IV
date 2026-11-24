import Link from "next/link";

const ANCHORS = [
  { href: "#genesis", label: "Genesis" },
  { href: "#instances", label: "Instances" },
  { href: "#architecture", label: "Architecture" },
  { href: "#metabolism", label: "Metabolism" },
  { href: "#evidence", label: "Evidence" },
  { href: "#manifesto", label: "Manifesto" },
] as const;

/**
 * In-page navigation for the landing page anchors required by WO-012-A §4.
 * Sticky beneath the global header. Purely navigational; no client state.
 */
export function AnchorNav() {
  return (
    <nav
      aria-label="Landing page sections"
      className="sticky top-14 z-20 -mx-5 border-y border-[var(--brand-stone)] bg-background/90 backdrop-blur md:-mx-8 xl:-mx-12"
    >
      <div className="flex items-center gap-1 overflow-x-auto px-2 py-2">
        <span className="shrink-0 px-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Sections
        </span>
        {ANCHORS.map((anchor) => (
          <Link
            key={anchor.href}
            href={anchor.href}
            className="whitespace-nowrap rounded px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors hover:text-[var(--brand-alchemical)]"
          >
            {anchor.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
