import type { UnitOnBoard } from "../core/cardTypes";
import { useGameStore } from "../state/useGameStore";

type LaneKey = "top" | "middle" | "bottom";

const laneOrder: LaneKey[] = ["top", "middle", "bottom"];
const laneY: Record<LaneKey, number> = {
  top: 1.5,
  middle: 0,
  bottom: -1.5
};
const spacing = 2;
const pxPerUnit = 100; // scale board units to pixels

export default function Battlefield() {
  const units = useGameStore(s => s.battlefield);

  const lanes: Record<LaneKey, UnitOnBoard[]> = {
    top: [],
    middle: [],
    bottom: []
  };

  units.forEach(u => {
    const lane = normalizeLane(u.lane);
    lanes[lane].push(u);
  });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {laneOrder.map(lane => {
        const laneUnits = lanes[lane];
        if (laneUnits.length === 0) return null;

        const startX = -(laneUnits.length - 1) * spacing * 0.5;

        return laneUnits.map((u, idx) => {
          const xUnits = startX + idx * spacing;
          const xPx = xUnits * pxPerUnit;
          const yPx = laneY[lane] * pxPerUnit;

          return (
            <div
              key={u.uid}
              style={{
                position: "absolute",
                left: `calc(50% + ${xPx}px)`,
                top: `calc(50% - ${yPx}px)`,
                transform: "translate(-50%, -50%)",
                width: 120,
                height: 170,
                borderRadius: 12,
                background: "#f6f7fb",
                boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
                border: "2px solid #2a2f45",
                pointerEvents: "none"
              }}
            >
              <div style={{ position: "absolute", top: 8, left: 8, fontWeight: 800 }}>{u.base.name}</div>
              <div style={{ position: "absolute", bottom: 8, left: 8, fontWeight: 800 }}>ATK {u.base.attack}</div>
              <div style={{ position: "absolute", bottom: 8, right: 8, fontWeight: 800 }}>HP {u.base.health - u.damage}</div>
            </div>
          );
        });
      })}
    </div>
  );
}

function normalizeLane(lane?: UnitOnBoard["lane"]): LaneKey {
  if (lane === "top" || lane === 1) return "top";
  if (lane === "bottom" || lane === -1) return "bottom";
  return "middle";
}
