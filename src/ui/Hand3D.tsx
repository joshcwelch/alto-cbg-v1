import { useGameStore } from "../state/useGameStore";
import CardMesh from "./CardMesh";

const ROW_Y = -2.2;
const SPACING = 1.4;

export default function Hand3D() {
  const hand = useGameStore(s => s.hand);

  return (
    <group>
      {hand.map((card, i) => (
        <group
          key={`${card.id}-${i}`}
          position={[(i - (hand.length - 1) / 2) * SPACING, ROW_Y, 0]}
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
