import type { UnitOnBoard } from "../core/cardTypes";
import { useGameStore } from "../state/useGameStore";
import CardMesh from "./CardMesh";

type LaneKey = "top" | "middle" | "bottom";

const laneOrder: LaneKey[] = ["top", "middle", "bottom"];
const laneSpacing = 0.9;
const laneZ: Record<LaneKey, number> = {
  top: -laneSpacing,
  middle: 0,
  bottom: laneSpacing
};
const SPACING = 1.6;
const ROW_Y = 0.2;
const laneWidth = 10;
const laneHeight = 1;

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
      <group renderOrder={1}>
        {laneOrder.map(lane => (
          <mesh
            key={`lane-${lane}`}
            position={[0, 0.02, laneZ[lane]]}
            rotation={[0, 0, 0]}
            renderOrder={1}
          >
            <planeGeometry args={[laneWidth, laneHeight]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.18} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {laneOrder.map(lane => {
        const laneUnits = lanes[lane];
        if (laneUnits.length === 0) return null;

        return laneUnits.map((u, idx) => (
          <group
            key={u.uid}
            position={[
              (idx - (laneUnits.length - 1) / 2) * SPACING,
              ROW_Y,
              laneZ[lane]
            ]}
          >
            <CardMesh
              card={u.base}
              scale={1}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              enableHover={false}
              renderOrder={10}
            />
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
