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

export type PlayerId = "player" | "enemy";

export interface BattlefieldUnit {
  uid: string;        // unique instance for this battle
  cardId: CardID;     // reference to card stats
  owner: PlayerId;    // which side controls the unit
  lane: number;       // board lane index (0..NUM_LANES-1)
  damage: number;     // damage taken (so hp can be derived)
  exhausted: boolean; // prevents acting the turn it is played (HS style)
  attackBuff?: number;
  healthBuff?: number;
  rush?: boolean;
  tags?: string[];
}

export const __DEBUG = "CardTypes Loaded";
