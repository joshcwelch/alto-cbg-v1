import { HeroId } from "../heroes/heroTypes";

export interface DeckMeta {
  id: string;
  name: string;
  heroId: HeroId;
  cards: string[];
  description?: string;
  starter?: boolean;
}

export const createStarterDeck = (heroId: HeroId, id: string, name: string, cards: string[]): DeckMeta => ({
  id,
  name,
  heroId,
  cards,
  starter: true
});
