import type { CardDef, BattlefieldUnit } from "./cardTypes";

export interface GameState {
  // mana
  maxMana: number;
  playerMana: number;

  // zones
  deck: CardDef[];     // top of deck is index 0
  hand: CardDef[];
  enemyDeck: CardDef[];
  enemyHand: CardDef[];
  battlefieldUnits: BattlefieldUnit[]; // indexed board slots (player side for now)

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
  battlefieldUnits: [],
  maxBoardSlots: 7
});
