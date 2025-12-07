export type CardID = string;

export interface CardDef {
  id: CardID;
  name: string;
  mana: number;
  attack: number;
  health: number;
  // image used for 3D/texture rendering
  artSrc: string;
  text?: string;
}

export interface UnitOnBoard {
  uid: string;        // unique instance for this battle
  base: CardDef;      // reference to card stats
  damage: number;     // damage taken
  exhausted: boolean; // prevents attacking the turn it is played (HS style)
  lane?: "top" | "middle" | "bottom" | -1 | 0 | 1; // optional lane indicator for positioning
}

export const __DEBUG = "CardTypes Loaded";
