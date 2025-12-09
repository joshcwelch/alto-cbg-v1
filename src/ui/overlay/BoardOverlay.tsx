import { useMemo } from "react";
import { useGameStore } from "../../state/useGameStore";
import UnitToken from "../units/UnitToken";
import useWorldAnchor from "./useWorldAnchor";
import type { UnitTokenRuntime } from "../../game/units/unitTypes";
import "./boardOverlay.css";

function AnchoredUnit({ unit }: { unit: UnitTokenRuntime }) {
  const anchor = useWorldAnchor(unit.laneIndex, unit.slotIndex, unit.ownerId);
  return <UnitToken unit={unit} anchor={anchor} />;
}

export default function BoardOverlay() {
  const unitsByPlayer = useGameStore(s => s.board?.unitsByPlayer ?? { player: [], enemy: [] });

  const allUnits = useMemo(
    () => [...(unitsByPlayer.player ?? []), ...(unitsByPlayer.enemy ?? [])],
    [unitsByPlayer.enemy, unitsByPlayer.player]
  );

  return (
    <div className="board-overlay">
      {allUnits.map(unit => (
        <AnchoredUnit key={unit.id} unit={unit} />
      ))}
    </div>
  );
}
