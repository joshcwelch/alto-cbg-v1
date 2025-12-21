export const BOARD_WIDTH = 1536;
export const BOARD_HEIGHT = 1024;

export function getBoardScale(viewportWidth: number, viewportHeight: number) {
  const scaleX = viewportWidth / BOARD_WIDTH;
  const scaleY = viewportHeight / BOARD_HEIGHT;
  const nextScale = Math.min(scaleX, scaleY);
  return Math.max(0.75, Math.min(nextScale, 1.1));
}
