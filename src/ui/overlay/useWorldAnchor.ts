import { useMemo } from "react";
import type { PlayerId } from "../../core/cardTypes";
import { computeSlotCenters } from "../slotMath";
import { useAnchors } from "../boardAnchors";
import { useGameStore } from "../../state/useGameStore";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../boardConfig";

export type AnchorPoint = { left: number; top: number; scale?: number };

const VIEWPORT = { width: BOARD_WIDTH, height: BOARD_HEIGHT };

export default function useWorldAnchor(laneIndex: number, _slotIndex: number, owner: PlayerId = "player"): AnchorPoint {
  const anchors = useAnchors();
  const maxSlots = useGameStore(s => s.maxBoardSlots);

  const slotCenters = useMemo(() => computeSlotCenters(maxSlots, VIEWPORT.width), [maxSlots]);
  const clampedLane = Math.max(0, Math.min(maxSlots - 1, laneIndex));
  const left = (slotCenters[clampedLane] ?? 0) + VIEWPORT.width / 2;
  const band = owner === "enemy" ? anchors.enemyBoard : anchors.playerBoard;
  const top = band.center * VIEWPORT.height;
  const scale = owner === "enemy" ? anchors.laneScale.enemy : anchors.laneScale.player;

  return { left, top, scale };
}
