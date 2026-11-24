import type { ReactNode } from "react";

import {
  EVIDENCE_TONE,
  FRESHNESS_TONE,
  MODE_TONE,
  QUALIFICATION_TONE,
} from "@/lib/evidence";
import { timestamp } from "@/lib/format";
import type { EvidenceState, ExecutionMode, FreshnessState, QualificationState } from "@/lib/types";

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
}) {
  return (
    <Tag className={cx("rounded-md border border-border bg-surface", className)}>
      {children}
    </Tag>
  );
}

export function PanelHeader({
  title,
  eyebrow,
  action,
  className,
}: {
  title: ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start justify-between gap-4 border-b border-border px-4 py-3", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">{eyebrow}</p>
        ) : null}
        <h2 className="truncate text-sm font-medium text-text-primary">{title}</h2>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatusPill({
  children,
  tone = "border-border text-text-secondary",
  className,
}: {
  children: ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        tone,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ExecutionModeIndicator({ mode }: { mode: ExecutionMode }) {
  return (
    <StatusPill tone={MODE_TONE[mode]}>
      <span className="inline-block size-1.5 rounded-full bg-current" />
      {mode}
    </StatusPill>
  );
}

export function EvidenceIndicator({ state }: { state: EvidenceState }) {
  return <StatusPill tone={EVIDENCE_TONE[state]}>{state}</StatusPill>;
}

export function FreshnessIndicator({ state }: { state: FreshnessState }) {
  return <StatusPill tone={FRESHNESS_TONE[state]}>{state}</StatusPill>;
}

export function QualificationIndicator({ state }: { state: QualificationState }) {
  return <StatusPill tone={QUALIFICATION_TONE[state]}>{state}</StatusPill>;
}

export function Timestamp({ value, label }: { value: string | null | undefined; label?: string }) {
  return (
    <span className="font-mono text-[11px] text-text-muted" title={value ?? undefined}>
      {label ? <span className="mr-1 text-text-muted/70">{label}</span> : null}
      {timestamp(value)}
    </span>
  );
}

export function SourceReference({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-[11px] text-brand-gold underline decoration-brand-gold/40 underline-offset-2 hover:decoration-brand-gold"
    >
      {children}
    </a>
  );
}

export function DataUnavailable({ reason }: { reason: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-dashed border-border px-3 py-2">
      <span className="font-mono text-xs text-unknown">—</span>
      <span className="text-right text-[11px] leading-tight text-text-muted">{reason}</span>
    </div>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: string;
}) {
  return (
    <div className="min-w-0 border-border px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className={cx("mt-1 truncate font-mono text-lg tabular-nums text-text-primary", tone)}>{value}</p>
      {hint ? <p className="mt-1 text-[11px] leading-tight text-text-muted">{hint}</p> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-gold">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-2xl font-medium tracking-tight text-text-primary md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-2 border border-dashed border-border px-4 py-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">No observed evidence</p>
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="max-w-md text-xs leading-relaxed text-text-secondary">{description}</p>
      {action}
    </div>
  );
}

export function InlineNote({ children }: { children: ReactNode }) {
  return (
    <p className="border-l border-brand-gold/40 pl-3 text-[11px] leading-relaxed text-text-muted">{children}</p>
  );
}
