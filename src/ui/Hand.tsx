import { useGameStore } from "../state/useGameStore";
import Card from "./Card";
import { ANCHORS } from "./boardAnchors";

export default function Hand() {
  const hand = useGameStore(s => s.hand);
  const centeredX = (i: number, n: number) => (i - (n - 1) / 2) * (ANCHORS.cardSpacing * 100);
  const handYPercent = (ANCHORS.handTop + ANCHORS.handHeight / 2) * 100;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none"
      }}
    >
      {hand.map((card, i) => {
        const x = centeredX(i, hand.length);
        return (
          <div
            key={`${card.id}-${i}`}
            style={{
              position: "absolute",
              left: `${50 + x}%`,
              top: `${handYPercent}%`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto"
            }}
          >
            <Card card={card} />
          </div>
        );
      })}
    </div>
  );
}
