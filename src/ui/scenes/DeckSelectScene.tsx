import { playFlowDecks, playFlowHeroes } from "../data/playFlowData";
import { usePlayFlowStore } from "../state/usePlayFlowStore";
import { useUIStore } from "../state/useUIStore";

const DeckSelectScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const selectedHeroId = usePlayFlowStore((state) => state.selectedHeroId);
  const selectedDeckId = usePlayFlowStore((state) => state.selectedDeckId);
  const setSelectedDeckId = usePlayFlowStore((state) => state.setSelectedDeckId);
  const setMatchmakingState = usePlayFlowStore((state) => state.setMatchmakingState);
  const clearEnemyHeroId = usePlayFlowStore((state) => state.clearEnemyHeroId);

  const selectedHero = playFlowHeroes.find((hero) => hero.id === selectedHeroId) ?? null;
  const heroDecks = playFlowDecks.filter((deck) => deck.heroId === selectedHeroId);

  const handleConfirm = () => {
    setMatchmakingState("idle");
    clearEnemyHeroId();
    setScene("MATCHMAKING");
  };

  return (
    <div className="playflow-scene deck-select-scene">
      <header className="playflow-header">
        <div className="playflow-header__crest" aria-hidden="true" />
        <div className="playflow-header__title">
          <h1>Select Deck</h1>
          <p>{selectedHero ? `${selectedHero.name} decks available.` : "Select a hero to continue."}</p>
        </div>
        <div className="playflow-header__crest playflow-header__crest--spacer" aria-hidden="true" />
      </header>

      <div className="deck-select-list" role="list">
        {heroDecks.map((deck) => {
          const isActive = deck.id === selectedDeckId;
          return (
            <button
              key={deck.id}
              type="button"
              role="listitem"
              className={`deck-select-row ${isActive ? "deck-select-row--active" : ""}`}
              onClick={() => setSelectedDeckId(deck.id)}
            >
              <div className="deck-select-row__name">{deck.name}</div>
              <div className="deck-select-row__meta">
                <span>{selectedHero?.name ?? "Hero"}</span>
                <span>Cards: {deck.cardCount}</span>
              </div>
            </button>
          );
        })}
        {heroDecks.length === 0 ? (
          <div className="deck-select-empty">
            Choose a hero to reveal their available decks.
          </div>
        ) : null}
      </div>

      <footer className="playflow-footer">
        <button type="button" className="ui-button ui-button--ghost" onClick={() => setScene("HERO_SELECT")}>
          Back
        </button>
        <button
          type="button"
          className="ui-button ui-button--primary"
          disabled={!selectedDeckId}
          onClick={handleConfirm}
        >
          Confirm
        </button>
      </footer>
    </div>
  );
};

export default DeckSelectScene;
