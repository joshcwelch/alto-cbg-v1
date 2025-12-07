import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import CardMesh from "../../apps/client/src/game/cards/CardMesh";
import type { CardVisual } from "../../apps/client/src/game/cards/types";
import type { UnitOnBoard } from "../core/cardTypes";
import { useGameStore } from "../state/useGameStore";
import { useAnchors } from "./boardAnchors";

const PLAYER_BOARD_TILT = -0.025;
const ENEMY_BOARD_TILT = 0.02;
const BOARD_AREA_RATIO = 0.82;

function toVisual(unit: UnitOnBoard): CardVisual {
  const { base, damage } = unit;
  return {
    id: unit.uid,
    name: base.name,
    cost: base.cost,
    attack: base.attack,
    health: Math.max(0, base.health - damage),
    text: base.description,
    rarity: "common",
    state: "played",
    foil: base.cost >= 5
  };
}

type BoardRow3DProps = {
  units: UnitOnBoard[];
  slotCenters: number[];
  centerY: number;
  side: "player" | "enemy";
};

function BoardRow3D({ units, slotCenters, centerY, side }: BoardRow3DProps) {
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
        if (!unit) return null;
        const x = slotCenters[idx];
        const visual = toVisual(unit);

        return (
          <group
            key={unit.uid}
            position={[x, centerY, 0]}
            rotation={[tilt, flipY, 0]}
          >
            <CardMesh visual={visual} renderOrder={renderOrder} shadow={false} />
          </group>
        );
      })}
    </group>
  );
}

export default function Board3D() {
  const battlefield = useGameStore(s => s.battlefield);
  const maxSlots = useGameStore(s => s.maxBoardSlots);
  const anchors = useAnchors();
  const viewport = useThree(state => state.viewport);

  const slotCenters = useMemo(() => {
    const clampedSlots = Math.max(1, maxSlots);
    const areaWidth = viewport.width * BOARD_AREA_RATIO;
    if (clampedSlots === 1) return [0];
    const spacing = areaWidth / (clampedSlots - 1);
    const start = -areaWidth / 2;
    return Array.from({ length: clampedSlots }, (_, i) => start + i * spacing);
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
      />
    </group>
  );
}
