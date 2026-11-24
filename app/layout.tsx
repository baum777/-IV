import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { MobileNav } from "@/components/navigation/mobile-nav";
import { Sidebar } from "@/components/navigation/sidebar";
import { SiteHeader } from "@/components/navigation/site-header";
import { getSnapshot } from "@/lib/data";

import "./globals.css";

const display = localFont({
  src: [{ path: "./fonts/space-grotesk-latin.woff2", weight: "400 600" }],
  variable: "--font-display",
  display: "swap",
});

const sans = localFont({
  src: [{ path: "./fonts/inter-latin.woff2", weight: "100 900" }],
  variable: "--font-sans",
  display: "swap",
});

const mono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400-latin.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-mono-500-latin.woff2", weight: "500" },
  ],
  variable: "--font-mono",
  display: "swap",
  adjustFontFallback: false,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://tatd-observatory.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "THE FOURTH — Intelligence Made Matter",
    template: "%s · THE FOURTH",
  },
  description:
    "THE FOURTH is the memetic identity of TATD: four intelligence instances, one economic system. A read-only public observatory of decisions, evidence and economic state.",
  applicationName: "THE FOURTH Observatory",
  keywords: ["THE FOURTH", "TATD", "$IV", "autonomous trading", "agent observatory", "evidence", "Solana"],
  openGraph: {
    type: "website",
    siteName: "THE FOURTH Observatory",
    title: "THE FOURTH — Intelligence Made Matter",
    description: "Four instances. One economic system. The narrative is the invitation; the observatory is the evidence.",
    url: appUrl,
    images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: "THE FOURTH — Intelligence Made Matter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "THE FOURTH — Intelligence Made Matter",
    description: "Four instances. One economic system. A public read-only observatory.",
    images: ["/brand/og.png"],
  },
  icons: { icon: "/brand/favicon.svg" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#090B0F",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const snapshot = await getSnapshot();
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface-raised focus:px-3 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <SiteHeader snapshot={snapshot} />
        <div className="mx-auto flex w-full max-w-[1440px]">
          <Sidebar />
          <main id="main" className="min-w-0 flex-1 pb-20 lg:pb-10">
            {children}
          </main>
        </div>
        <MobileNav />
        <footer className="border-t border-border px-4 py-6 text-[11px] text-text-muted md:px-6">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2">
            <p>Public Proof of Concept · Read-only Observatory · Experimental system</p>
            <p>Not financial advice. No guaranteed returns. Digital assets carry risk.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
