import { useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { useGameStore } from "../state/useGameStore";
import CardMesh from "../../apps/client/src/game/cards/CardMesh";
import type { CardState, CardVisual } from "../../apps/client/src/game/cards/types";
import { useAnchors } from "./boardAnchors";

const HAND_TILT = -0.08;

export default function Hand3D() {
  const hand = useGameStore(s => s.hand);
  const viewport = useThree(state => state.viewport);
  const anchors = useAnchors();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { spacing, centerY } = useMemo(() => {
    const handCenterRatio = anchors.playerHand.center;
    const spacingWorld = viewport.width * anchors.cardSpacing;
    const centerYWorld = (0.5 - handCenterRatio) * viewport.height;
    return { spacing: spacingWorld, centerY: centerYWorld };
  }, [anchors.cardSpacing, anchors.playerHand.center, viewport.height, viewport.width]);

  return (
    <group>
      {hand.map((card, i) => {
        const state: CardState = hoveredIdx === i ? "hover" : "idle";
        const visual: CardVisual = {
          id: card.id,
          name: card.name,
          cost: card.cost,
          rarity: "common",
          foil: card.cost >= 4,
          state,
        };

        return (
          <group
            key={`${card.id}-${i}`}
            position={[(i - (hand.length - 1) / 2) * spacing, centerY, 0]}
            rotation={[HAND_TILT, 0, 0]}
          >
            <CardMesh
              visual={visual}
              renderOrder={20}
              shadow={false}
              onPointerOver={() => setHoveredIdx(i)}
              onPointerOut={() => setHoveredIdx(null)}
            />
          </group>
        );
      })}
    </group>
  );
}