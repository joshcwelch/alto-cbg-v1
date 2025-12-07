import type { UnitOnBoard } from "../core/cardTypes";
import { useGameStore } from "../state/useGameStore";
import CardMesh from "./CardMesh";

type LaneKey = "top" | "middle" | "bottom";

const laneOrder: LaneKey[] = ["top", "middle", "bottom"];
const laneZ: Record<LaneKey, number> = {
  top: -1.25,
  middle: 0,
  bottom: 1.25
};
const spacing = 1.6;
const BOARD_TILT = -0.42;
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
            position={[0, 0.051, laneZ[lane]]}
            rotation={[BOARD_TILT, 0, 0]}
            renderOrder={1}
          >
            <planeGeometry args={[laneWidth, laneHeight]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.1} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {laneOrder.map(lane => {
        const laneUnits = lanes[lane];
        if (laneUnits.length === 0) return null;

        const startX = -(laneUnits.length - 1) * spacing * 0.5;

        return laneUnits.map((u, idx) => (
          <group
            key={u.uid}
            position={[startX + idx * spacing, 0.08, laneZ[lane]]}
          >
            <CardMesh
              card={u.base}
              scale={1.05}
              position={[0, 0, 0]}
              rotation={[-0.25, 0, 0]}
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
