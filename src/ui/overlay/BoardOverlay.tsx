import { useMemo } from "react";
import { useGameStore } from "../../state/useGameStore";
import UnitToken from "../units/UnitToken";
import useWorldAnchor from "./useWorldAnchor";
import type { UnitTokenRuntime } from "../../game/units/unitTypes";
import { useAnchors } from "../boardAnchors";
import "./boardOverlay.css";

function AnchoredUnit({ unit }: { unit: UnitTokenRuntime }) {
  const anchor = useWorldAnchor(unit.laneIndex, unit.slotIndex, unit.ownerId);
  return <UnitToken unit={unit} anchor={anchor} />;
}

export default function BoardOverlay() {
  const unitsByPlayer = useGameStore(s => s.board?.unitsByPlayer ?? { player: [], enemy: [] });
  const anchors = useAnchors();

  const allUnits = useMemo(
    () => [...(unitsByPlayer.player ?? []), ...(unitsByPlayer.enemy ?? [])],
    [unitsByPlayer.enemy, unitsByPlayer.player]
  );

  return (
    <div className="board-overlay">
      <div
        className="lane-debug lane-debug-enemy"
        style={{ top: `${anchors.enemyBoard.top * 100}%`, height: `${anchors.enemyBoard.height * 100}%` }}
      />
      <div
        className="lane-debug lane-debug-player"
        style={{ top: `${anchors.playerBoard.top * 100}%`, height: `${anchors.playerBoard.height * 100}%` }}
      />
      {allUnits.map(unit => (
        <AnchoredUnit key={unit.id} unit={unit} />
      ))}
    </div>
  );
}
