import { listDecksForHero, setSelectedDeck } from "../../game/profile/playerProfile";
import { HeroId } from "../../game/heroes/heroTypes";

type DeckManagementSceneProps = {
  heroId: HeroId;
  onBack?: () => void;
};

export default function DeckManagementScene({ heroId, onBack }: DeckManagementSceneProps) {
  const decks = listDecksForHero(heroId);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #0c1525, #0f1f38)",
        color: "#e9f2ff",
        padding: "24px",
        display: "grid",
        gap: 12
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Manage Decks</h2>
        {onBack && (
          <button style={secondaryBtn} onClick={onBack}>
            Back
          </button>
        )}
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {decks.map(deck => (
          <button
            key={deck.id}
            onClick={() => {
              setSelectedDeck(deck.id);
              onBack?.();
            }}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
              color: "#e9f2ff",
              textAlign: "left",
              cursor: "pointer",
              boxShadow: "0 12px 24px rgba(0,0,0,0.35)"
            }}
          >
            <div style={{ fontWeight: 800 }}>{deck.name}</div>
            <div style={{ fontSize: 12, opacity: 0.74 }}>{deck.cards.length} cards</div>
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
  background: "rgba(255,255,255,0.06)",
  color: "#e7f1ff",
  cursor: "pointer",
  fontWeight: 700
};
