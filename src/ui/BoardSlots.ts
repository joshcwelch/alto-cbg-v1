export type BoardPoint = {
  x: number;
  y: number;
};

export const BoardSlots = {
  HeroTop: { x: -20, y: 50 },
  HeroBottom: { x: -20, y: 640 },
  ManaBar: { x: 120, y: 740 },
  EndTurn: { x: 1062, y: 445 },
  Hand: { x: 438, y: 785 },
  EnemyHand: { x: 438, y: -285 },
  BoardCenter: { x: 768, y: 512 },
  AbilityFrame: { x: 1211, y: 700 },
  Graveyard: { x: 98, y: 510 },
  EnemyAbilityFrame: { x: 1211, y: 160 },
} as const satisfies Record<string, BoardPoint>;
