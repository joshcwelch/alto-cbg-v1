import { create } from "zustand";
import { CARDS, buildStarterDeck } from "../core/cardsDb";
import type { GameState } from "../core/gameState";
import { createInitialState } from "../core/gameState";
import { startTurn as startTurnRule } from "../core/turnSystem";
import type { BattlefieldUnit, CardDef, PlayerId } from "../core/cardTypes";
import { shuffle } from "../utils/shuffle";

type AttackTarget =
  | { type: "unit"; targetUid: string }
  | { type: "hero"; playerId: PlayerId };

type Store = GameState & {
  newGame: () => void;
  draw: (n?: number, playerId?: PlayerId) => void;
  playCard: (cardId: string, lane: number, playerId: PlayerId) => boolean;
  playEnemyCard: (cardId: string, lane: number) => boolean;
  attackUnit: (attackerUid: string, target: AttackTarget) => boolean;
  autoEnemyTurn: () => void;
  endTurn: () => void;
  syncHand: (newHand: CardDef[]) => void;
  syncEnemyHand: (newHand: CardDef[]) => void;
  openingHandDealt: boolean;
  draggingCardId: string | null;
  dragPreviewLane: number | null;
  selectedAttackerId: string | null;
  setSelectedAttacker: (uid: string | null) => void;
  setDragState: (cardId: string | null) => void;
  setDragPreviewLane: (slot: number | null) => void;
};

const STARTING_HAND = { player: 3, enemy: 4 };

