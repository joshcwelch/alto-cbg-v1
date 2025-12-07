import { useGameStore } from "../state/useGameStore";
import Card from "./Card";
import type { BoardAnchors } from "./boardAnchors";
import { useAnchors } from "./boardAnchors";

type HandProps = {
  anchors?: BoardAnchors;
};

export default function Hand({ anchors: anchorsProp }: HandProps) {
  const hand = useGameStore(s => s.hand);
  const anchors = anchorsProp ?? useAnchors();
  const gap = `clamp(12px, ${anchors.cardSpacing * 100}vw, 42px)`;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: "clamp(8px, 1.6vh, 18px)",
        transform: "translateX(-50%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap,
        width: "100%",
        pointerEvents: "none",
        paddingInline: "clamp(12px, 3vw, 36px)"
      }}
    >
      {hand.map((card, i) => (
        <div key={`${card.id}-${i}`} style={{ pointerEvents: "auto" }}>
          <Card card={card} />
        </div>
      ))}
    </div>
  );
}
