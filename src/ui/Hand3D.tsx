import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useGameStore } from "../state/useGameStore";
import CardMesh from "./CardMesh";
import { useAnchors } from "./boardAnchors";

const HAND_TILT = -0.08;

export default function Hand3D() {
  const hand = useGameStore(s => s.hand);
  const viewport = useThree(state => state.viewport);
  const anchors = useAnchors();

  const { spacing, centerY } = useMemo(() => {
    const handCenterRatio = anchors.playerHand.center;
    const spacingWorld = viewport.width * anchors.cardSpacing;
    const centerYWorld = (0.5 - handCenterRatio) * viewport.height;
    return { spacing: spacingWorld, centerY: centerYWorld };
  }, [anchors.cardSpacing, anchors.playerHand.center, viewport.height, viewport.width]);

  return (
    <group>
      {hand.map((card, i) => (
        <group
          key={`${card.id}-${i}`}
          position={[(i - (hand.length - 1) / 2) * spacing, centerY, 0]}
          rotation={[HAND_TILT, 0, 0]}
        >
          <CardMesh
            card={card}
            isFaceUp
            renderOrder={20}
            scale={1}
            rotation={[0, 0, 0]}
          />
        </group>
      ))}
    </group>
  );
}
