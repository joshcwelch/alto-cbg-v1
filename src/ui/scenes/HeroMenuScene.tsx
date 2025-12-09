import { HERO_REGISTRY } from "../../game/heroes/heroRegistry";
import { HeroId } from "../../game/heroes/heroTypes";
import { getSelectedDeck } from "../../game/profile/playerProfile";

type HeroMenuSceneProps = {
  heroId: HeroId;
  onManageDecks: (heroId: HeroId) => void;
  onViewCollection: () => void;
  onViewDecks: (heroId: HeroId) => void;
  onFindMatch: () => void;
  onBack?: () => void;
};

export default function HeroMenuScene({
  heroId,
  onManageDecks,
  onViewCollection,
  onViewDecks,
  onFindMatch,
  onBack
}: HeroMenuSceneProps) {
  const hero = HERO_REGISTRY[heroId];
  const selectedDeck = getSelectedDeck();
  const deckReady = Boolean(selectedDeck && selectedDeck.heroId === heroId);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #090f1a, #0c162b)",
        color: "#e9f2ff",
        padding: "32px",
        display: "grid",
        gap: 18
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Hero</div>
          <h2 style={{ margin: 0 }}>{hero.name}</h2>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{hero.faction}</div>
        </div>
        {onBack && (
          <button style={secondaryBtn} onClick={onBack}>
            Back
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18, alignItems: "stretch" }}>
        <div
          style={{
            borderRadius: 18,
            padding: 12,
            background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
            boxShadow: "0 16px 32px rgba(0,0,0,0.35)"
          }}
        >
          <div
            style={{
              borderRadius: 16,
              height: 220,
              backgroundImage: `url(${hero.portraitPath})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              marginBottom: 12,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)"
            }}
          />
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{hero.passive.name}</div>
          <div style={{ fontSize: 12, opacity: 0.78 }}>{hero.passive.description}</div>
        </div>

        <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
          <button style={primaryBtn} onClick={() => onManageDecks(heroId)}>
            Manage Decks
          </button>
          <button style={secondaryBtn} onClick={onViewCollection}>
            View Collection
          </button>
          <button style={secondaryBtn} onClick={() => onViewDecks(heroId)}>
            View Decks
          </button>
          <button
            style={{
              ...primaryBtn,
              background: deckReady ? primaryBtn.background : "linear-gradient(145deg, #3a4a64, #2b3344)",
              cursor: deckReady ? "pointer" : "not-allowed",
              opacity: deckReady ? 1 : 0.6
            }}
            disabled={!deckReady}
            onClick={deckReady ? onFindMatch : undefined}
          >
            Find Match {deckReady ? "" : "(select a deck)"}
          </button>
          <div style={{ fontSize: 12, opacity: 0.72 }}>
            Selected deck: {deckReady ? selectedDeck?.name : "None"}
          </div>
        </div>
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "linear-gradient(145deg, #62e4ff, #3ca3ff)",
  color: "#061223",
  fontWeight: 900,
  letterSpacing: 0.6,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(0,0,0,0.4)"
};

const secondaryBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#e7f1ff",
  cursor: "pointer",
  fontWeight: 700
};
