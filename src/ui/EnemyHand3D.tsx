import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useGameStore } from "../state/useGameStore";
import CardMesh from "./CardMesh";
import { ANCHORS } from "./boardAnchors";

const ENEMY_HAND_TILT = 0.08;

export default function EnemyHand3D() {
  const enemyHand = useGameStore(s => s.enemyHand);
  const viewport = useThree(state => state.viewport);

  const { spacing, centerY } = useMemo(() => {
    const playerCenterRatio = ANCHORS.handTop + ANCHORS.handHeight / 2;
    const enemyCenterRatio = 1 - playerCenterRatio;
    const spacingWorld = viewport.width * ANCHORS.cardSpacing;
    const centerYWorld = (0.5 - enemyCenterRatio) * viewport.height;
    return { spacing: spacingWorld, centerY: centerYWorld };
  }, [viewport.height, viewport.width]);

  return (
    <group>
      {enemyHand.map((card, i) => (
        <group
          key={`${card.id}-${i}`}
          position={[(i - (enemyHand.length - 1) / 2) * spacing, centerY, 0]}
          rotation={[ENEMY_HAND_TILT, 0, 0]}
        >
          <CardMesh
            card={card}
            forceBack
            isFaceUp={false}
            enableHover={false}
            renderOrder={18}
            scale={1}
            rotation={[0, 0, 0]}
          />
        </group>
      ))}
    </group>
  );
}
