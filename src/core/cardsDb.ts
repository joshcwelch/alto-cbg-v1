console.log("Loading cardTypes from:", import.meta.url);
import type { CardDef } from "./cardTypes";

export const CARDS: Record<string, CardDef> = {
  "CELESTIAL_BEACON_MONK": { id: "CELESTIAL_BEACON_MONK", name: "Beacon Monk", mana: 1, attack: 1, health: 2, text: "Peaceful starter." },
  "SUNLANCE_SCOUT":       { id: "SUNLANCE_SCOUT",       name: "Sunlance Scout", mana: 2, attack: 2, health: 2 },
  "CRYSTAL_ACOLYTE":      { id: "CRYSTAL_ACOLYTE",      name: "Crystal Acolyte", mana: 3, attack: 3, health: 3 },
  "SERAPHIC_WARDEN":      { id: "SERAPHIC_WARDEN",      name: "Seraphic Warden", mana: 4, attack: 4, health: 5 },
  "SUNLANCE_CHAMPION":    { id: "SUNLANCE_CHAMPION",    name: "Sunlance Champion", mana: 5, attack: 6, health: 5 },
};

export function buildStarterDeck(): string[] {
  // 20-card demo deck, 2 copies each
  const ids = Object.keys(CARDS);
  return [
    ...ids, ...ids, ...ids, ...ids // quick filler = 20 cards (5 * 4 = 20)
  ].slice(0, 20);
}
