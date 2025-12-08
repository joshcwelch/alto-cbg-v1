import { useMemo } from "react";
import { useGameStore } from "../state/useGameStore";
import type { BoardAnchors } from "./boardAnchors";

type UIHudProps = {
  safeBottom?: number;
  anchors?: BoardAnchors;
};

type HeroPanelProps = {
  label: string;
  heroName?: string;
  health: number;
  mana: number;
  maxMana: number;
  align: "top" | "bottom";
  accent: string;
  onClick?: () => void;
  canBeAttacked?: boolean;
  heroPower?: { name: string; cost: number; text: string };
  onHeroPower?: () => void;
  heroPowerDisabled?: boolean;
};

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

const HeroPanel = ({
  label,
  heroName,
  health,
  mana,
  maxMana,
  align,
  accent,
  onClick,
  canBeAttacked,
  heroPower,
  onHeroPower,
  heroPowerDisabled
}: HeroPanelProps) => (
  <div
    onClick={onClick}
    style={{
      background: "linear-gradient(145deg, rgba(13,24,40,0.92), rgba(7,12,20,0.94))",
      borderRadius: 16,
      padding: "12px 14px",
      border: `1px solid ${accent}`,
      boxShadow: "0 10px 24px rgba(0,0,0,0.32)",
      minWidth: 190,
      color: "#e7f2ff",
      pointerEvents: "auto",
      cursor: onClick ? "pointer" : "default",
      transform: canBeAttacked ? "translateZ(0) scale(1.01)" : "none",
      position: "relative",
      overflow: "hidden"
    }}
  >
    {canBeAttacked && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(120% 120% at 50% 50%, rgba(90,205,255,0.08), rgba(0,0,0,0))",
          pointerEvents: "none"
        }}
      />
    )}
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: "linear-gradient(135deg, #1f2d45, #152032)",
          border: `1px solid ${accent}`,
          boxShadow: "0 0 14px rgba(80,180,255,0.35) inset"
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontWeight: 800, letterSpacing: 0.6 }}>{label}</div>
        {heroName && <div style={{ fontSize: 12, opacity: 0.8 }}>{heroName}</div>}
        <div style={{ fontSize: 13, opacity: 0.85 }}>Health: {health}</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          Mana: {mana}/{maxMana}
        </div>
      </div>
    </div>
    <ManaPips mana={mana} maxMana={maxMana} />
    {onClick && (
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          fontWeight: 700,
          opacity: canBeAttacked ? 1 : 0.7,
          color: canBeAttacked ? "#b7f0ff" : "#94a9c5"
        }}
      >
        {align === "top" ? "Click to attack hero" : "Your hero"}
      </div>
    )}
    {heroPower && (
      <button
        onClick={onHeroPower}
        disabled={heroPowerDisabled}
        style={{
          marginTop: 10,
          width: "100%",
          padding: "8px 10px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.18)",
          background: heroPowerDisabled
            ? "linear-gradient(135deg, #3a4a64, #2a3242)"
            : "linear-gradient(135deg, #74d2ff, #3e9bff)",
          color: heroPowerDisabled ? "#9eb6d6" : "#081422",
          fontWeight: 800,
          cursor: heroPowerDisabled ? "not-allowed" : "pointer",
          boxShadow: heroPowerDisabled ? "none" : "0 6px 14px rgba(0,0,0,0.3)",
          textAlign: "left"
        }}
      >
        <div style={{ fontSize: 12, marginBottom: 2, display: "flex", justifyContent: "space-between" }}>
          <span>{heroPower.name}</span>
          <span>Cost {heroPower.cost}</span>
        </div>
        <div style={{ fontSize: 11, opacity: 0.9, lineHeight: 1.2 }}>{heroPower.text}</div>
      </button>
    )}
  </div>
);

