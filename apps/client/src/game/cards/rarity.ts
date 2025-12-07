import type { Rarity } from "./types";

export const rarityParams: Record<Rarity, { rim: number; glow: number; color: [number, number, number] }> = {
  common:     { rim: 0.18, glow: 0.18, color: [0.70, 0.80, 0.95] },
  rare:       { rim: 0.26, glow: 0.28, color: [0.47, 0.74, 1.00] },
  epic:       { rim: 0.32, glow: 0.34, color: [0.72, 0.50, 0.98] },
  legendary:  { rim: 0.40, glow: 0.44, color: [1.00, 0.80, 0.40] },
};