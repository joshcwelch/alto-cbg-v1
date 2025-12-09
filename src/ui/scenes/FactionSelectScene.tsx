import { selectFaction } from "../../game/profile/playerProfile";

type FactionSelectSceneProps = {
  onSelect: (factionId: string) => void;
};

const factions = [
  { id: "Voidborn", label: "Voidborn", blurb: "Whispers, husks, and abyssal rebirth." },
  { id: "Ember Crown", label: "Ember Crown", blurb: "Fury-fed flames and relentless assault." }
];

export default function FactionSelectScene({ onSelect }: FactionSelectSceneProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/assets/ui/menus/map.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "grid",
        placeItems: "center",
        padding: "32px"
      }}
    >
      <div
        style={{
          padding: "18px 22px",
          borderRadius: 18,
          backdropFilter: "blur(8px)",
          background: "linear-gradient(135deg, rgba(8,16,28,0.86), rgba(7,12,20,0.82))",
          boxShadow: "0 16px 36px rgba(0,0,0,0.45)",
          color: "#f0f5ff",
          minWidth: 420
        }}
      >
        <h2 style={{ marginTop: 0, letterSpacing: 0.7 }}>Choose Your Faction</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {factions.map(faction => (
            <button
              key={faction.id}
              onClick={() => {
                selectFaction(faction.id);
                onSelect(faction.id);
              }}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
                color: "#e6f3ff",
                textAlign: "left",
                cursor: "pointer",
                boxShadow: "0 12px 26px rgba(0,0,0,0.35)"
              }}
            >
              <div style={{ fontWeight: 800 }}>{faction.label}</div>
              <div style={{ fontSize: 12, opacity: 0.76 }}>{faction.blurb}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
