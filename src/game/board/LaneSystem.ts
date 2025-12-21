import { Vector3 } from "three";
import { computeSlotCenters } from "../../ui/slotMath";
import { BOARD_WIDTH, PLAY_AREA_CENTER_OFFSET, PLAY_AREA_LEFT, PLAY_AREA_WIDTH } from "../../ui/boardConfig";
import { UNIT_W } from "../../../apps/client/src/game/units/UnitMesh";
import type { BattlefieldUnit, PlayerId } from "../../core/cardTypes";

export const NUM_LANES = 7;
const SNAP_RADIUS = UNIT_W * 1.2; // expanded hitbox around each lane center
const PLAY_AREA_RATIO = PLAY_AREA_WIDTH / BOARD_WIDTH;

export function createLanePositions(viewportWidth: number, centerY: number): Vector3[] {
  const centerOffset = PLAY_AREA_CENTER_OFFSET * (viewportWidth / BOARD_WIDTH);
  const centers = computeSlotCenters(NUM_LANES, viewportWidth, PLAY_AREA_RATIO, centerOffset, UNIT_W / 2);
  return centers.map(x => new Vector3(x, centerY, 0));
}

export function getClosestLane(worldPosition: Vector3, lanes: Vector3[], viewportWidth: number): number | null {
  if (lanes.length === 0) return null;
  const scale = viewportWidth / BOARD_WIDTH;
  const left = -viewportWidth / 2 + PLAY_AREA_LEFT * scale + UNIT_W / 2;
  const right = -viewportWidth / 2 + (PLAY_AREA_LEFT + PLAY_AREA_WIDTH) * scale - UNIT_W / 2;
  if (worldPosition.x < left || worldPosition.x > right) return null;
  if (worldPosition.x < bounds.left || worldPosition.x > bounds.right) return null;

  let bestIdx = 0;
  let bestDist = Number.POSITIVE_INFINITY;

  lanes.forEach((lanePos, idx) => {
    const dist = lanePos.distanceTo(worldPosition);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = idx;
    }
  });

  return bestDist <= SNAP_RADIUS ? bestIdx : null;
}

export function isLaneOpen(index: number, owner: PlayerId, units: BattlefieldUnit[]): boolean {
  if (index < 0 || index >= NUM_LANES) return false;
  return !units.some(u => u.lane === index && u.owner === owner);
}
