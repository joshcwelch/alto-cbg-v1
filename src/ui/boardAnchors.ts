import { useEffect, useState } from "react";

export const BOARD_BASE = { W: 1280, H: 640 };

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
  slotGap: number;
  boardGap: number;
  cardSpacing: number;
  boardSpacing: number;
  paddingTop: number;
  paddingBottom: number;
  safeBottomPx: number;
};

const BASE = {
  enemyHand: 0.1,
  enemyBoard: 0.23,
  playerBoard: 0.23,
  playerHand: 0.12,
  slotGap: 0.035,
  boardGap: 0.06,
  paddingTop: 0.04,
  paddingBottom: 0.05,
  cardSpacing: 0.09,
  boardSpacing: 0.03,
  safeBottomPx: 90
};

function computeAnchors(viewportHeight: number): BoardAnchors {
  const isShort = viewportHeight < 1200;
  const isTall = viewportHeight > 1440;

  const handScale = isShort ? 0.88 : isTall ? 0.94 : 1;
  const boardScale = isShort ? 0.9 : isTall ? 1.08 : 1;

  const slotGap = isShort ? BASE.slotGap * 0.9 : isTall ? BASE.slotGap * 1.05 : BASE.slotGap;
  const boardGap = isShort ? BASE.boardGap * 0.92 : isTall ? BASE.boardGap * 1.05 : BASE.boardGap;

  const enemyHandHeight = BASE.enemyHand * handScale;
  const playerHandHeight = BASE.playerHand * handScale;
  const enemyBoardHeight = BASE.enemyBoard * boardScale;
  const playerBoardHeight = BASE.playerBoard * boardScale;

  const safeBottomRatio = Math.max(BASE.paddingBottom, BASE.safeBottomPx / viewportHeight);
  const paddingTop = BASE.paddingTop;
  const paddingBottom = safeBottomRatio;

  let cursor = paddingTop;

  const enemyHandTop = cursor;
  cursor += enemyHandHeight + slotGap;

  const enemyBoardTop = cursor;
  cursor += enemyBoardHeight + boardGap;

  const playerBoardTop = cursor;
  cursor += playerBoardHeight + slotGap;

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
    slotGap,
    boardGap,
    cardSpacing: BASE.cardSpacing,
    boardSpacing: BASE.boardSpacing,
    paddingTop: paddingTop + spare,
    paddingBottom: paddingBottom + spare,
    safeBottomPx: BASE.safeBottomPx
  };
}

const initialHeight = typeof window !== "undefined" ? window.innerHeight : 1080;

export const ANCHORS = computeAnchors(initialHeight);

export function useAnchors() {
  const [anchors, setAnchors] = useState<BoardAnchors>(() => computeAnchors(initialHeight));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = () => setAnchors(computeAnchors(window.innerHeight));
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return anchors;
}
