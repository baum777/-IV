import type { AgentId } from "@/lib/types";

/**
 * Presentation aliases for the four runtime instances (WO-012-A §7).
 *
 * Runtime identifiers, roles and routes are NOT changed here. These are
 * display-only archetypes used by the memetic landing layer. The
 * operational interface keeps using the raw agent registry.
 *
 * `loreColor` is the narrative accent for a given archetype. It is only
 * used inside narrative artwork (for example the Genesis geometry) and
 * never as an operational health indicator. `operationalColor` is the
 * colour already used by the public projection and stays authoritative
 * for agent identity in the observatory.
 */
export interface Archetype {
  id: AgentId;
  name: string;
  technicalRole: string;
  element: string;
  direction: string;
  principle: string;
  glyph: "eye" | "flame" | "pulse" | "hand";
  operationalColor: string;
  loreColor: string;
  route: string;
}

export const ARCHETYPES: readonly Archetype[] = [
  {
    id: "M01",
    name: "THE EYE",
    technicalRole: "Market Scout",
    element: "Air",
    direction: "East",
    principle: "Perception",
    glyph: "eye",
    operationalColor: "#508FCF",
    loreColor: "#508FCF",
    route: "/desk/market",
  },
  {
    id: "M02",
    name: "THE FLAME",
    technicalRole: "Memetic Mind",
    element: "Fire",
    direction: "South",
    principle: "Meaning",
    glyph: "flame",
    operationalColor: "#A78BFA",
    loreColor: "#C8873F",
    route: "/desk/memetic",
  },
  {
    id: "M03",
    name: "THE PULSE",
    technicalRole: "Ecosystem Watcher",
    element: "Water",
    direction: "West",
    principle: "Preservation",
    glyph: "pulse",
    operationalColor: "#36B5A0",
    loreColor: "#36B5A0",
    route: "/desk/ecosystem",
  },
  {
    id: "M04",
    name: "THE HAND",
    technicalRole: "Decision Executor",
    element: "Earth",
    direction: "North",
    principle: "Manifestation",
    glyph: "hand",
    operationalColor: "#D5B477",
    loreColor: "#D5B477",
    route: "/desk/decisions",
  },
] as const;

export const ARCHETYPE_BY_ID = Object.fromEntries(
  ARCHETYPES.map((archetype) => [archetype.id, archetype]),
) as Record<AgentId, Archetype>;
