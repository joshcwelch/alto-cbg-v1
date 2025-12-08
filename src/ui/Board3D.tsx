import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import UnitMesh, { UNIT_W } from "../../apps/client/src/game/units/UnitMesh";
import type { UnitOnBoard } from "../core/cardTypes";
import { useGameStore } from "../state/useGameStore";
import { useAnchors } from "./boardAnchors";
import { computeSlotCenters, BOARD_AREA_RATIO } from "./slotMath";

const PLAYER_BOARD_TILT = -0.025;
const ENEMY_BOARD_TILT = 0.02;

type BoardRow3DProps = {
  units: (UnitOnBoard | null)[];
  slotCenters: number[];
  centerY: number;
  side: "player" | "enemy";
  highlightSlot?: number | null;
};

function BoardRow3D({ units, slotCenters, centerY, side, highlightSlot }: BoardRow3DProps) {
  const tilt = side === "enemy" ? ENEMY_BOARD_TILT : PLAYER_BOARD_TILT;
  const flipY = side === "enemy" ? Math.PI : 0;
  const renderOrder = side === "enemy" ? 14 : 12;

  const slots = useMemo(
    () => Array.from({ length: slotCenters.length }, (_, idx) => units[idx] ?? null),
    [slotCenters, units]
  );

  return (
    <group>
      {slots.map((unit, idx) => {
        const x = slotCenters[idx];

        return (
          <group
            key={unit ? unit.uid : `${side}-slot-${idx}`}
            position={[x, centerY, 0]}
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
                unit={unit}
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
  const battlefield = useGameStore(s => s.battlefield);
  const maxSlots = useGameStore(s => s.maxBoardSlots);
  const dragPreview = useGameStore(s => s.dragPreviewSlot);
  const anchors = useAnchors();
  const viewport = useThree(state => state.viewport);

  const slotCenters = useMemo(() => {
    return computeSlotCenters(maxSlots, viewport.width, BOARD_AREA_RATIO);
  }, [maxSlots, viewport.width]);

  const playerCenterY = useMemo(
    () => (0.5 - anchors.playerBoard.center) * viewport.height,
    [anchors.playerBoard.center, viewport.height]
  );
  const enemyCenterY = useMemo(
    () => (0.5 - anchors.enemyBoard.center) * viewport.height,
    [anchors.enemyBoard.center, viewport.height]
  );

  return (
    <group>
      <BoardRow3D
        side="enemy"
        units={[]}
        slotCenters={slotCenters}
        centerY={enemyCenterY}
      />
      <BoardRow3D
        side="player"
        units={battlefield}
        slotCenters={slotCenters}
        centerY={playerCenterY}
        highlightSlot={dragPreview}
      />
    </group>
  );
}
