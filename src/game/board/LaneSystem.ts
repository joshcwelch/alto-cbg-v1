import { Vector3 } from "three";
import { computeSlotCenters, BOARD_AREA_RATIO } from "../../ui/slotMath";
import type { BattlefieldUnit, PlayerId } from "../../core/cardTypes";

export const NUM_LANES = 7;
const SNAP_RATIO = 0.6;          // how close (as a % of lane spacing) a drop must be to count

export function createLanePositions(viewportWidth: number, centerY: number): Vector3[] {
  const centers = computeSlotCenters(NUM_LANES, viewportWidth, BOARD_AREA_RATIO);
  return centers.map(x => new Vector3(x, centerY, 0));
}

export function getClosestLane(worldPosition: Vector3, lanes: Vector3[]): number | null {
  if (lanes.length === 0) return null;

  let bestIdx = 0;
  let bestDist = Number.POSITIVE_INFINITY;

  lanes.forEach((lanePos, idx) => {
    const dist = lanePos.distanceTo(worldPosition);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = idx;
    }
  });

  const spacing = lanes.length > 1 ? Math.abs(lanes[1].x - lanes[0].x) : 1;
  const snapDistance = spacing * SNAP_RATIO;

  return bestDist <= snapDistance ? bestIdx : null;
}

export function isLaneOpen(index: number, owner: PlayerId, units: BattlefieldUnit[]): boolean {
  if (index < 0 || index >= NUM_LANES) return false;
  return !units.some(u => u.lane === index && u.owner === owner);
}
