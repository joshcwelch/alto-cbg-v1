export const HeroId = {
  VOID_LYRA: "VOID_LYRA",
  EMBER_THAROS: "EMBER_THAROS"
  // FUTURE_HERO: "FUTURE_HERO"
} as const;

export type HeroId = (typeof HeroId)[keyof typeof HeroId];

export interface HeroPassiveDef {
  name: string;
  description: string;
}

export interface HeroPowerDef {
  name: string;
  description: string;
  cost: number;
}

export interface HeroUltimateDef {
  name: string;
  description: string;
  cost: number;
}

export interface HeroDef {
  id: HeroId;
  name: string;
  faction: string;
  portraitPath: string;
  passive: HeroPassiveDef;
  heroPower: HeroPowerDef;
  ultimate: HeroUltimateDef;
  deckHooks: string[];
  starterDeckId: string;
}
