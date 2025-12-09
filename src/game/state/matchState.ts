import type { BattlefieldUnit, PlayerId } from "../../core/cardTypes";
import { createInitialState, type GameState } from "../../core/gameState";
import { startTurn } from "../../core/turnSystem";
import { HeroId } from "../heroes/heroTypes";

export interface HeroPassiveState {
  voidCharges: number;
  fury: number;
  lastFriendlyDeaths: BattlefieldUnit[];
  nextEmpoweredSummon?: boolean;
}

export interface HeroRuntimeState {
  heroId: HeroId;
  passiveState: HeroPassiveState;
  cooldowns: Record<string, number>;
  oncePerTurn: Record<string, boolean>;
  ultimateReady: boolean;
}

export interface MatchState extends GameState {
  heroStates: Record<PlayerId, HeroRuntimeState>;
  openingHandDealt?: boolean;
  draggingCardId?: string | null;
  dragPreviewLane?: number | null;
  selectedAttackerId?: string | null;
}

export const createHeroRuntimeState = (heroId: HeroId): HeroRuntimeState => ({
  heroId,
  passiveState: {
    voidCharges: 0,
    fury: 0,
    lastFriendlyDeaths: [],
    nextEmpoweredSummon: false
  },
  cooldowns: {},
  oncePerTurn: {},
  ultimateReady: true
});

export const createInitialMatchState = (playerHero: HeroId, enemyHero: HeroId): MatchState => ({
  ...createInitialState(),
  playerHero,
  enemyHero,
  heroStates: {
    player: createHeroRuntimeState(playerHero),
    enemy: createHeroRuntimeState(enemyHero)
  }
});

// Utility to carry hero runtime data across turn changes.
export const startTurnWithHeroes = (state: MatchState, player: PlayerId): MatchState => {
  const next = startTurn(state, player) as MatchState;
  // preserve hero runtime data explicitly for clarity
  next.heroStates = state.heroStates;
  return next;
};
