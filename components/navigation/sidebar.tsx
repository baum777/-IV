"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS = [
  {
    label: "Trading Desk",
    items: [
      { href: "/desk", label: "Overview" },
      { href: "/desk/market", label: "M01 Market" },
      { href: "/desk/memetic", label: "M02 Memetic" },
      { href: "/desk/ecosystem", label: "M03 Ecosystem" },
      { href: "/desk/decisions", label: "M04 Decisions" },
      { href: "/desk/positions", label: "Positions" },
    ],
  },
  {
    label: "Economy",
    items: [
      { href: "/economy", label: "Economic Observatory" },
      { href: "/treasury", label: "Profit Treasury" },
    ],
  },
  {
    label: "Evidence",
    items: [
      { href: "/explorer", label: "Decision Explorer" },
      { href: "/research", label: "Research" },
      { href: "/system", label: "System Status" },
      { href: "/docs", label: "Living Whitepaper" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="hidden w-56 shrink-0 border-r border-border bg-surface/40 lg:block">
      <div className="sticky top-14 space-y-6 px-3 py-5">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/desk" && pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded px-2 py-1.5 text-[13px] transition-colors ${
                        active
                          ? "bg-surface-raised text-text-primary"
                          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
