import { useGameStore } from "../state/useGameStore";
import Card from "./Card";
import { ANCHORS, BOARD } from "./boardAnchors";

export default function Battlefield() {
  const units = useGameStore(s => s.battlefield);

  const centeredX = (i: number, n: number) => (i - (n - 1) / 2) * ANCHORS.cardSpacing;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: BOARD.W,
        top: ANCHORS.laneY - ANCHORS.laneHeight / 2,
        height: ANCHORS.laneHeight,
        pointerEvents: "none"
      }}
    >
      {units.map((u, idx) => {
        const x = centeredX(idx, units.length);
        return (
          <div
            key={u.uid}
            style={{
              position: "absolute",
              left: `calc(50% + ${x}px)`,
              top: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto"
            }}
          >
            <Card card={u.base} />
          </div>
        );
      })}
    </div>
  );
}
