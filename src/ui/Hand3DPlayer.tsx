import { useEffect, useMemo, useRef, useState } from "react";
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
const HAND_DROP = 0.18; // push the hand lower toward screen bottom (ratio of viewport height)
const PLAYER_OVERLAP = 0.72; // tighter spacing so the fan overlaps like the enemy hand

type DragInfo = {
  index: number;
  id: string;
  pos: [number, number];
  toBoard: boolean;
  lane: number | null;
};

type ReturnAnim = {
  index: number;
  id: string;
  start: [number, number];
  end: [number, number];
  current: [number, number];
  startedAt: number;
  duration: number;
  onComplete?: () => void;
};

function computeCardBase(idx: number, handLength: number, spacing: number, centerY: number) {
  const n = handLength;
  const mid = (n - 1) / 2;
  const theta = n <= 1 ? 0 : (-FAN_ANGLE / 2) + (FAN_ANGLE * (idx / (n - 1)));
  const baseX = (idx - mid) * spacing;
  const liftFalloff = mid === 0 ? 1 : 1 - Math.abs((idx - mid) / mid);
  const lift = liftFalloff * spacing * FAN_LIFT;
  const baseY = centerY + lift;
  const baseRotation: [number, number, number] = [HAND_TILT, 0, -theta];
  return { baseX, baseY, baseRotation };
}

