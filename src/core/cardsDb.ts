console.log("Loading cardTypes from:", import.meta.url);
import type { CardDef } from "./cardTypes";

export const CARDS: Record<string, CardDef> = {
  "CELESTIAL_BEACON_MONK": {
    id: "CELESTIAL_BEACON_MONK",
    name: "Beacon Monk",
    cost: 1,
    attack: 1,
    health: 2,
    description: "Peaceful starter.",
    artSrc: "/assets/cards/beacon-monk.png"
  },
  "SUNLANCE_SCOUT": {
    id: "SUNLANCE_SCOUT",
    name: "Sunlance Scout",
    cost: 2,
    attack: 2,
    health: 2,
    description: "Quick to the front.",
    artSrc: "/assets/cards/sunlance-scout.png"
  },
  "CRYSTAL_ACOLYTE": {
    id: "CRYSTAL_ACOLYTE",
    name: "Crystal Acolyte",
    cost: 3,
    attack: 3,
    health: 3,
    description: "Supports the crystal choir.",
    artSrc: "/assets/cards/crystal-acolyte.png"
  },
  "SERAPHIC_WARDEN": {
    id: "SERAPHIC_WARDEN",
    name: "Seraphic Warden",
    cost: 4,
    attack: 4,
    health: 5,
    description: "Shields allies with radiant zeal.",
    artSrc: "/assets/cards/seraphic-warden.png"
  },
  "SUNLANCE_CHAMPION": {
    id: "SUNLANCE_CHAMPION",
    name: "Sunlance Champion",
    cost: 5,
    attack: 6,
    health: 5,
    description: "Commands the vanguard.",
    artSrc: "/assets/cards/sunlance-champion.png"
  },
  "VOID_HUSK": {
    id: "VOID_HUSK",
    name: "Husk",
    cost: 1,
    attack: 1,
    health: 1,
    description: "Void-born husk.",
    artSrc: "/assets/cards/beacon-monk.png"
  },
};

export function buildStarterDeck(): string[] {
  // 20-card demo deck, 2 copies each
  const ids = Object.keys(CARDS);
  return [
    ...ids, ...ids, ...ids, ...ids // quick filler = 20 cards (5 * 4 = 20)
  ].slice(0, 20);
}
