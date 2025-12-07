import { useGameStore } from "../state/useGameStore";
import CardMesh from "./CardMesh";

const spacing = 1.6;
const handHeightOffset = -2.2;

export default function Hand3D() {
  const hand = useGameStore(s => s.hand);
  const startX = hand.length > 0 ? -(hand.length - 1) * spacing * 0.5 : 0;

  return (
    <group position={[0, handHeightOffset, 0]}>
      {hand.map((card, i) => (
        <group key={`${card.id}-${i}`} position={[startX + i * spacing, 0, 0]}>
          <CardMesh card={card} isFaceUp renderOrder={5} />
        </group>
      ))}
    </group>
  );
}