export default function Hand3DPlayer() {
  const hand = useGameStore(s => s.hand);
  const battlefieldUnits = useGameStore(s => s.battlefieldUnits);
  const playCard = useGameStore(s => s.playCard);
  const setDragState = useGameStore(s => s.setDragState);
  const setDragPreviewLane = useGameStore(s => s.setDragPreviewLane);
  const turn = useGameStore(s => s.turn);
  const winner = useGameStore(s => s.winner);
  const viewport = useThree(state => state.viewport);
  const size = useThree(state => state.size);
  const anchors = useAnchors();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [dragging, setDragging] = useState<DragInfo | null>(null);
  const [returnAnim, setReturnAnim] = useState<ReturnAnim | null>(null);
  const draggingRef = useRef<DragInfo | null>(null);
  const isPlayersTurn = turn === "player" && !winner;
  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  useEffect(() => {
    if (isPlayersTurn) return;
    setDragging(null);
    setReturnAnim(null);
    setDragState(null);
    setDragPreviewLane(null);
  }, [isPlayersTurn, setDragPreviewLane, setDragState]);

  const { spacing, centerY, boardCenterY } = useMemo(() => {
    const handCenterRatio = anchors.playerHand.center;
    const boardCenterRatio = anchors.playerBoard.center;
    const spacingWorld = viewport.width * anchors.cardSpacing * PLAYER_OVERLAP;
    const centerYWorld = (0.5 - handCenterRatio) * viewport.height - viewport.height * HAND_DROP * 0.5;
    const boardCenterWorld = (0.5 - boardCenterRatio) * viewport.height;
    return { spacing: spacingWorld, centerY: centerYWorld, boardCenterY: boardCenterWorld };
  }, [anchors.cardSpacing, anchors.playerBoard.center, anchors.playerHand.center, viewport.height, viewport.width]);

  const lanePositions = useMemo(
    () => createLanePositions(viewport.width, boardCenterY),
    [boardCenterY, viewport.width]
  );

  const boardPlane = useMemo(() => new Plane(new Vector3(0, 0, 1), 0), []);

  const finishDrag = (drag: DragInfo, baseX: number, baseY: number) => {
    draggingRef.current = null;
    const targetLane = drag.lane !== null && isLaneOpen(drag.lane, "player", battlefieldUnits)
      ? drag.lane
      : null;
    const canPlay = drag.toBoard && targetLane !== null;

    if (canPlay && targetLane !== null) {
      const lanePos = lanePositions[targetLane];
      setDragging(null);
      setDragState(null);
      setDragPreviewLane(null);
      setReturnAnim({
        index: drag.index,
        id: drag.id,
        start: [drag.pos[0], drag.pos[1]],
        end: [lanePos.x, lanePos.y],
        current: [drag.pos[0], drag.pos[1]],
        startedAt: performance.now(),
        duration: 140,
        onComplete: () => playCard(drag.id, targetLane, "player")
      });
      return;
    }

    setDragging(null);
    setDragState(null);
    setDragPreviewLane(null);
    setReturnAnim({
      index: drag.index,
      id: drag.id,
      start: [drag.pos[0], drag.pos[1]],
      end: [baseX, baseY],
      current: [drag.pos[0], drag.pos[1]],
      startedAt: performance.now(),
      duration: 200
    });
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

  // global pointer listeners so drag continues even if cursor leaves the card
  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => {
      const active = draggingRef.current;
      if (!active) return;
      const { world, screenRatio, lane } = resolveDragPosition(e.clientX, e.clientY);
      const toBoard = screenRatio > BOARD_THRESHOLD;
      const laneTarget = toBoard ? lane : null;
      setDragging(prev => (prev && prev.index === active.index
        ? { ...prev, pos: [world.x, world.y], toBoard, lane: laneTarget }
        : prev));
      setDragPreviewLane(laneTarget);
    };
    const handleUp = () => {
      const active = draggingRef.current;
      if (!active) return;
      const { baseX, baseY } = computeCardBase(active.index, hand.length, spacing, centerY);
      finishDrag(active, baseX, baseY);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [centerY, dragging, finishDrag, hand.length, lanePositions, resolveDragPosition, spacing, setDragPreviewLane]);

  // ease a card back to hand when released in an invalid spot
  useEffect(() => {
    if (!returnAnim) return;
    let raf: number;
    const step = () => {
      setReturnAnim(prev => {
        if (!prev) return null;
        const now = performance.now();
        const t = Math.min(1, (now - prev.startedAt) / prev.duration);
        const eased = 1 - (1 - t) * (1 - t);
        const x = prev.start[0] + (prev.end[0] - prev.start[0]) * eased;
        const y = prev.start[1] + (prev.end[1] - prev.start[1]) * eased;
        if (t >= 1) {
          prev.onComplete?.();
          return null;
        }
        return { ...prev, current: [x, y] };
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [returnAnim]);

  return (
    <group>
      {hand.map((card, i) => {
        const isDragging = dragging?.index === i;
        const hoverActive = hoveredIdx === i && !isDragging && returnAnim?.index !== i && isPlayersTurn;

        const { baseX, baseY, baseRotation } = computeCardBase(i, hand.length, spacing, centerY);
        const mid = (hand.length - 1) / 2;
        const stackRank = hand.length - Math.abs(i - mid); // center gets highest render order
        const renderOrder = isDragging ? 40 : 20 + stackRank;

        const isReturning = returnAnim?.index === i;
        const position: [number, number, number] = isDragging
          ? [dragging.pos[0], dragging.pos[1], 0]
          : isReturning
            ? [returnAnim.current[0], returnAnim.current[1], 0]
          : [baseX, baseY, stackRank * 0.0008];
        const rotation: [number, number, number] = (isDragging || isReturning) ? [0, 0, 0] : baseRotation;
        const state: CardState = !isPlayersTurn
          ? "disabled"
          : (isDragging || isReturning)
            ? "drag"
            : hoverActive
              ? "hover"
              : "idle";
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

        return (
          <group
            key={`${card.id}-${i}`}
            position={position}
            rotation={rotation}
          >
            <CardMesh
              visual={visual}
              renderOrder={renderOrder}
              shadow={false}
                onPointerOver={() => !isDragging && isPlayersTurn && setHoveredIdx(i)}
                onPointerOut={() => setHoveredIdx(null)}
                onPointerDown={e => {
                  if (!isPlayersTurn) return;
                  e.stopPropagation();
                  setReturnAnim(null);
                  const { world, screenRatio, lane } = resolveDragPosition(e.clientX, e.clientY, (e as any).ray);
                  const toBoard = screenRatio > BOARD_THRESHOLD;
                  const laneTarget = toBoard ? lane : null;
                setDragging({ index: i, id: card.id, pos: [world.x, world.y], toBoard, lane: laneTarget });
                setDragState(card.id);
                setDragPreviewLane(laneTarget);
              }}
              onPointerMove={e => {
                if (!isPlayersTurn || !dragging || dragging.index !== i) return;
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
                finishDrag(dragging, baseX, baseY);
              }}
            />
          </group>
        );
      })}
    </group>
  );
}
