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
  const gap = `clamp(14px, ${anchors.boardSpacing * 100}vw, 44px)`;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap,
        pointerEvents: "none"
      }}
      data-side={side}
    >
      {units.map(u => (
        <div key={u.uid} style={{ pointerEvents: "auto" }}>
          <Card card={u.base} />
        </div>
      ))}
    </div>
  );
}
