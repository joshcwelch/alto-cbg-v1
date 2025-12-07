import { useGameStore } from "../state/useGameStore";
import Card from "./Card";

const CARD_SPACING = 140;

export default function Hand() {
  const hand = useGameStore(s => s.hand);
  const start = hand.length > 0 ? -((hand.length - 1) * CARD_SPACING) / 2 : 0;

  return (
    <div className="hand-layer">
      {hand.map((card, i) => {
        const xOffset = start + i * CARD_SPACING;
        return <Card key={`${card.id}-${i}`} card={card} xOffset={xOffset} />;
      })}
    </div>
  );
}
