export const BOARD_AREA_RATIO = 1000 / 1536;

export function computeSlotCenters(
  maxSlots: number,
  viewportWidth: number,
  areaRatio: number = BOARD_AREA_RATIO,
  centerOffset: number = 0,
  padding: number = 0
): number[] {
  const clampedSlots = Math.max(1, maxSlots);
  const areaWidth = Math.max(0, viewportWidth * areaRatio - padding * 2);
  if (clampedSlots === 1) return [centerOffset];
  const spacing = areaWidth / (clampedSlots - 1);
  const start = -areaWidth / 2;
  return Array.from({ length: clampedSlots }, (_, i) => start + i * spacing + centerOffset);
}
