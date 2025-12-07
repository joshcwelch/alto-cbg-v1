import { useGameStore } from "../state/useGameStore";

export default function EndTurnButton() {
  const endTurn = useGameStore(s => s.endTurn);

  return (
    <button
      onClick={endTurn}
      style={{
        position: "absolute",
        right: 20,
        bottom: 20,
        padding: "12px 24px",
        borderRadius: 12,
        fontSize: 18,
        background: "#42b7ff",
        color: "white",
        cursor: "pointer",
        border: "none",
        boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
        fontWeight: 800
      }}
    >
      End Turn
    </button>
  );
}
