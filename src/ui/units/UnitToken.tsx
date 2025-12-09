import React from "react";
import type { UnitTokenRuntime } from "../../game/units/unitTypes";
import { factionClass } from "../../game/factions/factions";
import type { AnchorPoint } from "../overlay/useWorldAnchor";
import useUnitTokenFx from "./useUnitTokenFx";
import "./unitToken.css";

type Props = {
  unit: UnitTokenRuntime;
  anchor: AnchorPoint;
};

export default function UnitToken({ unit, anchor }: Props) {
  const fxClass = useUnitTokenFx(unit.id);
  const glowClass = factionClass(unit.faction);
  const style: React.CSSProperties = {
    left: anchor.left,
    top: anchor.top,
    ["--unit-scale" as string]: anchor.scale ?? 1
  };

  return (
    <div className={`unit-token ${glowClass} ${fxClass ?? ""}`} style={style}>
      <div className="unit-token-inner">
        <img className="unit-portrait" src={unit.portraitUrl ?? "/assets/ui/portrait-missing.png"} alt="" />
        <img className="unit-frame" src="/assets/ui/frames/minion.png" alt="" draggable={false} />
        <div className="unit-stats">
          <span className="atk">{unit.attack}</span>
          <span className="hp">{unit.health}</span>
        </div>
        <div className="status-row">
          {unit.sleeping && <span className="status chip">Z</span>}
          {unit.shielded && <span className="status chip">🛡️</span>}
          {unit.silenced && <span className="status chip">🔇</span>}
          {unit.status?.map((s, i) => (
            <span key={i} className="status dot" data-status={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
