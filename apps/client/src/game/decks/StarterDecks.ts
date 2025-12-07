import { CARDS as CardRegistry } from "../../../../../src/core/cardsDb";
import type { CardDef } from "../../../../../src/core/cardTypes";

export type Faction = "CELESTIAL" | "EMBER" | "SYLVAN" | "VOIDBORN";

export interface StarterDeck {
  id: string;              // O|A|R1|R2 (or descriptive string)
  name: string;            // e.g. "Radiant Control"
  faction: Faction;
  description: string;     // readable onboarding blurb
  cards: string[];         // list of CardRegistry IDs (30 cards)
}

export const StarterDeckIDs = {
  ORDER: "ORDER",
  AGGRO: "AGGRO",
  REGROWTH: "REGROWTH",
  RIFTBORN: "RIFTBORN",
} as const;

export type StarterDeckID = (typeof StarterDeckIDs)[keyof typeof StarterDeckIDs];

const DECK_SIZE = 30;
const registry = CardRegistry as Record<string, CardDef>;

const ORDER: StarterDeck = {
  id: StarterDeckIDs.ORDER,
  name: "Radiant Control",
  faction: "CELESTIAL",
  description: "Sustain-focused control that teaches timing, removal discipline, and healing value trades.",
  cards: [
    "CELESTIAL_RADIANT_BARRIER",
    "CELESTIAL_RADIANT_BARRIER",
    "CELESTIAL_RADIANT_BARRIER",
    "CELESTIAL_BLESSING_OF_ALTLIGHT",
    "CELESTIAL_BLESSING_OF_ALTLIGHT",
    "CELESTIAL_BLESSING_OF_ALTLIGHT",
    "CELESTIAL_CRYSTAL_ACOLYTE",
    "CELESTIAL_CRYSTAL_ACOLYTE",
    "CELESTIAL_CRYSTAL_ACOLYTE",
    "CELESTIAL_CRYSTAL_ACOLYTE",
    "CELESTIAL_LIGHTBORN_ADEPT",
    "CELESTIAL_LIGHTBORN_ADEPT",
    "CELESTIAL_LIGHTBORN_ADEPT",
    "CELESTIAL_LIGHTBORN_ADEPT",
    "CELESTIAL_DAWNWATCH_CLERIC",
    "CELESTIAL_DAWNWATCH_CLERIC",
    "CELESTIAL_DAWNWATCH_CLERIC",
    "CELESTIAL_DAWNWATCH_CLERIC",
    "CELESTIAL_ALTIGHT_SPARKCASTER",
    "CELESTIAL_ALTIGHT_SPARKCASTER",
    "CELESTIAL_ALTIGHT_SPARKCASTER",
    "CELESTIAL_JUDGMENT_BEAM",
    "CELESTIAL_JUDGMENT_BEAM",
    "CELESTIAL_JUDGMENT_BEAM",
    "CELESTIAL_COVENANT_SEAL",
    "CELESTIAL_COVENANT_SEAL",
    "CELESTIAL_COVENANT_SEAL",
    "CELESTIAL_GUARDIAN_OF_PEAKS",
    "CELESTIAL_GUARDIAN_OF_PEAKS",
    "CELESTIAL_GUARDIAN_OF_PEAKS",
  ],
};

const AGGRO: StarterDeck = {
  id: StarterDeckIDs.AGGRO,
  name: "Ashen Rush",
  faction: "EMBER",
  description: "Low-curve pressure and burn that rewards pacing, efficient trades, and recognizing lethal windows.",
  cards: [
    "EMBER_EMBER_BOLT",
    "EMBER_EMBER_BOLT",
    "EMBER_EMBER_BOLT",
    "EMBER_EMBER_BOLT",
    "EMBER_EMBER_BOLT",
    "EMBER_EMBER_BOLT",
    "EMBER_LAVA_IMP",
    "EMBER_LAVA_IMP",
    "EMBER_LAVA_IMP",
    "EMBER_LAVA_IMP",
    "EMBER_LAVA_IMP",
    "EMBER_LAVA_IMP",
    "EMBER_EMBERFORGED_BERSERKER",
    "EMBER_EMBERFORGED_BERSERKER",
    "EMBER_EMBERFORGED_BERSERKER",
    "EMBER_EMBERFORGED_BERSERKER",
    "EMBER_EMBERFORGED_BERSERKER",
    "EMBER_EMBERFORGED_BERSERKER",
    "EMBER_MOLTEN_SHIELD",
    "EMBER_MOLTEN_SHIELD",
    "EMBER_MOLTEN_SHIELD",
    "EMBER_MOLTEN_SHIELD",
    "EMBER_FIRESTORM_RITUAL",
    "EMBER_FIRESTORM_RITUAL",
    "EMBER_FIRESTORM_RITUAL",
    "EMBER_FIRESTORM_RITUAL",
    "EMBER_CROWN_OF_ASH",
    "EMBER_CROWN_OF_ASH",
    "EMBER_CROWN_OF_ASH",
    "EMBER_VOLCANO_TITAN",
  ],
};

