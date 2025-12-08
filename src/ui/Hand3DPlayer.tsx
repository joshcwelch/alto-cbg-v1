import { useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Plane, Vector3 } from "three";
import { useGameStore } from "../state/useGameStore";
import CardMesh from "../../apps/client/src/game/cards/CardMesh";
import type { CardState, CardVisual } from "../../apps/client/src/game/cards/types";
import { useAnchors } from "./boardAnchors";
import { createLanePositions, getClosestLane, isLaneOpen } from "../game/board/LaneSystem";

const HAND_TILT = -0.08;
const FAN_ANGLE = 0.34; // radians, total spread of the hand
const FAN_LIFT = 0.55;   // scales vertical lift relative to spacing
const BOARD_THRESHOLD = 0.4; // % of screen height (from bottom) to start snapping

type DragInfo = {
  index: number;
  id: string;
  pos: [number, number];
  toBoard: boolean;
  lane: number | null;
};

export default function Hand3DPlayer() {
  const hand = useGameStore(s => s.hand);
  const battlefieldUnits = useGameStore(s => s.battlefieldUnits);
  const playCard = useGameStore(s => s.playCard);
  const setDragState = useGameStore(s => s.setDragState);
  const setDragPreviewLane = useGameStore(s => s.setDragPreviewLane);
  const viewport = useThree(state => state.viewport);
  const size = useThree(state => state.size);
  const anchors = useAnchors();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [dragging, setDragging] = useState<DragInfo | null>(null);

  const { spacing, centerY, boardCenterY } = useMemo(() => {
    const handCenterRatio = anchors.playerHand.center;
    const boardCenterRatio = anchors.playerBoard.center;
    const spacingWorld = viewport.width * anchors.cardSpacing;
    const centerYWorld = (0.5 - handCenterRatio) * viewport.height;
    const boardCenterWorld = (0.5 - boardCenterRatio) * viewport.height;
    return { spacing: spacingWorld, centerY: centerYWorld, boardCenterY: boardCenterWorld };
  }, [anchors.cardSpacing, anchors.playerBoard.center, anchors.playerHand.center, viewport.height, viewport.width]);

  const lanePositions = useMemo(
    () => createLanePositions(viewport.width, boardCenterY),
    [boardCenterY, viewport.width]
  );

  const boardPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), []);

  const endDrag = (play?: { toBoard: boolean; lane: number | null; id: string }) => {
    if (play && play.toBoard && play.lane !== null && isLaneOpen(play.lane, "player", battlefieldUnits)) {
      playCard(play.id, play.lane, "player");
    }
    setDragging(null);
    setDragState(null);
    setDragPreviewLane(null);
  };

  const resolveDragPosition = (clientX: number, clientY: number, ray?: { intersectPlane: (p: Plane, v: Vector3) => Vector3 | null }) => {
    const world = new Vector3();
    if (ray && typeof ray.intersectPlane === "function") {
      ray.intersectPlane(boardPlane, world);
    } else {
      const x = (clientX / size.width - 0.5) * viewport.width;
      const y = (0.5 - clientY / size.height) * viewport.height;
      world.set(x, y, 0);
    }
    const screenRatio = 1 - clientY / size.height;
    const lane = screenRatio > BOARD_THRESHOLD ? getClosestLane(world, lanePositions) : null;
    return { world, screenRatio, lane };
  };

  return (
    <group>
      {hand.map((card, i) => {
        const isDragging = dragging?.index === i;
        const hoverActive = hoveredIdx === i && !isDragging;
        const state: CardState = isDragging ? "drag" : hoverActive ? "hover" : "idle";
        const visual: CardVisual = {
          id: card.id,
          name: card.name,
          cost: card.cost,
          attack: card.attack,
          health: card.health,
          text: card.description,
          rarity: "common",
          foil: card.cost >= 4,
          state,
          owner: "player",
        };

        const n = hand.length;
        const mid = (n - 1) / 2;
        const theta = n <= 1 ? 0 : (-FAN_ANGLE / 2) + (FAN_ANGLE * (i / (n - 1)));
        const baseX = (i - mid) * spacing;
        const liftFalloff = mid === 0 ? 1 : 1 - Math.abs((i - mid) / mid);
        const lift = liftFalloff * spacing * FAN_LIFT;
        const baseY = centerY + lift;
        const baseRotation: [number, number, number] = [HAND_TILT, 0, -theta];

        const position: [number, number, number] = isDragging
          ? [dragging.pos[0], dragging.pos[1], 0]
          : [baseX, baseY, 0];
        const rotation: [number, number, number] = isDragging ? [0, 0, 0] : baseRotation;

        return (
          <group
            key={`${card.id}-${i}`}
            position={position}
            rotation={rotation}
          >
            <CardMesh
              visual={visual}
              renderOrder={isDragging ? 30 : 20}
              shadow={false}
              onPointerOver={() => !isDragging && setHoveredIdx(i)}
              onPointerOut={() => setHoveredIdx(null)}
              onPointerDown={e => {
                e.stopPropagation();
                const { world, screenRatio, lane } = resolveDragPosition(e.clientX, e.clientY, (e as any).ray);
                const toBoard = screenRatio > BOARD_THRESHOLD;
                const laneTarget = toBoard ? lane : null;
                setDragging({ index: i, id: card.id, pos: [world.x, world.y], toBoard, lane: laneTarget });
                setDragState(card.id);
                setDragPreviewLane(laneTarget);
              }}
              onPointerMove={e => {
                if (!dragging || dragging.index !== i) return;
                e.stopPropagation();
                const { world, screenRatio, lane } = resolveDragPosition(e.clientX, e.clientY, (e as any).ray);
                const toBoard = screenRatio > BOARD_THRESHOLD;
                const laneTarget = toBoard ? lane : null;
                setDragging({ index: i, id: card.id, pos: [world.x, world.y], toBoard, lane: laneTarget });
                setDragPreviewLane(laneTarget);
              }}
              onPointerUp={e => {
                if (!dragging || dragging.index !== i) return;
                e.stopPropagation();
                endDrag({ toBoard: dragging.toBoard, lane: dragging.lane, id: card.id });
              }}
            />
          </group>
        );
      })}
    </group>
  );
}
