export type CardID = string;

export interface CardDef {
  id: CardID;
  name: string;
  cost: number;
  attack: number;
  health: number;
  // image used for 3D/texture rendering
  artSrc: string;
  description?: string;
}

export interface UnitOnBoard {
  uid: string;        // unique instance for this battle
  base: CardDef;      // reference to card stats
  damage: number;     // damage taken
  exhausted: boolean; // prevents attacking the turn it is played (HS style)
  slot: number;       // board slot index (0..maxSlots-1)
}

export const __DEBUG = "CardTypes Loaded";
