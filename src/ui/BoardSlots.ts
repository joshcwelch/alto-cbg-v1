export type BoardPoint = {
  x: number;
  y: number;
};

export const BoardSlots = {
  HeroTop: { x: 626, y: 80 },
  HeroBottom: { x: 626, y: 660 },
  ManaBar: { x: 120, y: 740 },
  EndTurn: { x: 1220, y: 832 },
  Hand: { x: 140, y: 700 },
  BoardCenter: { x: 768, y: 512 },
  AbilityFrame: { x: 934, y: 730 },
  Graveyard: { x: 98, y: 510 },
} as const satisfies Record<string, BoardPoint>;
