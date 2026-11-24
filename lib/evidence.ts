import type { EvidenceState, ExecutionMode, FreshnessState, QualificationState } from "./types";

export const MODE_TONE: Record<ExecutionMode, string> = {
  LIVE: "border-negative/40 text-negative",
  PAPER: "border-warning/40 text-warning",
  REPLAY: "border-agent-m02/40 text-agent-m02",
  FIXTURE: "border-unknown/40 text-unknown",
};

export const EVIDENCE_TONE: Record<EvidenceState, string> = {
  VERIFIED: "border-positive/40 text-positive",
  OBSERVED: "border-agent-m01/40 text-agent-m01",
  INFERRED: "border-warning/40 text-warning",
  UNKNOWN: "border-unknown/40 text-unknown",
};

export const FRESHNESS_TONE: Record<FreshnessState, string> = {
  CURRENT: "border-positive/40 text-positive",
  DELAYED: "border-warning/40 text-warning",
  STALE: "border-negative/40 text-negative",
  UNAVAILABLE: "border-unknown/40 text-unknown",
};

export const QUALIFICATION_TONE: Record<QualificationState, string> = {
  EXPLORATORY: "border-warning/40 text-warning",
  PARTIAL: "border-warning/40 text-warning",
  QUALIFIED: "border-positive/40 text-positive",
  BLOCKED: "border-negative/40 text-negative",
  UNVERIFIED: "border-unknown/40 text-unknown",
};

export const AGENT_TONE: Record<string, string> = {
  M01: "text-agent-m01 border-agent-m01/40",
  M02: "text-agent-m02 border-agent-m02/40",
  M03: "text-agent-m03 border-agent-m03/40",
  M04: "text-agent-m04 border-agent-m04/40",
};

export const AGENT_HEX: Record<string, string> = {
  M01: "#508FCF",
  M02: "#A78BFA",
  M03: "#36B5A0",
  M04: "#D5B477",
};

export function familyForAgent(eventType: string): string {
  if (eventType.startsWith("candidate") || eventType.startsWith("scan")) return "M01";
  if (eventType.startsWith("narrative")) return "M02";
  if (eventType.startsWith("ecosystem")) return "M03";
  if (eventType.startsWith("decision") || eventType.startsWith("policy") || eventType.startsWith("position")) return "M04";
  if (eventType.startsWith("treasury")) return "M04";
  if (eventType.startsWith("fee") || eventType.startsWith("payment")) return "M04";
  if (eventType.startsWith("provider")) return "M03";
  return "M04";
}
