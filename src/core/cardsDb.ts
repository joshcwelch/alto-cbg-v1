import { CardRegistry } from "../cards/CardRegistry";
import type { CardDef } from "./cardTypes";

export const CARDS: Record<string, CardDef> = Object.fromEntries(
  Object.entries(CardRegistry).map(([id, card]) => [
    id,
    {
      ...card,
      artSrc: card.art ?? "",
    },
  ])
);

