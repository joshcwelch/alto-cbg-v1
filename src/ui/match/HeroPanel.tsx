import type { PlayerId } from "../../core/cardTypes";
import { HERO_REGISTRY } from "../../game/heroes/heroRegistry";
import { HeroId } from "../../game/heroes/heroTypes";
import { canUseHeroPower, canUseUltimate, useHeroPower, useUltimate } from "../../game/state/turnManager";
import { useGameStore } from "../../state/useGameStore";

type HeroPanelProps = {
  playerId: PlayerId;
  align?: "top" | "bottom";
};

const badgeStyle: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 12,
  fontSize: 12,
  fontWeight: 800,
  background: "rgba(255,255,255,0.08)"
};

export default function HeroPanel({ playerId, align = "bottom" }: HeroPanelProps) {
  const heroStates = useGameStore(s => s.heroStates);
  const mana = useGameStore(s => (playerId === "player" ? s.playerMana : s.enemyMana));
  const maxMana = useGameStore(s => (playerId === "player" ? s.maxMana : s.enemyMaxMana));
  const health = useGameStore(s => (playerId === "player" ? s.playerHealth : s.enemyHealth));
  const heroState = heroStates[playerId];
  const heroId = heroState?.heroId ?? HeroId.EMBER_THAROS;
  const hero = HERO_REGISTRY[heroId];
  const canPower = canUseHeroPower(playerId);
  const canUlt = canUseUltimate(playerId);

  const charges = heroState?.passiveState.voidCharges ?? 0;
  const fury = heroState?.passiveState.fury ?? 0;

  return (
    <div
      style={{
        minWidth: 240,
        borderRadius: 16,
        padding: 12,
        background: "linear-gradient(145deg, rgba(10,18,30,0.9), rgba(6,12,22,0.92))",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
        color: "#e8f2ff",
        textAlign: "left",
        pointerEvents: "auto",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            align === "top"
              ? "radial-gradient(110% 90% at 50% 0%, rgba(90,220,255,0.08), rgba(0,0,0,0))"
              : "radial-gradient(110% 90% at 50% 100%, rgba(120,255,190,0.12), rgba(0,0,0,0))",
          pointerEvents: "none"
        }}
      />
      <div style={{ display: "flex", gap: 12 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            backgroundImage: `url(${hero?.portraitPath})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 12px 24px rgba(0,0,0,0.35)"
          }}
        />
        <div style={{ display: "grid", gap: 4, alignContent: "center" }}>
          <div style={{ fontWeight: 800 }}>{hero?.name}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>{hero?.faction}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <div style={badgeStyle}>Mana {mana}/{maxMana}</div>
            <div style={badgeStyle}>Health {health}</div>
            {heroId === HeroId.VOID_LYRA && <div style={badgeStyle}>Void {charges}</div>}
            {heroId === HeroId.EMBER_THAROS && <div style={badgeStyle}>Fury {fury}/10</div>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        <button
          title={hero?.heroPower.description}
          onClick={() => useHeroPower(playerId)}
          disabled={!canPower}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: canPower ? "linear-gradient(135deg, #68e6ff, #3aa0ff)" : "linear-gradient(135deg, #3b4a62, #2c3446)",
            color: canPower ? "#051224" : "#9aafcc",
            fontWeight: 800,
            cursor: canPower ? "pointer" : "not-allowed",
            boxShadow: canPower ? "0 10px 22px rgba(0,0,0,0.35)" : "none",
            transform: canPower ? "translateZ(0)" : "none",
            transition: "transform 120ms ease, box-shadow 140ms ease"
          }}
        >
          Hero Power — Cost {hero?.heroPower.cost}: {hero?.heroPower.name}
        </button>

        <button
          title={hero?.ultimate.description}
          onClick={() => useUltimate(playerId)}
          disabled={!canUlt}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.2)",
            background: canUlt ? "linear-gradient(135deg, #ffd27c, #ff9248)" : "linear-gradient(135deg, #3b4a62, #2c3446)",
            color: canUlt ? "#1f0f04" : "#9aafcc",
            fontWeight: 900,
            cursor: canUlt ? "pointer" : "not-allowed",
            boxShadow: canUlt ? "0 12px 26px rgba(0,0,0,0.35)" : "none",
            transform: canUlt ? "translateZ(0)" : "none",
            transition: "transform 120ms ease, box-shadow 140ms ease"
          }}
        >
          Ultimate — Cost {hero?.ultimate.cost}: {hero?.ultimate.name}
        </button>
      </div>
    </div>
  );
}
