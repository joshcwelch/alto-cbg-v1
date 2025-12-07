import { useGameStore } from "../state/useGameStore";

export default function Battlefield() {
  const units = useGameStore(s => s.battlefield);

  return (
    <div
      style={{
        position: "absolute",
        top: "42%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 980,
        height: 220,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 16,
        pointerEvents: "none"
      }}
    >
      {units.map(u => (
        <div key={u.uid} style={{
          width: 120, height: 170, borderRadius: 12, background: "#f6f7fb",
          boxShadow: "0 6px 14px rgba(0,0,0,0.35)", border: "2px solid #2a2f45",
          position: "relative"
        }}>
          <div style={{ position: "absolute", top: 8, left: 8, fontWeight: 800 }}>{u.base.name}</div>
          <div style={{ position: "absolute", bottom: 8, left: 8, fontWeight: 800 }}>⚔ {u.base.attack}</div>
          <div style={{ position: "absolute", bottom: 8, right: 8, fontWeight: 800 }}>❤ {u.base.health - u.damage}</div>
        </div>
      ))}
    </div>
  );
}
