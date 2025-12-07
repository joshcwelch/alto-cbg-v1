import { useGameStore } from "../state/useGameStore";
import Card from "./Card";
import type { BoardAnchors } from "./boardAnchors";
import { useAnchors } from "./boardAnchors";

type HandProps = {
  anchors?: BoardAnchors;
  side?: "player" | "enemy";
};

export default function Hand({ anchors: anchorsProp, side = "player" }: HandProps) {
  const hand = useGameStore(s => (side === "player" ? s.hand : s.enemyHand));
  const anchors = anchorsProp ?? useAnchors();
  const gap = side === "enemy"
    ? `clamp(10px, ${anchors.cardSpacing * 100}vw, 30px)`
    : `clamp(8px, ${anchors.cardSpacing * 90}vw, 28px)`;

  const count = Math.max(hand.length, 1);
  const angleRange = Math.max(10, Math.min(22, 28 - count * 0.8));

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: side === "player" ? "0" : undefined,
        top: side === "enemy" ? "clamp(6px, 1.2vh, 14px)" : undefined,
        transform: "translateX(-50%)",
        display: "flex",
        justifyContent: "center",
        alignItems: side === "player" ? "flex-end" : "flex-start",
        gap,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        paddingInline: "clamp(12px, 3vw, 36px)"
      }}
    >
      {side === "player" && (
        <div
          className="hand-glass"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "auto 6% 0 6%",
            height: "64%",
            background: "linear-gradient(180deg, rgba(34,61,92,0.38) 0%, rgba(12,24,40,0.6) 70%)",
            borderRadius: "32px 32px 20px 20px",
            boxShadow: "0 16px 46px rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
            pointerEvents: "none"
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: side === "player" ? "flex-end" : "flex-start",
          gap,
          width: "100%",
          pointerEvents: "none",
          zIndex: 2
        }}
      >
        {hand.map((card, i) => {
          const t = count <= 1 ? 0.5 : i / (count - 1);
          const angle = side === "player" ? (t - 0.5) * angleRange : 0;
          const lift = side === "player" ? (-Math.pow((t - 0.5) * 1.15, 2) * 64 + 32) : 0;
          const xNudge = side === "player" ? (t - 0.5) * 14 : 0;

          return (
            <div
              key={`${card.id}-${i}-${side}`}
              style={{
                position: "relative",
                pointerEvents: "auto",
                transform: `translate(${xNudge}px, ${lift}px) rotate(${angle}deg)`,
                transformOrigin: "50% 100%",
                filter: side === "enemy" ? "drop-shadow(0 10px 18px rgba(0,0,0,0.35))" : undefined
              }}
            >
              {side === "player" ? (
                <Card card={card} />
              ) : (
                <div
                  style={{
                    width: "clamp(96px, 9vw, 132px)",
                    height: "clamp(132px, 12vw, 188px)",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #1b2535 0%, #101829 60%, #0b1220 100%)",
                    border: "1px solid rgba(132,176,204,0.35)",
                    boxShadow: "0 10px 28px rgba(0,0,0,0.55)",
                    opacity: 0.9
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
