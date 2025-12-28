import type { Card } from "../cards/CardRegistry";
import type { PlayerId } from "../engine/types";

export type CardDef = Card & {
  artSrc?: string;
};

export type { PlayerId };
