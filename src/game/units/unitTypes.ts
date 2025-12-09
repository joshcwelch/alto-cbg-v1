import type { CardID, PlayerId } from "../../core/cardTypes";

export type UnitTokenId = string;

export interface UnitTokenRuntime {
  id: UnitTokenId;
  ownerId: PlayerId;
  cardId: CardID;
  portraitUrl?: string;
  attack: number;
  health: number;
  maxHealth: number;
  sleeping: boolean;
  shielded?: boolean;
  silenced?: boolean;
  rarity?: "common" | "rare" | "epic" | "legendary";
  faction?: string;
  status?: Array<"taunt" | "stealth" | "frozen" | "burning" | "poisoned" | "stunned">;
  laneIndex: number;
  slotIndex: number;
}
