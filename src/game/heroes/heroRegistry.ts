import { HeroId, type HeroDef } from "./heroTypes";

export const HERO_REGISTRY: Record<HeroId, HeroDef> = {
  [HeroId.VOID_LYRA]: {
    id: HeroId.VOID_LYRA,
    name: "Lyra — Void Matron",
    faction: "Voidborn",
    passive: {
      name: "Whisper of the Abyss",
      description: "Whenever a friendly unit dies, gain 1 Void Charge. At 6 charges, auto-summon a Husk (1/1)."
    },
    heroPower: {
      name: "Corrupt Essence",
      description: "Destroy a friendly unit → Summon a Husk → Draw 1.",
      cost: 2
    },
    ultimate: {
      name: "Abyssal Rebirth",
      description: "Revive the last 2 friendly units that died this match with +2/+2 and “Corrupted”.",
      cost: 10
    },
    portraitPath: "/assets/heroes/lyra.png",
    deckHooks: [],
    starterDeckId: "starter-void-lyra"
  },
  [HeroId.EMBER_THAROS]: {
    id: HeroId.EMBER_THAROS,
    name: "Tharos — Lord of Embers",
    faction: "Ember Crown",
    passive: {
      name: "Emberbrand",
      description: "When the player takes damage, gain 1 Fury (max 10). At 10 Fury, next summoned unit gets +3/+0 & Rush."
    },
    heroPower: {
      name: "Flame Lash",
      description: "Deal 1 dmg to any unit or your hero. If the target survives, it gains +1/+0.",
      cost: 2
    },
    ultimate: {
      name: "Volcanic Ascension",
      description: "All friendly units gain +2/+1 & Rush; then your hero takes 3 damage.",
      cost: 10
    },
    portraitPath: "/assets/heroes/tharos.png",
    deckHooks: [],
    starterDeckId: "starter-ember-tharos"
  }
};
