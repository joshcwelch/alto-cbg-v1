import { BOARD_HEIGHT } from "./boardConfig";

export const BOARD_BASE = { W: 1280, H: 640 };
export const LANE_HEIGHT_RATIO = 0.19;

export type BoardSlot = {
  top: number;
  height: number;
  center: number;
};

export type BoardAnchors = {
  enemyHand: BoardSlot;
  enemyBoard: BoardSlot;
  playerBoard: BoardSlot;
  playerHand: BoardSlot;
  laneHeight: number;
  midGap: number;
  handBoardGap: number;
  slotGap: number;
  boardGap: number;
  cardSpacing: number;
  boardSpacing: number;
  paddingTop: number;
  paddingBottom: number;
  safeBottomPx: number;
  laneScale: {
    enemy: number;
    player: number;
  };
};

const BASE = {
  enemyHand: 0.1,
  playerHand: 0.15,
  laneHeight: LANE_HEIGHT_RATIO, // required: lane height scales from board height
  midGap: 0.1,      // midfield gap between lanes (8-12% viewport)
  handBoardGap: 0.018,
  slotGap: 0.02,
  paddingTop: 0.024,
  paddingBottom: 0.06,
  cardSpacing: 0.086,
  boardSpacing: 0.032,
  safeBottomPx: 120,
  laneScale: {
    enemy: 0.95,
    player: 1.05
  }
};

function computeAnchors(): BoardAnchors {
  const effectiveHeight = BOARD_HEIGHT;
  const isShort = effectiveHeight < 1200;
  const isTall = effectiveHeight > 1440;

  const handScale = isShort ? 0.9 : isTall ? 1.05 : 1;

  const laneHeight = BASE.laneHeight;
  const midGap = Math.max(0.08, Math.min(0.12, BASE.midGap * (isTall ? 1.04 : isShort ? 0.95 : 1)));
  const handBoardGap = BASE.handBoardGap;

  const slotGap = BASE.slotGap;
  const boardGap = midGap;

  const enemyHandHeight = BASE.enemyHand * handScale;
  const playerHandHeight = BASE.playerHand * handScale;
  const enemyBoardHeight = laneHeight;
  const playerBoardHeight = laneHeight;

  const safeBottomRatio = Math.max(BASE.paddingBottom, BASE.safeBottomPx / effectiveHeight);
  const paddingTop = BASE.paddingTop;
  const paddingBottom = safeBottomRatio;

  let cursor = paddingTop;

  const enemyHandTop = cursor;
  cursor += enemyHandHeight + handBoardGap;

  const enemyBoardTop = cursor;
  cursor += enemyBoardHeight + boardGap;

  const playerBoardTop = cursor;
  cursor += playerBoardHeight + handBoardGap;

  const playerHandTop = cursor;
  const used = cursor + playerHandHeight + paddingBottom;
  const spare = used < 1 ? (1 - used) / 2 : 0;

  const applyOffset = (top: number, height: number): BoardSlot => ({
    top: top + spare,
    height,
    center: top + spare + height / 2
  });

  return {
    enemyHand: applyOffset(enemyHandTop, enemyHandHeight),
    enemyBoard: applyOffset(enemyBoardTop, enemyBoardHeight),
    playerBoard: applyOffset(playerBoardTop, playerBoardHeight),
    playerHand: applyOffset(playerHandTop, playerHandHeight),
    laneHeight,
    midGap,
    handBoardGap,
    slotGap,
    boardGap,
    cardSpacing: BASE.cardSpacing,
    boardSpacing: BASE.boardSpacing,
    paddingTop: paddingTop + spare,
    paddingBottom: paddingBottom + spare,
    safeBottomPx: BASE.safeBottomPx,
    laneScale: BASE.laneScale
  };
}

export const ANCHORS = computeAnchors();

export function useAnchors() {
  return ANCHORS;
}
