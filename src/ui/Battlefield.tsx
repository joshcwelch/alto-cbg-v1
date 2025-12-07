import type { UnitOnBoard } from "../core/cardTypes";
import { useGameStore } from "../state/useGameStore";
import CardMesh from "./CardMesh";

type LaneKey = "top" | "middle" | "bottom";

const laneOrder: LaneKey[] = ["top", "middle", "bottom"];
const laneY: Record<LaneKey, number> = {
  top: 1.5,
  middle: 0,
  bottom: -1.5
};
const spacing = 1.6;

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
    <group>
      {laneOrder.map(lane => {
        const laneUnits = lanes[lane];
        if (laneUnits.length === 0) return null;

        const startX = -(laneUnits.length - 1) * spacing * 0.5;

        return laneUnits.map((u, idx) => (
          <group
            key={u.uid}
            position={[startX + idx * spacing, laneY[lane], 0]}
          >
            <CardMesh card={u.base} scale={0.85} position={[0, 0.01, 0]} />
          </group>
        ));
      })}
    </group>
  );
}

function normalizeLane(lane?: UnitOnBoard["lane"]): LaneKey {
  if (lane === "top" || lane === 1) return "top";
  if (lane === "bottom" || lane === -1) return "bottom";
  return "middle";
}