const REGROWTH: StarterDeck = {
  id: StarterDeckIDs.REGROWTH,
  name: "Verdant Swarm",
  faction: "SYLVAN",
  description: "Board-based midrange that spotlights sticky beasts, buff timing, and steady healing to win the board.",
  cards: [
    "SYLVAN_ELDERWOOD_WOLF",
    "SYLVAN_ELDERWOOD_WOLF",
    "SYLVAN_ELDERWOOD_WOLF",
    "SYLVAN_ELDERWOOD_WOLF",
    "SYLVAN_ELDERWOOD_WOLF",
    "SYLVAN_ELDERWOOD_WOLF",
    "SYLVAN_VERDANT_PROTECTOR",
    "SYLVAN_VERDANT_PROTECTOR",
    "SYLVAN_VERDANT_PROTECTOR",
    "SYLVAN_VERDANT_PROTECTOR",
    "SYLVAN_VERDANT_PROTECTOR",
    "SYLVAN_VERDANT_PROTECTOR",
    "SYLVAN_SILVERFANG",
    "SYLVAN_SILVERFANG",
    "SYLVAN_SILVERFANG",
    "SYLVAN_SILVERFANG",
    "SYLVAN_SILVERFANG",
    "SYLVAN_SILVERFANG",
    "SYLVAN_FORESTS_BLESSING",
    "SYLVAN_FORESTS_BLESSING",
    "SYLVAN_FORESTS_BLESSING",
    "SYLVAN_FORESTS_BLESSING",
    "SYLVAN_FORESTS_BLESSING",
    "SYLVAN_FORESTS_BLESSING",
    "SYLVAN_ROOTSNARL_GUARDIAN",
    "SYLVAN_ROOTSNARL_GUARDIAN",
    "SYLVAN_ROOTSNARL_GUARDIAN",
    "SYLVAN_ROOTSNARL_GUARDIAN",
    "SYLVAN_ROOTSNARL_GUARDIAN",
    "SYLVAN_ROOTSNARL_GUARDIAN",
  ],
};

const RIFTBORN: StarterDeck = {
  id: StarterDeckIDs.RIFTBORN,
  name: "Shardbound Drain",
  faction: "VOIDBORN",
  description: "Disruptive drain and sacrifice payoffs that teach timing around death effects and value swings.",
  cards: [
    "VOID_HUSKCALLER",
    "VOID_HUSKCALLER",
    "VOID_HUSKCALLER",
    "VOID_HUSKCALLER",
    "VOID_HUSKCALLER",
    "VOID_HUSKCALLER",
    "VOID_SHARDLANDS_WRAITH",
    "VOID_SHARDLANDS_WRAITH",
    "VOID_SHARDLANDS_WRAITH",
    "VOID_SHARDLANDS_WRAITH",
    "VOID_SHARDLANDS_WRAITH",
    "VOID_SHARDLANDS_WRAITH",
    "VOID_MATRONS_GRIMOIRE",
    "VOID_MATRONS_GRIMOIRE",
    "VOID_MATRONS_GRIMOIRE",
    "VOID_MATRONS_GRIMOIRE",
    "VOID_MATRONS_GRIMOIRE",
    "VOID_MATRONS_GRIMOIRE",
    "VOID_ABYSSBOUND_SPECTER",
    "VOID_ABYSSBOUND_SPECTER",
    "VOID_ABYSSBOUND_SPECTER",
    "VOID_ABYSSBOUND_SPECTER",
    "VOID_ABYSSBOUND_SPECTER",
    "VOID_ABYSSBOUND_SPECTER",
    "VOID_DARK_CONVERSION",
    "VOID_DARK_CONVERSION",
    "VOID_DARK_CONVERSION",
    "VOID_DARK_CONVERSION",
    "VOID_DARK_CONVERSION",
    "VOID_DARK_CONVERSION",
  ],
};

export const StarterDecks: Record<string, StarterDeck> = { ORDER, AGGRO, REGROWTH, RIFTBORN };

function validateDeck(deck: StarterDeck) {
  if (deck.cards.length !== DECK_SIZE) {
    console.warn(`[StarterDecks] Deck "${deck.id}" has ${deck.cards.length} cards (expected ${DECK_SIZE}).`);
  }
  const missing = deck.cards.filter(id => !registry[id]);
  if (missing.length > 0) {
    const unique = Array.from(new Set(missing));
    console.warn(`[StarterDecks] Missing CardRegistry IDs for deck "${deck.id}": ${unique.join(", ")}`);
  }
}

Object.values(StarterDecks).forEach(validateDeck);

export function getStarterDeck(id: StarterDeckID): StarterDeck | undefined {
  const deck = StarterDecks[id];
  if (!deck) return undefined;
  return {
    ...deck,
    cards: [...deck.cards],
  };
}
