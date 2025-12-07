import { useGameStore } from "../state/useGameStore";
import Card from "./Card";
import { ANCHORS, BOARD } from "./boardAnchors";

export default function Hand() {
  const hand = useGameStore(s => s.hand);
  const centeredX = (i: number, n: number) => (i - (n - 1) / 2) * ANCHORS.cardSpacing;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: BOARD.W,
        top: 480,
        height: 200,
        display: "flex",
        justifyContent: "center",
        gap: 20,
        pointerEvents: "auto"
      }}
    >
      {hand.map((card, i) => {
        const x = centeredX(i, hand.length);
        return (
          <div
            key={`${card.id}-${i}`}
            style={{
              position: "absolute",
              left: `calc(50% + ${x}px)`,
              top: "50%",
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
