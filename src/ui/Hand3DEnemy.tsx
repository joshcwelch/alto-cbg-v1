import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useGameStore } from "../state/useGameStore";
import CardMesh from "../../apps/client/src/game/cards/CardMesh";
import type { CardVisual } from "../../apps/client/src/game/cards/types";
import { useAnchors } from "./boardAnchors";

const ENEMY_OVERLAP = 0.85;

export default function Hand3DEnemy() {
  const enemyHand = useGameStore(s => s.enemyHand);
  const viewport = useThree(state => state.viewport);
  const anchors = useAnchors();

  const { spacing, centerY } = useMemo(() => {
    const enemyCenterRatio = anchors.enemyHand.center;
    const spacingWorld = viewport.width * anchors.cardSpacing * ENEMY_OVERLAP;
    const centerYWorld = (0.5 - enemyCenterRatio) * viewport.height;
    return { spacing: spacingWorld, centerY: centerYWorld };
  }, [anchors.cardSpacing, anchors.enemyHand.center, viewport.height, viewport.width]);

  return (
    <group>
      {enemyHand.map((card, i) => {
        const visual: CardVisual = {
          id: card.id,
          rarity: "common",
          foil: false,
          state: "idle",
          backId: null,
          owner: "enemy",
        };

        return (
          <group
            key={`${card.id}-${i}`}
            position={[(i - (enemyHand.length - 1) / 2) * spacing, centerY, 0]}
            rotation={[0, Math.PI, 0]}
          >
            <CardMesh
              visual={visual}
              renderOrder={18}
              shadow={false}
              hideHtml
              disableAnimation
            />
          </group>
        );
      })}
    </group>
  );
}
