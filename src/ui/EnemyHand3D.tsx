import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useGameStore } from "../state/useGameStore";
import CardMesh from "../../apps/client/src/game/cards/CardMesh";
import type { CardVisual } from "../../apps/client/src/game/cards/types";
import { useAnchors } from "./boardAnchors";

const ENEMY_HAND_TILT = 0.08;

export default function EnemyHand3D() {
  const enemyHand = useGameStore(s => s.enemyHand);
  const viewport = useThree(state => state.viewport);
  const anchors = useAnchors();

  const { spacing, centerY } = useMemo(() => {
    const enemyCenterRatio = anchors.enemyHand.center;
    const spacingWorld = viewport.width * anchors.cardSpacing;
    const centerYWorld = (0.5 - enemyCenterRatio) * viewport.height;
    return { spacing: spacingWorld, centerY: centerYWorld };
  }, [anchors.cardSpacing, anchors.enemyHand.center, viewport.height, viewport.width]);

  return (
    <group>
      {enemyHand.map((card, i) => {
        const visual: CardVisual = {
          id: card.id,
          name: card.name,
          cost: card.cost,
          rarity: "common",
          foil: false,
          state: "idle",
          backId: null,
        };

        return (
          <group
            key={`${card.id}-${i}`}
            position={[(i - (enemyHand.length - 1) / 2) * spacing, centerY, 0]}
            rotation={[ENEMY_HAND_TILT, Math.PI, 0]}
          >
            <CardMesh
              visual={visual}
              renderOrder={18}
              shadow={false}
            />
          </group>
        );
      })}
    </group>
  );
}