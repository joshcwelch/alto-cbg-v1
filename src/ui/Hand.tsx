import { useGameStore } from "../state/useGameStore";
import Card from "./Card";

export default function Hand() {
  const hand = useGameStore(s => s.hand);

  return (
    <div className="hand-layer" style={{ display: "flex", gap: 16, justifyContent: "center", pointerEvents: "none" }}>
      {hand.map((card, i) => (
        <div key={`${card.id}-${i}`} style={{ pointerEvents: "auto" }}>
          <Card card={card} />
        </div>
      ))}
    </div>
  );
}
