import { useGameStore } from "../state/useGameStore";
import type { UnitOnBoard } from "../core/cardTypes";
import Card from "./Card";
import type { BoardAnchors } from "./boardAnchors";
import { useAnchors } from "./boardAnchors";

type BattlefieldProps = {
  anchors?: BoardAnchors;
  side?: "player" | "enemy";
  units?: UnitOnBoard[];
};

export default function Battlefield({ anchors: anchorsProp, side = "player", units: providedUnits }: BattlefieldProps) {
  const anchors = anchorsProp ?? useAnchors();
  const units = providedUnits ?? useGameStore(s => s.battlefield);
  const gap = `clamp(12px, ${anchors.boardSpacing * 100}vw, 38px)`;
  const slots = Array.from({ length: 5 }, (_, i) => units[i] ?? null);
  const laneScale = side === "enemy" ? anchors.laneScale.enemy : anchors.laneScale.player;

  return (
    <div
      style={{
        position: "relative",
        width: "90%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        justifyItems: "center",
        alignItems: "center",
        gap,
        pointerEvents: "none",
        transform: `scale(${laneScale})`,
        transformOrigin: side === "enemy" ? "50% 15%" : "50% 85%",
        filter: side === "enemy" ? "drop-shadow(0 -6px 18px rgba(0,0,0,0.28))" : "drop-shadow(0 6px 18px rgba(0,0,0,0.28))"
      }}
      data-side={side}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "18% 6%",
          borderRadius: 18,
          background: side === "enemy"
            ? "linear-gradient(180deg, rgba(36,59,90,0.32) 0%, rgba(24,44,72,0.24) 100%)"
            : "linear-gradient(180deg, rgba(18,38,64,0.22) 0%, rgba(12,28,52,0.18) 100%)",
          boxShadow: side === "player"
            ? "0 16px 32px rgba(0,0,0,0.35), 0 -6px 18px rgba(120,200,255,0.14) inset"
            : "0 12px 26px rgba(0,0,0,0.32)",
          pointerEvents: "none",
          zIndex: 0
        }}
      />
      {slots.map((unit, idx) => (
        <div
          key={`${side}-slot-${idx}`}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            maxWidth: "min(18vw, 240px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none"
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "18% 28%",
              borderRadius: 12,
              opacity: 0.35,
              background: "linear-gradient(180deg, rgba(108,142,186,0.18) 0%, rgba(74,108,152,0.08) 100%)",
              boxShadow: "0 0 0 1px rgba(132,172,210,0.24) inset"
            }}
          />
          {unit && (
            <div style={{ pointerEvents: "auto", zIndex: 2 }}>
              <Card card={unit.base} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
