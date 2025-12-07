import { useGameStore } from "../state/useGameStore";
import Card from "./Card";

export default function Battlefield() {
  const units = useGameStore(s => s.battlefield);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1280,
        top: 260,
        height: 180,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
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
