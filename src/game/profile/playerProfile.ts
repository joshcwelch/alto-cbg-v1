import { buildStarterDeck } from "../../core/cardsDb";
import { createStarterDeck, type DeckMeta } from "../decks/deckTypes";
import { HERO_REGISTRY } from "../heroes/heroRegistry";
import { HeroId } from "../heroes/heroTypes";

type Profile = {
  selectedFaction: string | null;
  selectedHeroId: HeroId | null;
  selectedDeckId: string | null;
  decks: DeckMeta[];
};

const profile: Profile = {
  selectedFaction: null,
  selectedHeroId: null,
  selectedDeckId: null,
  decks: []
};

const ensureStarterDeckForHero = (heroId: HeroId): DeckMeta => {
  const hero = HERO_REGISTRY[heroId];
  const existing = profile.decks.find(d => d.heroId === heroId && d.id === hero.starterDeckId);
  if (existing) return existing;
  const starterCards = buildStarterDeck();
  const deck = createStarterDeck(heroId, hero.starterDeckId, `${hero.name} Starter`, starterCards);
  profile.decks.push(deck);
  return deck;
};

export const getProfile = (): Profile => {
  if (profile.selectedHeroId && profile.selectedDeckId) return profile;
  // set sensible defaults
  const defaultHero = profile.selectedHeroId ?? HeroId.VOID_LYRA;
  selectHero(defaultHero);
  return profile;
};

export const selectFaction = (faction: string) => {
  profile.selectedFaction = faction;
};

export const selectHero = (heroId: HeroId) => {
  profile.selectedHeroId = heroId;
  profile.selectedFaction = HERO_REGISTRY[heroId].faction;
  const starter = ensureStarterDeckForHero(heroId);
  profile.selectedDeckId = starter.id;
};

export const setSelectedDeck = (deckId: string) => {
  profile.selectedDeckId = deckId;
};

export const listDecksForHero = (heroId: HeroId): DeckMeta[] => {
  ensureStarterDeckForHero(heroId);
  return profile.decks.filter(d => d.heroId === heroId);
};

export const getSelectedDeck = (): DeckMeta | undefined => {
  if (!profile.selectedHeroId) return undefined;
  ensureStarterDeckForHero(profile.selectedHeroId);
  return profile.decks.find(d => d.id === profile.selectedDeckId || d.heroId === profile.selectedHeroId);
};