function toCardDefs(ids: string[]): CardDef[] {
  return ids.map(id => CARDS[id]);
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function findOpenLane(owner: PlayerId, units: BattlefieldUnit[], maxBoardSlots: number): number | null {
  return Array.from({ length: maxBoardSlots }, (_, lane) => lane).find(
    lane => units.every(u => !(u.owner === owner && u.lane === lane))
  ) ?? null;
}

function resolveWinner(playerHealth: number, enemyHealth: number): PlayerId | "draw" | null {
  const playerDead = playerHealth <= 0;
  const enemyDead = enemyHealth <= 0;
  if (playerDead && enemyDead) return "draw";
  if (enemyDead) return "player";
  if (playerDead) return "enemy";
  return null;
}

export const useGameStore = create<Store>((set, get) => {
  const syncHand = (newHand: CardDef[]) => set({ hand: newHand });
  const syncEnemyHand = (newHand: CardDef[]) => set({ enemyHand: newHand });

  const beginTurn = (who: PlayerId) => {
    set(state => ({
      ...startTurnRule(state, who),
      selectedAttackerId: null,
      draggingCardId: null,
      dragPreviewLane: null
    }));
  };

  const removeDeadUnits = (units: BattlefieldUnit[]) =>
    units.filter(u => {
      const def = CARDS[u.cardId];
      return def && u.damage < def.health;
    });

  return {
    ...createInitialState(),
    openingHandDealt: false,
    draggingCardId: null,
    dragPreviewLane: null,
    selectedAttackerId: null,
    syncHand,
    syncEnemyHand,
    setSelectedAttacker: uid => set({ selectedAttackerId: uid }),

    newGame: () => {
      const deckIds = buildStarterDeck();
      const deck = shuffle(toCardDefs(deckIds));
      const enemyDeckIds = buildStarterDeck();
      const enemyDeck = shuffle(toCardDefs(enemyDeckIds));

      const playerDraw = Math.min(STARTING_HAND.player, deck.length);
      const enemyDraw = Math.min(STARTING_HAND.enemy, enemyDeck.length);

      const playerOpeningHand = deck.slice(0, playerDraw);
      const remainingDeck = deck.slice(playerDraw);
      const enemyOpeningHand = enemyDeck.slice(0, enemyDraw);
      const enemyRemainingDeck = enemyDeck.slice(enemyDraw);

      set({
        ...createInitialState(),
        deck: remainingDeck,
        hand: playerOpeningHand,
        enemyDeck: enemyRemainingDeck,
        enemyHand: enemyOpeningHand,
        openingHandDealt: true,
        draggingCardId: null,
        dragPreviewLane: null,
        selectedAttackerId: null
      });

      beginTurn("player");
    },

    draw: (n = 1, playerId: PlayerId = "player") => {
      const state = get();
      const isPlayer = playerId === "player";
      const deck = isPlayer ? state.deck : state.enemyDeck;
      const hand = isPlayer ? state.hand : state.enemyHand;
      if (deck.length === 0) return;
      const drawCount = Math.min(n, deck.length);
      const drawn = deck.slice(0, drawCount);
      const newDeck = deck.slice(drawCount);
      const newHand = [...hand, ...drawn];

      set({
        deck: isPlayer ? newDeck : state.deck,
        enemyDeck: isPlayer ? state.enemyDeck : newDeck,
        hand: isPlayer ? newHand : state.hand,
        enemyHand: isPlayer ? state.enemyHand : newHand
      });
    },

    playCard: (cardId: string, lane: number, playerId: PlayerId) => {
      const state = get();
      if (state.winner || state.turn !== playerId) return false;
      const { hand, enemyHand, playerMana, enemyMana, battlefieldUnits, maxBoardSlots } = state;
      if (lane < 0 || lane >= maxBoardSlots) return false;
      const isPlayer = playerId === "player";
      const sourceHand = isPlayer ? hand : enemyHand;
      const idx = sourceHand.findIndex(c => c.id === cardId);
      if (idx === -1) return false;

      const card = sourceHand[idx];

      const manaPool = isPlayer ? playerMana : enemyMana;
      if (card.cost > manaPool) return false; // not enough mana
      if (battlefieldUnits.some(u => u.lane === lane && u.owner === playerId)) return false; // lane occupied

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
        playerMana: isPlayer ? playerMana - card.cost : playerMana,
        enemyMana: isPlayer ? enemyMana : enemyMana - card.cost,
        hand: isPlayer ? hand.filter((_, i) => i !== idx) : hand,
        enemyHand: isPlayer ? enemyHand : enemyHand.filter((_, i) => i !== idx),
        battlefieldUnits: updatedUnits,
        draggingCardId: null,
        dragPreviewLane: null
      });
      return true;
    },
    playEnemyCard: (cardId: string, lane: number) => get().playCard(cardId, lane, "enemy"),

    attackUnit: (attackerUid: string, target: AttackTarget) => {
      const state = get();
      if (state.winner) return false;
      const attacker = state.battlefieldUnits.find(u => u.uid === attackerUid);
      if (!attacker) return false;
      if (attacker.owner !== state.turn) return false;
      if (attacker.exhausted) return false;

      const attackerCard = CARDS[attacker.cardId];
      if (!attackerCard) return false;

      let nextUnits = state.battlefieldUnits.slice();
      let playerHealth = state.playerHealth;
      let enemyHealth = state.enemyHealth;

      if (target.type === "unit") {
        const defender = nextUnits.find(u => u.uid === target.targetUid);
        if (!defender || defender.owner === attacker.owner) return false;
        const defenderCard = CARDS[defender.cardId];
        if (!defenderCard) return false;

        nextUnits = nextUnits.map(u => {
          if (u.uid === attacker.uid) {
            return { ...u, damage: u.damage + defenderCard.attack, exhausted: true };
          }
          if (u.uid === defender.uid) {
            return { ...u, damage: u.damage + attackerCard.attack };
          }
          return u;
        });
        nextUnits = removeDeadUnits(nextUnits);
      } else {
        if (target.playerId === attacker.owner) return false;
        if (target.playerId === "enemy") {
          enemyHealth = Math.max(0, enemyHealth - attackerCard.attack);
        } else {
          playerHealth = Math.max(0, playerHealth - attackerCard.attack);
        }
        nextUnits = nextUnits.map(u => (u.uid === attacker.uid ? { ...u, exhausted: true } : u));
      }

      const winner = resolveWinner(playerHealth, enemyHealth);
      set({
        battlefieldUnits: nextUnits,
        playerHealth,
        enemyHealth,
        selectedAttackerId: null,
        winner
      });
      return true;
    },

    setDragState: (cardId: string | null) => set({ draggingCardId: cardId }),
    setDragPreviewLane: (slot: number | null) => set({ dragPreviewLane: slot }),

    autoEnemyTurn: () => {
      const current = get();
      if (current.winner) return;

      beginTurn("enemy");

      let playSafety = 0;
      while (playSafety++ < 12) {
        const { enemyHand, enemyMana, maxBoardSlots, battlefieldUnits, winner } = get();
        if (winner) break;
        const playable = enemyHand.filter(c => c.cost <= enemyMana);
        if (playable.length === 0) break;
        const openLane = findOpenLane("enemy", battlefieldUnits, maxBoardSlots);
        if (openLane == null) break;
        const chosen = playable.sort((a, b) => (b.attack - a.attack) || (b.cost - a.cost))[0];
        const played = get().playEnemyCard(chosen.id, openLane);
        if (!played) break;
      }

      let attackSafety = 0;
      while (attackSafety++ < 20) {
        const { battlefieldUnits, winner } = get();
        if (winner) break;
        const ready = battlefieldUnits.find(u => u.owner === "enemy" && !u.exhausted);
        if (!ready) break;
        const target = battlefieldUnits.find(u => u.owner === "player" && u.lane === ready.lane);
        if (target) {
          get().attackUnit(ready.uid, { type: "unit", targetUid: target.uid });
        } else {
          get().attackUnit(ready.uid, { type: "hero", playerId: "player" });
        }
      }

      if (!get().winner) {
        beginTurn("player");
      }
    },

    endTurn: () => {
      const { turn, winner } = get();
      if (winner || turn !== "player") return;
      get().setSelectedAttacker(null);
      get().autoEnemyTurn();
    }
  };
});
