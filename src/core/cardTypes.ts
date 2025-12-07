export type CardID = string;

export interface CardDef {
  id: CardID;
  name: string;
  mana: number;
  attack: number;
  health: number;
  text?: string;
}

export interface UnitOnBoard {
  uid: string;        // unique instance for this battle
  base: CardDef;      // reference to card stats
  damage: number;     // damage taken
  exhausted: boolean; // prevents attacking the turn it is played (HS style)
}

export const __DEBUG = "CardTypes Loaded";
