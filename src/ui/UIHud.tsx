import { useMemo } from "react";
import { useGameStore } from "../state/useGameStore";
import type { BoardAnchors } from "./boardAnchors";

type UIHudProps = {
  safeBottom?: number;
  anchors?: BoardAnchors;
};

export default function UIHud({ safeBottom = 90, anchors }: UIHudProps) {
  const mana = useGameStore(s => s.playerMana);
  const maxMana = useGameStore(s => s.maxMana);
  const endTurn = useGameStore(s => s.endTurn);

  const bottomOffset = useMemo(() => Math.max(24, safeBottom * 0.75), [safeBottom]);
  const playerBoardTop = anchors ? anchors.playerBoard.top * 100 : undefined;
  const playerBoardHeight = anchors ? anchors.playerBoard.height * 100 : undefined;
  const hudRowY = playerBoardTop !== undefined && playerBoardHeight !== undefined
    ? playerBoardTop + playerBoardHeight * 0.12
    : undefined;

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
          top: hudRowY !== undefined ? `${hudRowY}vh` : undefined,
          bottom: hudRowY === undefined ? `${bottomOffset}px` : undefined,
          left: "clamp(18px, 3vw, 44px)",
          pointerEvents: "auto",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "clamp(15px, 1.8vw, 22px)",
          textShadow: "0 2px 4px rgba(0,0,0,0.4)",
          padding: "10px 12px",
          borderRadius: 12,
          background: "linear-gradient(135deg, rgba(32,58,88,0.85) 0%, rgba(22,42,72,0.76) 100%)",
          boxShadow: "0 10px 22px rgba(0,0,0,0.35)",
          minWidth: "140px",
          textAlign: "center"
        }}
      >
        Mana: {mana}/{maxMana}
      </div>

      <button
        onClick={endTurn}
        style={{
          position: "absolute",
          top: hudRowY !== undefined ? `${hudRowY}vh` : undefined,
          bottom: hudRowY === undefined ? `${bottomOffset}px` : undefined,
          right: "clamp(18px, 3vw, 44px)",
          pointerEvents: "auto",
          padding: "clamp(12px, 1.4vw, 16px) clamp(18px, 1.8vw, 24px)",
          borderRadius: 16,
          background: "linear-gradient(180deg, #69e5ff 0%, #3fb2ff 70%, #2d82ff 100%)",
          border: "none",
          color: "#fff",
          fontWeight: 800,
          boxShadow: "0 8px 18px rgba(0,0,0,0.32), 0 0 0 2px rgba(255,255,255,0.08) inset",
          cursor: "pointer"
        }}
      >
        End Turn
      </button>
    </div>
  );
}
