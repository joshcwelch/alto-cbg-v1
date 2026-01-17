import { useEffect, useMemo, useRef } from "react";
import { playFlowHeroes } from "../data/playFlowData";
import { usePlayFlowStore } from "../state/usePlayFlowStore";
import { useUIStore } from "../state/useUIStore";
import ArtSlot from "../components/ArtSlot";

const getRandomOpponentId = (excludeId: string | null) => {
  const candidates = playFlowHeroes.filter((hero) => hero.id !== excludeId);
  if (candidates.length === 0) {
    return excludeId;
  }
  const pick = Math.floor(Math.random() * candidates.length);
  return candidates[pick].id;
};

const MatchmakingScene = () => {
  const setScene = useUIStore((state) => state.setScene);
  const selectedHeroId = usePlayFlowStore((state) => state.selectedHeroId);
  const matchmakingState = usePlayFlowStore((state) => state.matchmakingState);
  const enemyHeroId = usePlayFlowStore((state) => state.enemyHeroId);
  const setMatchmakingState = usePlayFlowStore((state) => state.setMatchmakingState);
  const setEnemyHeroId = usePlayFlowStore((state) => state.setEnemyHeroId);
  const clearEnemyHeroId = usePlayFlowStore((state) => state.clearEnemyHeroId);

  const findTimeoutRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);

  const playerHero = useMemo(
    () => playFlowHeroes.find((hero) => hero.id === selectedHeroId) ?? null,
    [selectedHeroId],
  );
  const enemyHero = useMemo(
    () => playFlowHeroes.find((hero) => hero.id === enemyHeroId) ?? null,
    [enemyHeroId],
  );
  const enemyPortraitKey = matchmakingState === "found" ? "opponentHeroPortrait" : "heroPortraitPlaceholder";

  const clearTimers = () => {
    if (findTimeoutRef.current) {
      window.clearTimeout(findTimeoutRef.current);
      findTimeoutRef.current = null;
    }
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    setMatchmakingState("searching");
    setEnemyHeroId(null);
    clearTimers();

    const delay = 2000 + Math.random() * 2000;
    findTimeoutRef.current = window.setTimeout(() => {
      const opponentId = getRandomOpponentId(selectedHeroId);
      setEnemyHeroId(opponentId);
      setMatchmakingState("found");
    }, delay);

    return () => clearTimers();
  }, [selectedHeroId, setEnemyHeroId, setMatchmakingState]);

  useEffect(() => {
    if (matchmakingState !== "found") {
      return;
    }
    transitionTimeoutRef.current = window.setTimeout(() => {
      setScene("BOARD");
    }, 900);
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [matchmakingState, setScene]);

  const handleCancel = () => {
    clearTimers();
    setMatchmakingState("idle");
    clearEnemyHeroId();
    setScene("DECK_SELECT");
  };

  return (
    <div className="playflow-scene matchmaking-scene">
      <header className="playflow-header">
        <ArtSlot assetKey="playflowHeaderCrest" className="playflow-header__crest" alt="" />
        <div className="playflow-header__title">
          <h1>{matchmakingState === "found" ? "Match Found" : "Searching for Opponent..."}</h1>
          <p>{matchmakingState === "found" ? "Match is starting now." : "Hold tight while we find a rival."}</p>
        </div>
        <ArtSlot
          assetKey="playflowHeaderCrest"
          className="playflow-header__crest playflow-header__crest--spacer"
          alt=""
        />
      </header>

      <div className="matchmaking-stage">
        <div className="matchmaking-panel">
          <div className="matchmaking-panel__title">Joshua</div>
          <div className="matchmaking-panel__hero">
            <div className="matchmaking-panel__portrait">
              <ArtSlot assetKey="selectedHeroPortrait" className="matchmaking-panel__portrait-art" alt="" />
            </div>
            <div className="matchmaking-panel__meta">
              <div className="matchmaking-panel__name">{playerHero?.name ?? "Hero"}</div>
              <div className="matchmaking-panel__subtitle">{playerHero?.epithet ?? "Chosen Champion"}</div>
              <div className="matchmaking-panel__power">{playerHero?.powerName ?? "Hero Power"}</div>
            </div>
          </div>
        </div>

        <div className="matchmaking-vs" aria-hidden="true">
          VS
        </div>

        <div className={`matchmaking-panel ${matchmakingState !== "found" ? "matchmaking-panel--ghost" : ""}`}>
          <div className="matchmaking-panel__title">{matchmakingState === "found" ? "Opponent" : "Unknown"}</div>
          <div className="matchmaking-panel__hero">
            <div
              className={`matchmaking-panel__portrait ${matchmakingState !== "found" ? "matchmaking-panel__portrait--ghost" : ""}`}
            >
              <ArtSlot assetKey={enemyPortraitKey} className="matchmaking-panel__portrait-art" alt="" />
            </div>
            <div className="matchmaking-panel__meta">
              <div className="matchmaking-panel__name">
                {matchmakingState === "found" ? enemyHero?.name ?? "Rival" : "Searching..."}
              </div>
              <div className="matchmaking-panel__subtitle">
                {matchmakingState === "found" ? enemyHero?.epithet ?? "Opponent" : "Opponent data pending"}
              </div>
              <div className="matchmaking-panel__power">
                {matchmakingState === "found" ? enemyHero?.powerName ?? "Hero Power" : "????"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="playflow-footer playflow-footer--centered">
        <button type="button" className="ui-button ui-button--ghost" onClick={handleCancel}>
          Cancel
        </button>
      </footer>
    </div>
  );
};

export default MatchmakingScene;
