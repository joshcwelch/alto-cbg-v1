import { useGameStore } from "../state/useGameStore";
import Card from "./Card";

export default function Hand() {
  const hand = useGameStore(s => s.hand);

  return (
    <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", height: 190 }}>
      {hand.map((card, i) => (
        <Card key={card.id + i} card={card} index={i} />
      ))}
    </div>
  );
}
