import { create } from "zustand";
import { CARDS, buildStarterDeck } from "../core/cardsDb";
import type { GameState } from "../core/gameState";
import { createInitialState } from "../core/gameState";
import { endTurn as endTurnRule } from "../core/turnSystem";
import type { BattlefieldUnit, CardDef, PlayerId } from "../core/cardTypes";
import { shuffle } from "../utils/shuffle";

type Store = GameState & {
  newGame: () => void;
  draw: (n?: number) => void;
  playCard: (cardId: string, lane: number, playerId: PlayerId) => void;
  endTurn: () => void;
  syncHand: (newHand: CardDef[]) => void;
  syncEnemyHand: (newHand: CardDef[]) => void;
  openingHandDealt: boolean;
  draggingCardId: string | null;
  dragPreviewLane: number | null;
  setDragState: (cardId: string | null) => void;
  setDragPreviewLane: (slot: number | null) => void;
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

  const syncEnemyHand = (newHand: CardDef[]) => {
    set({ enemyHand: newHand });
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
    draggingCardId: null,
    dragPreviewLane: null,
    syncHand,
    syncEnemyHand,

    newGame: () => {
      const deckIds = buildStarterDeck();
      const deck = shuffle(toCardDefs(deckIds));
      const enemyDeckIds = buildStarterDeck();
      const enemyDeck = shuffle(toCardDefs(enemyDeckIds));

      const enemyDrawCount = Math.min(5, enemyDeck.length);
      const enemyOpeningHand = enemyDeck.slice(0, enemyDrawCount);
      const enemyRemainingDeck = enemyDeck.slice(enemyDrawCount);

      set({
        ...createInitialState(),
        deck,
        enemyDeck: enemyRemainingDeck,
        enemyHand: enemyOpeningHand,
        openingHandDealt: false,
        draggingCardId: null,
        dragPreviewLane: null
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

    playCard: (cardId: string, lane: number, playerId: PlayerId) => {
      const { hand, playerMana, battlefieldUnits, maxBoardSlots } = get();
      if (lane < 0 || lane >= maxBoardSlots) return;
      const idx = hand.findIndex(c => c.id === cardId);
      if (idx === -1) return;

      const card = hand[idx];

      // rule checks
      if (playerId === "player" && card.cost > playerMana) return; // not enough mana
      if (battlefieldUnits.some(u => u.lane === lane && u.owner === playerId)) return; // lane occupied

      const unit: BattlefieldUnit = {
        uid: uid(),
        cardId: card.id,
        owner: playerId,
        lane,
        damage: 0,
        exhausted: true
      };

      const updatedUnits = battlefieldUnits.concat(unit);

      set({
        playerMana: playerId === "player" ? playerMana - card.cost : playerMana,
        hand: hand.filter((_, i) => i !== idx),
        battlefieldUnits: updatedUnits,
        draggingCardId: null,
        dragPreviewLane: null
      });
    },

    setDragState: (cardId: string | null) => set({ draggingCardId: cardId }),
    setDragPreviewLane: (slot: number | null) => set({ dragPreviewLane: slot }),

    endTurn: () => {
      const next = endTurnRule(get());
      set(next);
      // auto-draw 1 at start of our next turn (keeps the loop feeling alive)
      get().draw(1);
    }
  };
});
