import { create } from "zustand";
import { CARDS, buildStarterDeck } from "../core/cardsDb";
import type { GameState } from "../core/gameState";
import { createInitialState } from "../core/gameState";
import { endTurn as endTurnRule } from "../core/turnSystem";
import type { CardDef, UnitOnBoard } from "../core/cardTypes";
import { shuffle } from "../utils/shuffle";

type Store = GameState & {
  newGame: () => void;
  draw: (n?: number) => void;
  playCard: (cardId: string) => void;
  endTurn: () => void;
  syncHand: (newHand: CardDef[]) => void;
  openingHandDealt: boolean;
};

function toCardDefs(ids: string[]): CardDef[] {
  return ids.map(id => CARDS[id]);
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const useGameStore = create<Store>((set, get) => {
  const syncHand = (newHand: CardDef[]) => {
    set({ hand: newHand });
  };

  const dealOpeningHand = () => {
    const { openingHandDealt, deck } = get();
    if (openingHandDealt || deck.length === 0) return;

    const drawCount = Math.min(5, deck.length);
    const newHand = deck.slice(0, drawCount);
    const newDeck = deck.slice(drawCount);

    set({
      deck: newDeck,
      openingHandDealt: true
    });
    syncHand(newHand);
  };

  return {
    ...createInitialState(),
    openingHandDealt: false,
    syncHand,

    newGame: () => {
      const deckIds = buildStarterDeck();
      const deck = shuffle(toCardDefs(deckIds));
      set({
        ...createInitialState(),
        deck,
        openingHandDealt: false
      });
      // draw starting hand (5 like HS) exactly once per game start
      dealOpeningHand();
    },

    draw: (n = 1) => {
      const { deck, hand } = get();
      if (deck.length === 0) return;
      const drawCount = Math.min(n, deck.length);
      const drawn = deck.slice(0, drawCount);
      const newDeck = deck.slice(drawCount);
      const newHand = [...hand, ...drawn];

      set({
        deck: newDeck,
        hand: newHand
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
  };
});
