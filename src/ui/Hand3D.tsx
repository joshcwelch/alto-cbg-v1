import { useGameStore } from "../state/useGameStore";
import CardMesh from "./CardMesh";

const spacing = 1.6;
const handHeightOffset = -1.6;
const handDepth = 2.0;
const handTilt = -0.15;

export default function Hand3D() {
  const hand = useGameStore(s => s.hand);
  const startX = hand.length > 0 ? -(hand.length - 1) * spacing * 0.5 : 0;

  return (
    <group position={[0, handHeightOffset, handDepth]} rotation={[handTilt, 0, 0]}>
      {hand.map((card, i) => (
        <group key={`${card.id}-${i}`} position={[startX + i * spacing, 0, 0]}>
          <CardMesh card={card} isFaceUp renderOrder={10} />
        </group>
      ))}
    </group>
  );
}
