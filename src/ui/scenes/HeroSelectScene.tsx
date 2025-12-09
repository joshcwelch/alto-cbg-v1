import { HERO_REGISTRY } from "../../game/heroes/heroRegistry";
import { HeroId } from "../../game/heroes/heroTypes";
import { selectHero } from "../../game/profile/playerProfile";

type HeroSelectSceneProps = {
  factionId: string;
  onSelectHero: (heroId: HeroId) => void;
  onBack?: () => void;
};

export default function HeroSelectScene({ factionId, onSelectHero, onBack }: HeroSelectSceneProps) {
  const heroes = Object.values(HERO_REGISTRY).filter(h => h.faction.toLowerCase() === factionId.toLowerCase());

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #0a101c, #0c1a2f)",
        color: "#e7f1ff",
        padding: "32px"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Faction</div>
          <h2 style={{ margin: 0, letterSpacing: 0.8 }}>{factionId}</h2>
        </div>
        {onBack && (
          <button style={secondaryBtn} onClick={onBack}>
            Back
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {heroes.map(hero => (
          <button
            key={hero.id}
            onClick={() => {
              selectHero(hero.id);
              onSelectHero(hero.id);
            }}
            style={{
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
              padding: 14,
              color: "#e7f1ff",
              textAlign: "left",
              display: "grid",
              gap: 8,
              cursor: "pointer",
              boxShadow: "0 16px 32px rgba(0,0,0,0.35)",
              transition: "transform 140ms ease, box-shadow 140ms ease"
            }}
          >
            <div
              style={{
                borderRadius: 14,
                overflow: "hidden",
                height: 160,
                backgroundImage: `url(${hero.portraitPath})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)"
              }}
            />
            <div style={{ fontWeight: 800 }}>{hero.name}</div>
            <div style={{ fontSize: 12, opacity: 0.78 }}>{hero.passive.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const secondaryBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.08)",
  color: "#e7f1ff",
  cursor: "pointer"
};
