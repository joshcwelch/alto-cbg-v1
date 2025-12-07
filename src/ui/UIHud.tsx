import { useGameStore } from "../state/useGameStore";
import { STAGE_W } from "./BoardStage";

export default function UIHud() {
  const mana = useGameStore(s => s.playerMana);
  const maxMana = useGameStore(s => s.maxMana);
  const endTurn = useGameStore(s => s.endTurn);

  return (
    <div
      style={{
        position: "absolute",
        width: STAGE_W,
        inset: 0,
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          pointerEvents: "auto",
          color: "#fff",
          fontWeight: "bold",
          fontSize: 20,
          textShadow: "0 2px 4px rgba(0,0,0,0.4)"
        }}
      >
        Mana: {mana}/{maxMana}
      </div>

      <button
        onClick={endTurn}
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          pointerEvents: "auto",
          padding: "12px 20px",
          borderRadius: 12,
          background: "#42b7ff",
          border: "none",
          color: "#fff",
          fontWeight: 800,
          boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
          cursor: "pointer"
        }}
      >
        End Turn
      </button>
    </div>
  );
}
