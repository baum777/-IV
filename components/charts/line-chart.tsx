import { EmptyState } from "@/components/ui/primitives";

interface Point {
  x: string;
  y: number | null;
}

export function LineChart({
  points,
  height = 120,
  color = "#C4A36E",
  label,
  unavailable,
}: {
  points: Point[];
  height?: number;
  color?: string;
  label: string;
  unavailable?: string;
}) {
  const valid = points.filter((point): point is { x: string; y: number } => point.y !== null && Number.isFinite(point.y));
  if (valid.length < 2) {
    return (
      <EmptyState
        title={unavailable ?? "Not enough observed points to draw a series."}
        description="The observatory does not interpolate missing evidence as if it were observed data."
      />
    );
  }
  const width = 640;
  const padding = 8;
  const values = valid.map((point) => point.y);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = (width - padding * 2) / (valid.length - 1);
  const path = valid
    .map((point, index) => {
      const x = padding + index * step;
      const y = height - padding - ((point.y - min) / span) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${path} L${width - padding},${height - padding} L${padding},${height - padding} Z`;

  return (
    <figure className="min-w-0">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={label}>
        <defs>
          <linearGradient id={`fill-${label.replaceAll(" ", "-")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#fill-${label.replaceAll(" ", "-")})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {valid.map((point, index) => {
          const x = padding + index * step;
          const y = height - padding - ((point.y - min) / span) * (height - padding * 2);
          return <circle key={`${point.x}-${index}`} cx={x} cy={y} r="1.8" fill={color} />;
        })}
      </svg>
      <figcaption className="mt-1 flex items-center justify-between font-mono text-[9px] text-text-muted">
        <span>{valid[0].x}</span>
        <span>{label}</span>
        <span>{valid[valid.length - 1].x}</span>
      </figcaption>
    </figure>
  );
}
