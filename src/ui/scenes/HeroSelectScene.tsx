import { playFlowFactions, playFlowHeroes } from "../data/playFlowData";
import { usePlayFlowStore } from "../state/usePlayFlowStore";
import { useUIStore } from "../state/useUIStore";

const HeroSelectScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const selectedFactionId = usePlayFlowStore((state) => state.selectedFactionId);
  const selectedHeroId = usePlayFlowStore((state) => state.selectedHeroId);
  const setSelectedHeroId = usePlayFlowStore((state) => state.setSelectedHeroId);
  const clearSelectedDeckId = usePlayFlowStore((state) => state.clearSelectedDeckId);

  const selectedFaction = playFlowFactions.find((faction) => faction.id === selectedFactionId) ?? null;
  const heroes = playFlowHeroes.filter((hero) => hero.factionId === selectedFactionId);

  const handleSelectHero = (heroId: string) => {
    setSelectedHeroId(heroId);
    clearSelectedDeckId();
  };

  return (
    <div className="playflow-scene hero-select-scene">
      <header className="playflow-header">
        <div className="playflow-header__crest" aria-hidden="true" />
        <div className="playflow-header__title">
          <h1>Choose Hero</h1>
          <p>{selectedFaction ? `${selectedFaction.name} champions are ready.` : "Select a faction to continue."}</p>
        </div>
        <div className="playflow-header__crest playflow-header__crest--spacer" aria-hidden="true" />
      </header>

      <div className="hero-select-grid" role="list">
        {heroes.map((hero) => {
          const isActive = hero.id === selectedHeroId;
          return (
            <button
              key={hero.id}
              type="button"
              role="listitem"
              className={`hero-select-card ${isActive ? "hero-select-card--active" : ""}`}
              onClick={() => handleSelectHero(hero.id)}
            >
              <div className="hero-select-card__portrait">
                {hero.portraitSrc ? (
                  <img src={hero.portraitSrc} alt={hero.name} draggable={false} />
                ) : (
                  <div className="hero-select-card__placeholder" aria-hidden="true" />
                )}
              </div>
              <div className="hero-select-card__content">
                <div className="hero-select-card__name">{hero.name}</div>
                <div className="hero-select-card__epithet">{hero.epithet}</div>
                <div className="hero-select-card__power">{hero.powerName}</div>
              </div>
            </button>
          );
        })}
        {heroes.length === 0 ? (
          <div className="hero-select-empty">
            Choose a capital on the World Map to see available heroes.
          </div>
        ) : null}
      </div>

      <footer className="playflow-footer">
        <button type="button" className="ui-button ui-button--ghost" onClick={() => setScene("WORLD_MAP")}>
          Back
        </button>
        <button
          type="button"
          className="ui-button ui-button--primary"
          disabled={!selectedHeroId}
          onClick={() => setScene("DECK_SELECT")}
        >
          Continue
        </button>
      </footer>
    </div>
  );
};

export default HeroSelectScene;
