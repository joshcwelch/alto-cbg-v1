import { useEffect } from "react";
import { playFlowFactions } from "../data/playFlowData";
import { usePlayFlowStore } from "../state/usePlayFlowStore";
import { useUIStore } from "../state/useUIStore";
import ArtSlot from "../components/ArtSlot";

const WorldMapScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const selectedFactionId = usePlayFlowStore((state) => state.selectedFactionId);
  const selectedCityId = usePlayFlowStore((state) => state.selectedCityId);
  const setSelectedFactionId = usePlayFlowStore((state) => state.setSelectedFactionId);
  const setSelectedCityId = usePlayFlowStore((state) => state.setSelectedCityId);
  const clearSelectedHeroId = usePlayFlowStore((state) => state.clearSelectedHeroId);
  const clearSelectedDeckId = usePlayFlowStore((state) => state.clearSelectedDeckId);
  const setMatchmakingState = usePlayFlowStore((state) => state.setMatchmakingState);
  const clearEnemyHeroId = usePlayFlowStore((state) => state.clearEnemyHeroId);

  useEffect(() => {
    setMatchmakingState("idle");
    clearEnemyHeroId();
  }, [clearEnemyHeroId, setMatchmakingState]);

  const handleSelectCapital = (factionId: string, cityId: string) => {
    setSelectedFactionId(factionId);
    setSelectedCityId(cityId);
    clearSelectedHeroId();
    clearSelectedDeckId();
  };

  const selectedFaction = playFlowFactions.find((faction) => faction.id === selectedFactionId) ?? null;

  return (
    <div className="playflow-scene world-map-scene">
      <header className="playflow-header">
        <ArtSlot assetKey="playflowHeaderCrest" className="playflow-header__crest" alt="" />
        <div className="playflow-header__title">
          <h1>World Map</h1>
          <p>Select a capital to choose your faction.</p>
        </div>
        <ArtSlot
          assetKey="playflowHeaderCrest"
          className="playflow-header__crest playflow-header__crest--spacer"
          alt=""
        />
      </header>

      <div className="world-map-layout">
        <section className="world-map-panel">
          <ArtSlot assetKey="worldMapPanel" className="world-map-panel__art" alt="" />
          <div className="world-map-panel__content">
            <div className="world-map-panel__title">Map Placeholder</div>
            <div className="world-map-panel__subtext">
              Capital routes and landmarks will appear here.
            </div>
          </div>
        </section>
        <aside className="world-map-sidebar">
          <div className="world-map-sidebar__title">Capitals</div>
          <div className="world-map-cities" role="list">
            {playFlowFactions.map((faction) => {
              const isActive = faction.id === selectedFactionId || faction.capitalId === selectedCityId;
              return (
                <button
                  key={faction.capitalId}
                  type="button"
                  role="listitem"
                  className={`world-map-city ${isActive ? "world-map-city--active" : ""}`}
                  onClick={() => handleSelectCapital(faction.id, faction.capitalId)}
                >
                  <div className="world-map-city__name">{faction.capitalName}</div>
                  <div className="world-map-city__faction">{faction.name}</div>
                </button>
              );
            })}
          </div>
          <div className="world-map-selection">
            <div className="world-map-selection__label">Selected Faction</div>
            <div className="world-map-selection__value">{selectedFaction?.name ?? "None"}</div>
          </div>
        </aside>
      </div>

      <footer className="playflow-footer">
        <button type="button" className="ui-button ui-button--ghost" onClick={() => setScene("MAIN_MENU")}>
          Back
        </button>
        <button
          type="button"
          className="ui-button ui-button--primary"
          disabled={!selectedFactionId}
          onClick={() => setScene("HERO_SELECT")}
        >
          Continue
        </button>
      </footer>
    </div>
  );
};

export default WorldMapScene;
