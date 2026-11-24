"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/desk", label: "Desk", glyph: "▤" },
  { href: "/desk/market", label: "Agents", glyph: "◈" },
  { href: "/desk/positions", label: "Feed", glyph: "≡" },
  { href: "/economy", label: "Capital", glyph: "◇" },
  { href: "/explorer", label: "Proof", glyph: "◎" },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] ${
                  active ? "text-brand-gold" : "text-text-muted"
                }`}
              >
                <span aria-hidden className="text-sm leading-none">{item.glyph}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
