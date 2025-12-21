import { useMemo } from "react";
import { useGameStore } from "../state/useGameStore";
import type { BoardAnchors } from "./boardAnchors";
import HeroPanel from "./match/HeroPanel";

type UIHudProps = {
  safeBottom?: number;
  anchors?: BoardAnchors;
};

const GRAVEYARD_IMAGE_URL = "/assets/ui/graveyard-the-void.png";

const ManaPips = ({ mana, maxMana }: { mana: number; maxMana: number }) => {
  const total = Math.max(1, maxMana || mana || 1);
  return (
    <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
      {Array.from({ length: Math.min(10, total) }, (_, i) => {
        const filled = i < mana;
        return (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: filled
                ? "linear-gradient(135deg, #7de5ff, #46b3ff)"
                : "rgba(110,146,180,0.4)",
              boxShadow: filled ? "0 0 8px rgba(90,205,255,0.7)" : "inset 0 0 0 1px rgba(255,255,255,0.18)",
              transition: "transform 120ms ease, box-shadow 120ms ease",
              transform: filled ? "translateY(-1px)" : "none"
            }}
          />
        );
      })}
    </div>
  );
};

export default function UIHud({ safeBottom = 90, anchors }: UIHudProps) {
  const mana = useGameStore(s => s.playerMana);
  const maxMana = useGameStore(s => s.maxMana);
  const turn = useGameStore(s => s.turn);
  const turnNumber = useGameStore(s => s.turnNumber);
  const winner = useGameStore(s => s.winner);
  const endTurn = useGameStore(s => s.endTurn);
  const attackUnit = useGameStore(s => s.attackUnit);
  const selectedId = useGameStore(s => s.selectedAttackerId);
  const battlefieldUnits = useGameStore(s => s.battlefieldUnits);
  const newGame = useGameStore(s => s.newGame);

  const bottomOffset = useMemo(() => Math.max(24, safeBottom * 0.75), [safeBottom]);
  const playerBoardTop = anchors ? anchors.playerBoard.top * 100 : undefined;
  const playerBoardHeight = anchors ? anchors.playerBoard.height * 100 : undefined;
  const hudRowY = playerBoardTop !== undefined && playerBoardHeight !== undefined
    ? playerBoardTop + playerBoardHeight * 0.12
    : undefined;
  const manaTrayY = hudRowY !== undefined ? hudRowY + 12 : undefined;
  const midGapCenter = anchors
    ? anchors.enemyBoard.top + anchors.enemyBoard.height + anchors.boardGap / 2
    : undefined;
  const midGapY = midGapCenter !== undefined ? midGapCenter * 100 : undefined;

  const selectedUnit = useMemo(
    () => battlefieldUnits.find(u => u.uid === selectedId),
    [battlefieldUnits, selectedId]
  );

  const canAttackHero = Boolean(
    selectedUnit &&
    !selectedUnit.exhausted &&
    turn === "player" &&
    !winner
  );

  const attackEnemyHero = () => {
    if (!selectedId || !canAttackHero) return;
    attackUnit(selectedId, { type: "hero", playerId: "enemy" });
  };

  const turnLabel = winner
    ? winner === "draw"
      ? "Draw"
      : winner === "player"
        ? "Victory"
        : "Defeat"
    : turn === "player"
      ? "Your Turn"
      : "Enemy Turn";

  const canEndTurn = turn === "player" && !winner;
  const endTurnAsset = canEndTurn
    ? "/assets/ui/end-turn-active.png"
    : "/assets/ui/end-turn-inactive.png";

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
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 16px",
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(38,78,132,0.92), rgba(20,40,74,0.92))",
          color: "#fff",
          fontWeight: 800,
          letterSpacing: 0.5,
          boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
          pointerEvents: "none",
          display: "flex",
          gap: 10,
          alignItems: "center",
          minWidth: 180,
          justifyContent: "center",
          textTransform: "uppercase"
        }}
      >
        <span style={{ opacity: 0.86, fontSize: 13 }}>Turn {turnNumber}</span>
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: winner
              ? "#39465e"
              : turn === "player"
                ? "linear-gradient(135deg, #5ce3b0, #2db087)"
                : "linear-gradient(135deg, #ffd27a, #f0b542)",
            color: "#0b1628",
            boxShadow: winner ? "none" : "0 0 12px rgba(255,255,255,0.22)",
            fontSize: 12
          }}
        >
          {turnLabel}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          top: "28px",
          left: 36,
          transform: "translateY(30px)",
          pointerEvents: "auto"
        }}
      >
        <div
          onClick={canAttackHero ? attackEnemyHero : undefined}
          style={{ cursor: canAttackHero ? "pointer" : "default", transform: canAttackHero ? "translateZ(0) scale(1.01)" : "none" }}
        >
          <HeroPanel playerId="enemy" align="top" />
        </div>
      </div>

      {midGapY !== undefined && (
        <img
          src={GRAVEYARD_IMAGE_URL}
          alt=""
          style={{
            position: "absolute",
            top: `${midGapY}%`,
            left: 36,
            transform: "translateY(-50%)",
            width: 115,
            height: "auto",
            pointerEvents: "none",
            zIndex: 1,
            filter: "drop-shadow(0 12px 20px rgba(8, 6, 18, 0.55))"
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          bottom: hudRowY === undefined ? `${bottomOffset}px` : undefined,
          top: hudRowY !== undefined ? `${hudRowY}%` : undefined,
          left: 44,
          transform: "translateY(30px)",
          pointerEvents: "auto"
        }}
      >
        <HeroPanel playerId="player" align="bottom" />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: manaTrayY === undefined ? `${bottomOffset + 12}px` : undefined,
          top: manaTrayY !== undefined ? `${manaTrayY}%` : undefined,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(9,16,26,0.68)",
            borderRadius: 16,
            padding: "6px 10px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 24px rgba(0,0,0,0.32)"
          }}
        >
          <span style={{ color: "#9fb5d4", fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }}>Mana</span>
          <ManaPips mana={mana} maxMana={maxMana} />
        </div>
      </div>

      <button
        onClick={endTurn}
        disabled={!canEndTurn}
        style={{
          position: "absolute",
          top: "50%",
          right: 46,
          transform: "translateY(-50%)",
          pointerEvents: "auto",
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: canEndTurn ? "pointer" : "not-allowed"
        }}
        onMouseDown={e => {
          if (!canEndTurn) return;
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-48%) scale(0.98)";
        }}
        onMouseUp={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%)";
        }}
      >
        <img
          src={endTurnAsset}
          alt="End Turn"
          draggable={false}
          style={{
            width: 260,
            height: "auto",
            display: "block",
            filter: canEndTurn ? "drop-shadow(0 10px 18px rgba(0,0,0,0.45))" : "none",
            opacity: canEndTurn ? 1 : 0.82
          }}
        />
      </button>

      {winner && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
            background: "radial-gradient(120% 120% at 50% 50%, rgba(6,10,20,0.05), rgba(6,10,20,0.65))",
            color: "#fff",
            flexDirection: "column",
            gap: 12
          }}
        >
          <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: 0.8 }}>
            {winner === "draw" ? "Draw" : winner === "player" ? "Victory!" : "Defeat"}
          </div>
          <button
            onClick={newGame}
            style={{
              padding: "12px 18px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #63e6be, #2fba8d)",
              color: "#0a182b",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 16px rgba(0,0,0,0.35)"
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
