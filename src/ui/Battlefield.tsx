import { useGameStore } from "../state/useGameStore";
import Card from "./Card";
import { ANCHORS } from "./boardAnchors";

export default function Battlefield() {
  const units = useGameStore(s => s.battlefield);

  return (
    <div
      style={{
        position: "absolute",
        insetInline: 0,
        top: `${ANCHORS.battlefieldTop * 100}vh`,
        height: `${ANCHORS.battlefieldHeight * 100}vh`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: `${ANCHORS.battlefieldGap * 100}vw`,
        pointerEvents: "none"
      }}
    >
      {units.map(u => (
        <div key={u.uid} style={{ pointerEvents: "auto" }}>
          <Card card={u.base} />
        </div>
      ))}
    </div>
  );
}
