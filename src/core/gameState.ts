import type { CardDef, BattlefieldUnit, PlayerId } from "./cardTypes";

export interface GameState {
  // turn/flow
  turn: PlayerId;
  turnNumber: number;
  winner: PlayerId | "draw" | null;

  // hero health
  playerHealth: number;
  enemyHealth: number;

  // mana crystals
  maxMana: number;      // player
  playerMana: number;   // player
  enemyMaxMana: number;
  enemyMana: number;

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
  turn: "player",
  turnNumber: 0,
  winner: null,
  playerHealth: 30,
  enemyHealth: 30,
  maxMana: 0,
  playerMana: 0,
  enemyMaxMana: 0,
  enemyMana: 0,
  deck: [],
  hand: [],
  enemyDeck: [],
  enemyHand: [],
  battlefieldUnits: [],
  maxBoardSlots: 7
});
