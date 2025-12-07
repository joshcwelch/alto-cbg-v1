export type Rarity = "common" | "rare" | "epic" | "legendary";
export type CardState = "idle" | "hover" | "drag" | "played" | "disabled";
export type Highlight = "friendly" | "danger" | "select" | null;
export type CardVisual = {
  id: string;
  name?: string;
  cost?: number;
  attack?: number;
  health?: number;
  text?: string;
  rarity?: Rarity;
  state?: CardState;
  highlight?: Highlight;
  emissiveBoost?: number;
  foil?: boolean;
  backId?: string | null;
  selectable?: boolean;
};
