import type { GameState } from "./gameState";
import type { PlayerId } from "./cardTypes";

function readyUnits(state: GameState, owner: PlayerId) {
  return state.battlefieldUnits.map(u => (u.owner === owner ? { ...u, exhausted: false } : u));
}

/**
 * Advance to the start of the specified player's turn, refreshing their units,
 * incrementing mana (cap 10), and drawing one card if available.
 * The turn counter increments only on the local player's turn so "turn 3" maps
 * to "your third turn" like Hearthstone.
 */
export function startTurn(state: GameState, player: PlayerId): GameState {
  const isPlayer = player === "player";
  const deck = isPlayer ? state.deck : state.enemyDeck;
  const hand = isPlayer ? state.hand : state.enemyHand;
  const drawCount = deck.length > 0 ? 1 : 0;
  const drawn = deck.slice(0, drawCount);
  const remainingDeck = deck.slice(drawCount);

  const manaKey = isPlayer ? "playerMana" : "enemyMana";
  const maxKey = isPlayer ? "maxMana" : "enemyMaxMana";
  const deckKey = isPlayer ? "deck" : "enemyDeck";
  const handKey = isPlayer ? "hand" : "enemyHand";
  const heroPowerKey = isPlayer ? "playerHeroPowerUsed" : "enemyHeroPowerUsed";

  const currentMax = state[maxKey];
  const newMax = Math.min(10, currentMax + 1);

  return {
    ...state,
    turn: player,
    turnNumber: isPlayer ? state.turnNumber + 1 : state.turnNumber,
    [maxKey]: newMax,
    [manaKey]: newMax,
    [deckKey]: remainingDeck,
    [handKey]: [...hand, ...drawn],
    [heroPowerKey]: false,
    battlefieldUnits: readyUnits(state, player)
  } as GameState;
}
