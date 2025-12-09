import type { PlayerId } from "../../core/cardTypes";
import { HERO_REGISTRY } from "../heroes/heroRegistry";
import { HeroId } from "../heroes/heroTypes";
import { executeHeroPower, executeHeroUltimate } from "../heroes/heroAbilities";
import type { MatchState } from "./matchState";
import { eventBus } from "../events/eventBus";
import { useGameStore } from "../../state/useGameStore";

const getHeroIdForPlayer = (state: MatchState, playerId: PlayerId): HeroId => {
  return state.heroStates[playerId]?.heroId ?? HeroId.EMBER_THAROS;
};

const manaKeyFor = (playerId: PlayerId) => (playerId === "player" ? "playerMana" : "enemyMana");
const powerUsedKeyFor = (playerId: PlayerId) => (playerId === "player" ? "playerHeroPowerUsed" : "enemyHeroPowerUsed");

export const canUseHeroPower = (playerId: PlayerId): boolean => {
  const state = useGameStore.getState() as MatchState;
  if (state.winner || state.turn !== playerId) return false;
  const heroId = getHeroIdForPlayer(state, playerId);
  const hero = HERO_REGISTRY[heroId];
  if (!hero) return false;
  const manaKey = manaKeyFor(playerId);
  const usedKey = powerUsedKeyFor(playerId);
  return !state[usedKey] && state[manaKey] >= hero.heroPower.cost;
};

export const useHeroPower = (playerId: PlayerId): boolean => {
  const state = useGameStore.getState() as MatchState;
  const heroId = getHeroIdForPlayer(state, playerId);
  const hero = HERO_REGISTRY[heroId];
  if (!hero) return false;
  if (!canUseHeroPower(playerId)) return false;
  const updated = executeHeroPower(playerId, heroId, state, eventBus);
  useGameStore.setState(updated);
  return true;
};

export const canUseUltimate = (playerId: PlayerId): boolean => {
  const state = useGameStore.getState() as MatchState;
  if (state.winner || state.turn !== playerId) return false;
  const heroId = getHeroIdForPlayer(state, playerId);
  const hero = HERO_REGISTRY[heroId];
  if (!hero) return false;
  const manaKey = manaKeyFor(playerId);
  const runtime = state.heroStates[playerId];
  const readyFlag = runtime?.ultimateReady ?? false;
  return state[manaKey] >= hero.ultimate.cost && readyFlag;
};

export const useUltimate = (playerId: PlayerId): boolean => {
  const state = useGameStore.getState() as MatchState;
  const heroId = getHeroIdForPlayer(state, playerId);
  if (!canUseUltimate(playerId)) return false;
  const updated = executeHeroUltimate(playerId, heroId, state, eventBus);
  const heroState = updated.heroStates[playerId];
  updated.heroStates[playerId] = { ...heroState, ultimateReady: false };
  useGameStore.setState(updated);
  return true;
};

export const resetTurnHeroFlags = (playerId: PlayerId) => {
  const state = useGameStore.getState() as MatchState;
  const usedKey = powerUsedKeyFor(playerId);
  const heroState = state.heroStates[playerId];
  const refreshed: MatchState = {
    ...state,
    [usedKey]: false,
    heroStates: {
      ...state.heroStates,
      [playerId]: {
        ...heroState,
        oncePerTurn: {}
      }
    }
  };
  useGameStore.setState(refreshed);
};
