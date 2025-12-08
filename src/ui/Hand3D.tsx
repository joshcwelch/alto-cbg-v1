import { useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { useGameStore } from "../state/useGameStore";
import CardMesh from "../../apps/client/src/game/cards/CardMesh";
import type { CardState, CardVisual } from "../../apps/client/src/game/cards/types";
import { useAnchors } from "./boardAnchors";
import { computeSlotCenters } from "./slotMath";

const HAND_TILT = -0.08;
const MAX_FAN_ANGLE = 0.34; // radians
const BOARD_THRESHOLD = 0.55; // % of screen height (from bottom) to start snapping

type DragInfo = {
  index: number;
  id: string;
  pos: [number, number];
  toBoard: boolean;
  slot: number | null;
};

export default function Hand3D() {
  const hand = useGameStore(s => s.hand);
  const maxSlots = useGameStore(s => s.maxBoardSlots);
  const playCardToSlot = useGameStore(s => s.playCardToSlot);
  const setDragState = useGameStore(s => s.setDragState);
  const setDragPreviewSlot = useGameStore(s => s.setDragPreviewSlot);
  const viewport = useThree(state => state.viewport);
  const size = useThree(state => state.size);
  const anchors = useAnchors();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [dragging, setDragging] = useState<DragInfo | null>(null);

  const slotCenters = useMemo(() => computeSlotCenters(maxSlots, viewport.width), [maxSlots, viewport.width]);

  const { spacing, centerY } = useMemo(() => {
    const handCenterRatio = anchors.playerHand.center;
    const spacingWorld = viewport.width * anchors.cardSpacing;
    const centerYWorld = (0.5 - handCenterRatio) * viewport.height;
    return { spacing: spacingWorld, centerY: centerYWorld };
  }, [anchors.cardSpacing, anchors.playerHand.center, viewport.height, viewport.width]);

  const toWorld = (clientX: number, clientY: number): [number, number, number] => {
    const x = (clientX / size.width - 0.5) * viewport.width;
    const y = (0.5 - clientY / size.height) * viewport.height;
    const screenRatio = 1 - clientY / size.height;
    return [x, y, screenRatio];
  };

  const nearestSlot = (x: number): number => {
    if (slotCenters.length === 0) return 0;
    let best = 0;
    let bestDist = Math.abs(x - slotCenters[0]);
    slotCenters.forEach((cx, idx) => {
      const d = Math.abs(x - cx);
      if (d < bestDist) {
        bestDist = d;
        best = idx;
      }
    });
    return best;
  };

  const endDrag = (play?: { toBoard: boolean; slot: number | null; id: string }) => {
    if (play && play.toBoard && play.slot !== null) {
      playCardToSlot(play.id, play.slot);
    }
    setDragging(null);
    setDragState(null);
    setDragPreviewSlot(null);
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
        };

        const idxFromCenter = i - (hand.length - 1) / 2;
        const spread = Math.max(1, hand.length - 1);
        const angle = (idxFromCenter / spread) * MAX_FAN_ANGLE;
        const baseX = idxFromCenter * spacing;
        const baseY = centerY - Math.abs(idxFromCenter) * spacing * 0.08;
        const baseRotation: [number, number, number] = [HAND_TILT, 0, angle];

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
                const [x, y, ratio] = toWorld(e.clientX, e.clientY);
                const dragSlot = ratio > BOARD_THRESHOLD ? nearestSlot(x) : null;
                setDragging({ index: i, id: card.id, pos: [x, y], toBoard: ratio > BOARD_THRESHOLD, slot: dragSlot });
                setDragState(card.id);
                setDragPreviewSlot(dragSlot);
              }}
              onPointerMove={e => {
                if (!dragging || dragging.index !== i) return;
                e.stopPropagation();
                const [x, y, ratio] = toWorld(e.clientX, e.clientY);
                const toBoard = ratio > BOARD_THRESHOLD;
                const slot = toBoard ? nearestSlot(x) : null;
                setDragging({ index: i, id: card.id, pos: [x, y], toBoard, slot });
                setDragPreviewSlot(slot);
              }}
              onPointerUp={e => {
                if (!dragging || dragging.index !== i) return;
                e.stopPropagation();
                endDrag({ toBoard: dragging.toBoard, slot: dragging.slot, id: card.id });
              }}
            />
          </group>
        );
      })}
    </group>
  );
}
