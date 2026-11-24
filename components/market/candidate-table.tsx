import { EmptyState } from "@/components/ui/primitives";
import { age, number, shortAddress, usd } from "@/lib/format";
import type { Candidate } from "@/lib/types";

export function CandidateTable({ candidates }: { candidates: Candidate[] }) {
  if (!candidates.length) {
    return (
      <EmptyState
        title="No candidate was observed in this snapshot."
        description="Candidate tables are populated only from observed scanner output. Empty evidence is shown as empty, not as zero."
      />
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Mint</th>
            <th>Pool</th>
            <th>Age</th>
            <th className="text-right">Market cap</th>
            <th className="text-right">Liquidity</th>
            <th className="text-right">Volume</th>
            <th>Scanner</th>
            <th>Narrative</th>
            <th>Integrity</th>
            <th>Decision</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate, index) => (
            <tr key={`${candidate.mint ?? candidate.pool ?? "candidate"}-${index}`}>
              <td className="text-text-primary">{shortAddress(candidate.mint)}</td>
              <td>{shortAddress(candidate.pool)}</td>
              <td>{age(candidate.age_seconds)}</td>
              <td className="text-right tabular-nums">{usd(candidate.market_cap)}</td>
              <td className="text-right tabular-nums">{usd(candidate.liquidity)}</td>
              <td className="text-right tabular-nums">{number(candidate.volume)}</td>
              <td>{candidate.scanner ?? "—"}</td>
              <td>{candidate.narrative_match ?? "—"}</td>
              <td>{candidate.integrity_verdict ?? "—"}</td>
              <td>{candidate.decision_status ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
