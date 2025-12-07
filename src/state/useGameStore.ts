import { create } from "zustand";
import { CARDS, buildStarterDeck } from "../core/cardsDb";
import { createInitialState, GameState } from "../core/gameState";
import { endTurn as endTurnRule } from "../core/turnSystem";
import { shuffle } from "../utils/shuffle";
import { CardDef, UnitOnBoard } from "../core/cardTypes";

type Store = GameState & {
  newGame: () => void;
  draw: (n?: number) => void;
  playCard: (cardId: string) => void;
  endTurn: () => void;
};

function toCardDefs(ids: string[]): CardDef[] {
  return ids.map(id => CARDS[id]);
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const useGameStore = create<Store>((set, get) => ({
  ...createInitialState(),

  newGame: () => {
    const deckIds = buildStarterDeck();
    const deck = shuffle(toCardDefs(deckIds));
    set({
      ...createInitialState(),
      deck
    });
    // draw starting hand (5 like HS)
    get().draw(5);
  },

  draw: (n = 1) => {
    const { deck, hand } = get();
    if (deck.length === 0) return;
    const drawn = deck.slice(0, n);
    set({
      deck: deck.slice(n),
      hand: [...hand, ...drawn]
    });
  },

  playCard: (cardId: string) => {
    const { hand, playerMana, battlefield, maxBoardSlots } = get();
    const idx = hand.findIndex(c => c.id === cardId);
    if (idx === -1) return;

    const card = hand[idx];

    // rule checks
    if (card.mana > playerMana) return;                  // not enough mana
    if (battlefield.length >= maxBoardSlots) return;     // board full

    const unit: UnitOnBoard = {
      uid: uid(),
      base: card,
      damage: 0,
      exhausted: true  // summoning sickness placeholder
    };

    set({
      playerMana: playerMana - card.mana,
      hand: hand.filter((_, i) => i !== idx),
      battlefield: [...battlefield, unit]
    });
  },

  endTurn: () => {
    const next = endTurnRule(get());
    set(next);
    // auto-draw 1 at start of our next turn (keeps the loop feeling alive)
    get().draw(1);
  }
}));
