import { useMemo } from "react";
import { useGameStore } from "../state/useGameStore";

type UIHudProps = {
  safeBottom?: number;
};

export default function UIHud({ safeBottom = 90 }: UIHudProps) {
  const mana = useGameStore(s => s.playerMana);
  const maxMana = useGameStore(s => s.maxMana);
  const endTurn = useGameStore(s => s.endTurn);

  const bottomOffset = useMemo(() => Math.max(24, safeBottom * 0.75), [safeBottom]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none"
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: `${bottomOffset}px`,
          left: "clamp(24px, 2.8vw, 40px)",
          pointerEvents: "auto",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "clamp(16px, 1.8vw, 22px)",
          textShadow: "0 2px 4px rgba(0,0,0,0.4)"
        }}
      >
        Mana: {mana}/{maxMana}
      </div>

      <button
        onClick={endTurn}
        style={{
          position: "absolute",
          bottom: `${bottomOffset}px`,
          right: "clamp(24px, 2.8vw, 40px)",
          pointerEvents: "auto",
          padding: "clamp(10px, 1.3vw, 14px) clamp(16px, 1.6vw, 22px)",
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
