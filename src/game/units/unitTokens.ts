import { CARDS } from "../../core/cardsDb";
import type { BattlefieldUnit, PlayerId } from "../../core/cardTypes";
import { HERO_REGISTRY } from "../heroes/heroRegistry";
import type { MatchState, BoardRuntime } from "../state/matchState";
import type { UnitTokenRuntime } from "./unitTypes";

const FALLBACK_PORTRAIT = "/assets/ui/portrait-missing.png";

export const createEmptyBoardRuntime = (): BoardRuntime => ({
  unitsByPlayer: {
    player: [],
    enemy: []
  }
});

const factionForPlayer = (playerId: PlayerId, state: MatchState): string | undefined => {
  const heroId = state.heroStates[playerId]?.heroId;
  const faction = heroId ? HERO_REGISTRY[heroId]?.faction : undefined;
  return faction ? faction.toUpperCase().replace(/\s+/g, "_") : undefined;
};

const buildToken = (unit: BattlefieldUnit, state: MatchState): UnitTokenRuntime => {
  const card = CARDS[unit.cardId];
  const attack = (card?.attack ?? 0) + (unit.attackBuff ?? 0);
  const maxHealth = (card?.health ?? 0) + (unit.healthBuff ?? 0);
  const health = Math.max(0, maxHealth - unit.damage);
  return {
    id: unit.uid,
    ownerId: unit.owner,
    cardId: unit.cardId,
    portraitUrl: card?.artSrc ?? FALLBACK_PORTRAIT,
    attack,
    health,
    maxHealth,
    sleeping: unit.exhausted,
    shielded: false,
    silenced: false,
    rarity: undefined,
    faction: factionForPlayer(unit.owner, state),
    status: unit.tags?.includes("stealth") ? ["stealth"] : undefined,
    laneIndex: unit.lane,
    slotIndex: 0
  };
};

export const buildBoardRuntime = (state: MatchState): BoardRuntime => {
  const board = createEmptyBoardRuntime();
  state.battlefieldUnits.forEach(unit => {
    const token = buildToken(unit, state);
    board.unitsByPlayer[unit.owner].push(token);
  });
  return board;
};

export const syncBoardRuntime = (state: MatchState): MatchState => ({
  ...state,
  board: buildBoardRuntime(state)
});
