import { useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import UnitMesh, { UNIT_H, UNIT_W } from "../../apps/client/src/game/units/UnitMesh";
import type { BattlefieldUnit, CardDef } from "../core/cardTypes";
import { useGameStore } from "../state/useGameStore";
import { useAnchors } from "./boardAnchors";
import { createLanePositions, isLaneOpen } from "../game/board/LaneSystem";
import { CARDS } from "../core/cardsDb";
import GhostUnitMesh from "./GhostUnitMesh";

const PLAYER_BOARD_TILT = -0.025;
const ENEMY_BOARD_TILT = 0.02;

type BoardRow3DProps = {
  lanePositions: Vector3[];
  units: (BattlefieldUnit & { card: CardDef })[];
  side: "player" | "enemy";
  highlightSlot?: number | null;
};

function BoardRow3D({ units, lanePositions, side, highlightSlot }: BoardRow3DProps) {
  const tilt = side === "enemy" ? ENEMY_BOARD_TILT : PLAYER_BOARD_TILT;
  const flipY = side === "enemy" ? Math.PI : 0;
  const renderOrder = side === "enemy" ? 14 : 12;

  const unitsByLane = useMemo(() => {
    const map = new Map<number, (BattlefieldUnit & { card: CardDef })>();
    units.forEach(u => map.set(u.lane, u));
    return map;
  }, [units]);

  return (
    <group>
      {lanePositions.map((lanePos, idx) => {
        const unit = unitsByLane.get(idx) ?? null;
        const position: [number, number, number] = [lanePos.x, lanePos.y, lanePos.z];

        return (
          <group
            key={unit ? unit.uid : `${side}-slot-${idx}`}
            position={position}
            rotation={[tilt, flipY, 0]}
          >
            {highlightSlot === idx && !unit && (
              <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={renderOrder - 1}>
                <circleGeometry args={[UNIT_W * 0.55, 48]} />
                <meshBasicMaterial color="#7fd8ff" transparent opacity={0.28} />
              </mesh>
            )}
            {unit && (
              <UnitMesh
                card={unit.card}
                owner={unit.owner}
                renderOrder={renderOrder}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}

export default function Board3D() {
  const battlefieldUnits = useGameStore(s => s.battlefieldUnits);
  const dragPreview = useGameStore(s => s.dragPreviewLane);
  const draggingCardId = useGameStore(s => s.draggingCardId);
  const anchors = useAnchors();
  const viewport = useThree(state => state.viewport);
  const [highlightedLane, setHighlightedLane] = useState<number | null>(null);

  const playerCenterY = useMemo(
    () => (0.5 - anchors.playerBoard.center) * viewport.height,
    [anchors.playerBoard.center, viewport.height]
  );
  const enemyCenterY = useMemo(
    () => (0.5 - anchors.enemyBoard.center) * viewport.height,
    [anchors.enemyBoard.center, viewport.height]
  );

  const lanePositionsPlayer = useMemo(
    () => createLanePositions(viewport.width, playerCenterY),
    [playerCenterY, viewport.width]
  );
  const lanePositionsEnemy = useMemo(
    () => createLanePositions(viewport.width, enemyCenterY),
    [enemyCenterY, viewport.width]
  );

  const playerUnits = useMemo(() => {
    return battlefieldUnits
      .filter(u => u.owner === "player")
      .map(u => {
        const card = CARDS[u.cardId];
        return card ? { ...u, card } : null;
      })
      .filter((u): u is BattlefieldUnit & { card: CardDef } => Boolean(u));
  }, [battlefieldUnits]);

  const enemyUnits = useMemo(() => {
    return battlefieldUnits
      .filter(u => u.owner === "enemy")
      .map(u => {
        const card = CARDS[u.cardId];
        return card ? { ...u, card } : null;
      })
      .filter((u): u is BattlefieldUnit & { card: CardDef } => Boolean(u));
  }, [battlefieldUnits]);

  useEffect(() => {
    if (dragPreview == null) {
      setHighlightedLane(null);
      return;
    }
    setHighlightedLane(isLaneOpen(dragPreview, "player", battlefieldUnits) ? dragPreview : null);
  }, [battlefieldUnits, dragPreview]);

  const isDragging = draggingCardId != null;
  const laneHighlightOpacities = useMemo(() => {
    return lanePositionsPlayer.map((_, idx) => {
      if (!isDragging) return 0;
      return highlightedLane === idx ? 0.4 : 0.15;
    });
  }, [highlightedLane, isDragging, lanePositionsPlayer]);

  return (
    <group>
      <group>
        {lanePositionsPlayer.map((lanePos, idx) => (
          <group
            key={`lane-highlight-${idx}`}
            position={[lanePos.x, lanePos.y, lanePos.z]}
            rotation={[PLAYER_BOARD_TILT, 0, 0]}
          >
            <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={10}>
              <planeGeometry args={[UNIT_W * 1.25, UNIT_H * 1.1]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={laneHighlightOpacities[idx] ?? 0}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {highlightedLane != null && (
        <group
          position={[
            lanePositionsPlayer[highlightedLane].x,
            lanePositionsPlayer[highlightedLane].y,
            lanePositionsPlayer[highlightedLane].z
          ]}
          rotation={[PLAYER_BOARD_TILT, 0, 0]}
        >
          <GhostUnitMesh renderOrder={11} />
        </group>
      )}

      <BoardRow3D
        side="enemy"
        units={enemyUnits}
        lanePositions={lanePositionsEnemy}
      />
      <BoardRow3D
        side="player"
        units={playerUnits}
        lanePositions={lanePositionsPlayer}
        highlightSlot={highlightedLane}
      />
    </group>
  );
}
