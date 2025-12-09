import { useEffect, useMemo, useState } from "react";
import type { PlayerId } from "../../core/cardTypes";
import { computeSlotCenters } from "../slotMath";
import { useAnchors } from "../boardAnchors";
import { useGameStore } from "../../state/useGameStore";

export type AnchorPoint = { left: number; top: number; scale?: number };

const getViewport = () => {
  if (typeof document !== "undefined") {
    const frame = document.querySelector(".board-frame") as HTMLElement | null;
    if (frame) {
      const rect = frame.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
  }
  return {
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080
  };
};

export default function useWorldAnchor(laneIndex: number, _slotIndex: number, owner: PlayerId = "player"): AnchorPoint {
  const anchors = useAnchors();
  const maxSlots = useGameStore(s => s.maxBoardSlots);
  const [viewport, setViewport] = useState(getViewport);

  useEffect(() => {
    const handle = () => setViewport(getViewport());
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handle);
      return () => window.removeEventListener("resize", handle);
    }
    return;
  }, []);

  const slotCenters = useMemo(() => computeSlotCenters(maxSlots, viewport.width), [maxSlots, viewport.width]);
  const clampedLane = Math.max(0, Math.min(maxSlots - 1, laneIndex));
  const left = (slotCenters[clampedLane] ?? 0) + viewport.width / 2;
  const band = owner === "enemy" ? anchors.enemyBoard : anchors.playerBoard;
  const top = band.center * viewport.height;
  const scale = owner === "enemy" ? anchors.laneScale.enemy : anchors.laneScale.player;

  return { left, top, scale };
}
