import type { GameState } from "./gameState";

export function endTurn(state: GameState): GameState {
  const newMax = Math.min(10, state.maxMana + 1);
  return {
    ...state,
    maxMana: newMax,
    playerMana: newMax,
    battlefield: state.battlefield.map(u => ({ ...u, exhausted: false }))
  };
}
