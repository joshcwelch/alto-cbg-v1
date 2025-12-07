import type { UnitOnBoard } from "../core/cardTypes";
import { useGameStore } from "../state/useGameStore";
import Card from "./Card";
import { boardAnchors } from "./boardAnchors";

export default function Battlefield() {
  const units = useGameStore(s => s.battlefield);

  return (
    <div
      className="battlefield-lane"
      style={{
        position: "absolute",
        top: boardAnchors.laneY,
        height: boardAnchors.laneHeight,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "32px",
        pointerEvents: "none"
      }}
    >
      {units.map(u => (
        <div key={u.uid} style={{ pointerEvents: "auto" }}>
          <Card card={u.base} index={0} />
        </div>
      ))}
    </div>
  );
}