export default function UIHud({ safeBottom = 90, anchors }: UIHudProps) {
  const mana = useGameStore(s => s.playerMana);
  const maxMana = useGameStore(s => s.maxMana);
  const enemyMana = useGameStore(s => s.enemyMana);
  const enemyMaxMana = useGameStore(s => s.enemyMaxMana);
  const playerHealth = useGameStore(s => s.playerHealth);
  const enemyHealth = useGameStore(s => s.enemyHealth);
  const playerHero = useGameStore(s => s.playerHero);
  const enemyHero = useGameStore(s => s.enemyHero);
  const playerHeroPowerUsed = useGameStore(s => s.playerHeroPowerUsed);
  const turn = useGameStore(s => s.turn);
  const turnNumber = useGameStore(s => s.turnNumber);
  const endTurn = useGameStore(s => s.endTurn);
  const winner = useGameStore(s => s.winner);
  const attackUnit = useGameStore(s => s.attackUnit);
  const selectedId = useGameStore(s => s.selectedAttackerId);
  const battlefieldUnits = useGameStore(s => s.battlefieldUnits);
  const newGame = useGameStore(s => s.newGame);
  const useHeroPower = useGameStore(s => s.useHeroPower);
  const playerHeroPower = playerHero === "Tharos"
    ? { name: "Flame Shot", cost: 2, text: "Deal 1 damage to the enemy hero." }
    : { name: "Hero Power", cost: 2, text: "Standard hero power." };
  const enemyHeroPower = enemyHero === "Lyra"
    ? { name: "Radiant Heal", cost: 2, text: "Restore 2 Health to your hero." }
    : { name: "Hero Power", cost: 2, text: "Standard hero power." };

  const bottomOffset = useMemo(() => Math.max(24, safeBottom * 0.75), [safeBottom]);
  const playerBoardTop = anchors ? anchors.playerBoard.top * 100 : undefined;
  const playerBoardHeight = anchors ? anchors.playerBoard.height * 100 : undefined;
  const hudRowY = playerBoardTop !== undefined && playerBoardHeight !== undefined
    ? playerBoardTop + playerBoardHeight * 0.12
    : undefined;
  const manaTrayY = hudRowY !== undefined ? hudRowY + 12 : undefined;

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
          left: "clamp(16px, 3vw, 36px)",
          pointerEvents: "auto"
        }}
      >
        <HeroPanel
          label="Enemy"
          heroName={enemyHero}
          health={enemyHealth}
          mana={enemyMana}
          maxMana={enemyMaxMana}
          align="top"
          accent="#52d3ff"
          onClick={canAttackHero ? attackEnemyHero : undefined}
          canBeAttacked={canAttackHero}
          heroPower={enemyHeroPower}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: hudRowY === undefined ? `${bottomOffset}px` : undefined,
          top: hudRowY !== undefined ? `${hudRowY}vh` : undefined,
          left: "clamp(18px, 3vw, 44px)",
          pointerEvents: "auto"
        }}
      >
        <HeroPanel
          label="You"
          heroName={playerHero}
          health={playerHealth}
          mana={mana}
          maxMana={maxMana}
          align="bottom"
          accent="#5ee4b8"
          heroPower={playerHeroPower}
          onHeroPower={() => useHeroPower("player")}
          heroPowerDisabled={turn !== "player" || winner != null || playerHeroPowerUsed || mana < 2}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: manaTrayY === undefined ? `${bottomOffset + 12}px` : undefined,
          top: manaTrayY !== undefined ? `${manaTrayY}vh` : undefined,
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
        disabled={turn !== "player" || Boolean(winner)}
        style={{
          position: "absolute",
          top: "50%",
          right: "clamp(22px, 3vw, 46px)",
          transform: "translateY(-50%)",
          pointerEvents: "auto",
          padding: "16px 26px",
          borderRadius: 28,
          background: "linear-gradient(180deg, #8ae5ff 0%, #4ac4ff 55%, #2c9bff 100%)",
          border: "2px solid rgba(255,255,255,0.16)",
          color: "#0a1a2e",
          fontWeight: 900,
          fontSize: 16,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          boxShadow: "0 12px 26px rgba(0,0,0,0.35), 0 0 16px rgba(100,210,255,0.6)",
          cursor: turn === "player" && !winner ? "pointer" : "not-allowed",
          opacity: turn === "player" && !winner ? 1 : 0.6,
          transition: "transform 120ms ease, box-shadow 160ms ease"
        }}
        onMouseDown={e => {
          if (turn !== "player" || winner) return;
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-48%) scale(0.98)";
        }}
        onMouseUp={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%)";
        }}
      >
        End Turn
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
          <div style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, letterSpacing: 0.8 }}>
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
