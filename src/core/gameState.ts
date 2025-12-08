import type { CardDef, UnitOnBoard } from "./cardTypes";

export interface GameState {
  // mana
  maxMana: number;
  playerMana: number;

  // zones
  deck: CardDef[];     // top of deck is index 0
  hand: CardDef[];
  enemyDeck: CardDef[];
  enemyHand: CardDef[];
  battlefield: (UnitOnBoard | null)[]; // indexed board slots (player side for now)

  // config
  maxBoardSlots: number;
}

export const createInitialState = (): GameState => ({
  maxMana: 1,
  playerMana: 1,
  deck: [],
  hand: [],
  enemyDeck: [],
  enemyHand: [],
  battlefield: Array<UnitOnBoard | null>(5).fill(null),
  maxBoardSlots: 5
});
