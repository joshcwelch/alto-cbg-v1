console.log("Loading cardTypes from:", import.meta.url);
import type { CardDef } from "./cardTypes";

// lightweight placeholder art as data URIs until real textures are available
const svgArt = (label: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 560'>
      <defs>
        <linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stop-color='${color}' stop-opacity='0.85'/>
          <stop offset='100%' stop-color='#0f1624' stop-opacity='0.95'/>
        </linearGradient>
      </defs>
      <rect width='400' height='560' rx='28' fill='url(#g)'/>
      <text x='200' y='280' fill='white' font-size='44' font-family='Segoe UI, Arial' text-anchor='middle' dominant-baseline='middle'>${label}</text>
    </svg>`
  )}`;

export const CARDS: Record<string, CardDef> = {
  "CELESTIAL_BEACON_MONK": {
    id: "CELESTIAL_BEACON_MONK",
    name: "Beacon Monk",
    mana: 1,
    attack: 1,
    health: 2,
    text: "Peaceful starter.",
    artSrc: svgArt("Beacon Monk", "#5b8def")
  },
  "SUNLANCE_SCOUT": {
    id: "SUNLANCE_SCOUT",
    name: "Sunlance Scout",
    mana: 2,
    attack: 2,
    health: 2,
    artSrc: svgArt("Sunlance Scout", "#f4a261")
  },
  "CRYSTAL_ACOLYTE": {
    id: "CRYSTAL_ACOLYTE",
    name: "Crystal Acolyte",
    mana: 3,
    attack: 3,
    health: 3,
    artSrc: svgArt("Crystal Acolyte", "#72d6ff")
  },
  "SERAPHIC_WARDEN": {
    id: "SERAPHIC_WARDEN",
    name: "Seraphic Warden",
    mana: 4,
    attack: 4,
    health: 5,
    artSrc: svgArt("Seraphic Warden", "#c084fc")
  },
  "SUNLANCE_CHAMPION": {
    id: "SUNLANCE_CHAMPION",
    name: "Sunlance Champion",
    mana: 5,
    attack: 6,
    health: 5,
    artSrc: svgArt("Sunlance Champion", "#f59e0b")
  },
};

export function buildStarterDeck(): string[] {
  // 20-card demo deck, 2 copies each
  const ids = Object.keys(CARDS);
  return [
    ...ids, ...ids, ...ids, ...ids // quick filler = 20 cards (5 * 4 = 20)
  ].slice(0, 20);
}
