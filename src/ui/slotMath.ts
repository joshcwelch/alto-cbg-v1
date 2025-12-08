export const BOARD_AREA_RATIO = 0.82;

export function computeSlotCenters(maxSlots: number, viewportWidth: number, areaRatio: number = BOARD_AREA_RATIO): number[] {
  const clampedSlots = Math.max(1, maxSlots);
  const areaWidth = viewportWidth * areaRatio;
  if (clampedSlots === 1) return [0];
  const spacing = areaWidth / (clampedSlots - 1);
  const start = -areaWidth / 2;
  return Array.from({ length: clampedSlots }, (_, i) => start + i * spacing);
}
