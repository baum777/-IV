import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-gold">404</p>
      <h1 className="mt-3 font-display text-2xl text-text-primary">This record is not in the public projection.</h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        The requested route or record does not exist in the current snapshot. No private data is exposed by this
        response.
      </p>
      <Link href="/desk" className="mt-6 rounded border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-primary hover:border-brand-gold">
        Return to the Trading Desk
      </Link>
    </div>
  );
}
