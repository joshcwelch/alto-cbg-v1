import type { BattlefieldUnit, PlayerId } from "../../core/cardTypes";
import type { MatchState, HeroRuntimeState } from "../state/matchState";
import { HeroId } from "./heroTypes";
import type { EventBusType, EventPayloadMap } from "../events/eventBus";

type PassiveEvent =
  | { type: "UNIT_DIED"; payload: EventPayloadMap["UNIT_DIED"] }
  | { type: "HERO_TAKES_DAMAGE"; payload: EventPayloadMap["HERO_TAKES_DAMAGE"] };

const uid = () => Math.random().toString(36).slice(2, 10);

type EventBusLike = {
  emit: <T extends EventBusType>(type: T, payload: EventPayloadMap[T], matchState?: MatchState) => void;
} | null;

const findOpenLane = (owner: PlayerId, units: BattlefieldUnit[], maxBoardSlots: number): number | null => {
  return Array.from({ length: maxBoardSlots }, (_, lane) => lane).find(
    lane => units.every(u => !(u.owner === owner && u.lane === lane))
  ) ?? null;
};

const withHeroState = (matchState: MatchState, player: PlayerId, heroState: HeroRuntimeState): MatchState => ({
  ...matchState,
  heroStates: { ...matchState.heroStates, [player]: heroState }
});

const empoweredSummon = (unit: BattlefieldUnit, heroState: HeroRuntimeState): BattlefieldUnit => {
  if (!heroState.passiveState.nextEmpoweredSummon) return unit;
  return {
    ...unit,
    attackBuff: (unit.attackBuff ?? 0) + 3,
    rush: true
  };
};

const summonUnit = (
  player: PlayerId,
  matchState: MatchState,
  cardId: string,
  preferredLane?: number,
  bus: EventBusLike = null
): MatchState => {
  const heroState = matchState.heroStates[player];
  const lane = preferredLane ?? findOpenLane(player, matchState.battlefieldUnits, matchState.maxBoardSlots);
  if (lane == null) return matchState;

  let unit: BattlefieldUnit = empoweredSummon(
    {
      uid: uid(),
      cardId,
      owner: player,
      lane,
      damage: 0,
      exhausted: false,
      tags: []
    },
    heroState
  );
  unit = { ...unit, exhausted: unit.rush ? false : true };

  const updatedHeroState: HeroRuntimeState = {
    ...heroState,
    passiveState: { ...heroState.passiveState, nextEmpoweredSummon: false }
  };

  const nextState: MatchState = {
    ...matchState,
    heroStates: { ...matchState.heroStates, [player]: updatedHeroState },
    battlefieldUnits: [...matchState.battlefieldUnits, unit]
  };

  bus?.emit("SUMMON_UNIT", { playerId: player, unit }, nextState);
  return nextState;
};

const drawCard = (player: PlayerId, state: MatchState): MatchState => {
  const isPlayer = player === "player";
  const deckKey = isPlayer ? "deck" : "enemyDeck";
  const handKey = isPlayer ? "hand" : "enemyHand";
  const deck = state[deckKey];
  if (!deck.length) return state;
  const nextDeck = deck.slice(1);
  const card = deck[0];
  const nextHand = [...state[handKey], card];
  return { ...state, [deckKey]: nextDeck, [handKey]: nextHand } as MatchState;
};

export function executeHeroPassive(
  player: PlayerId,
  heroState: HeroRuntimeState,
  matchState: MatchState,
  event: PassiveEvent,
  bus: EventBusLike = null
): MatchState {
  if (heroState.heroId === HeroId.VOID_LYRA && event.type === "UNIT_DIED") {
    if (event.payload.playerId !== player) return matchState;
    const charges = heroState.passiveState.voidCharges + 1;
    const trackedDeaths = [...heroState.passiveState.lastFriendlyDeaths, event.payload.unit].slice(-6);
    let nextState = withHeroState(matchState, player, {
      ...heroState,
      passiveState: {
        ...heroState.passiveState,
        voidCharges: charges,
        lastFriendlyDeaths: trackedDeaths
      }
    });
    if (charges >= 6) {
      const remainder = charges - 6;
      const newHeroState: HeroRuntimeState = {
        ...heroState,
        passiveState: { ...heroState.passiveState, voidCharges: remainder, lastFriendlyDeaths: trackedDeaths }
      };
      nextState = summonUnit(
        player,
        { ...matchState, heroStates: { ...matchState.heroStates, [player]: newHeroState } },
        "VOID_HUSK",
        undefined,
        bus
      );
    }
    return nextState;
  }

  if (heroState.heroId === HeroId.EMBER_THAROS && event.type === "HERO_TAKES_DAMAGE") {
    if (event.payload.playerId !== player) return matchState;
    const current = heroState.passiveState.fury;
    const nextFury = Math.min(10, current + event.payload.amount);
    const reachedMax = nextFury >= 10;
    const updatedState = withHeroState(matchState, player, {
      ...heroState,
      passiveState: {
        ...heroState.passiveState,
        fury: nextFury,
        nextEmpoweredSummon: heroState.passiveState.nextEmpoweredSummon || reachedMax
      }
    });
    return updatedState;
  }

  return matchState;
}

export function executeHeroPower(
  player: PlayerId,
  heroId: HeroId,
  matchState: MatchState,
  bus: EventBusLike = null
): MatchState {
  const isPlayer = player === "player";
  const manaKey = isPlayer ? "playerMana" : "enemyMana";
  const usedKey = isPlayer ? "playerHeroPowerUsed" : "enemyHeroPowerUsed";

  let nextState = { ...matchState } as MatchState;
  if (nextState[usedKey]) return nextState;

  if (heroId === HeroId.VOID_LYRA) {
    const cost = 2;
    if (nextState[manaKey] < cost) return nextState;
    const friendlyUnits = nextState.battlefieldUnits.filter(u => u.owner === player);
    if (!friendlyUnits.length) return nextState;
    const target = friendlyUnits[0];
    nextState = {
      ...nextState,
      battlefieldUnits: nextState.battlefieldUnits.filter(u => u.uid !== target.uid),
      [manaKey]: nextState[manaKey] - cost,
      [usedKey]: true
    } as MatchState;
    nextState = summonUnit(player, nextState, "VOID_HUSK", undefined, bus);
    nextState = drawCard(player, nextState);
    bus?.emit("HERO_POWER_CAST", { playerId: player, heroId }, nextState);
    bus?.emit("UNIT_DIED", { playerId: player, unit: target }, nextState);
    return nextState;
  }

  if (heroId === HeroId.EMBER_THAROS) {
    const cost = 2;
    if (nextState[manaKey] < cost) return nextState;
    const enemyUnits = nextState.battlefieldUnits.filter(u => u.owner !== player);
    let damageApplied = false;
    let updatedUnits = [...nextState.battlefieldUnits];
    if (enemyUnits.length) {
      const target = enemyUnits[0];
      updatedUnits = updatedUnits.map(u => (u.uid === target.uid ? { ...u, damage: u.damage + 1, attackBuff: (u.attackBuff ?? 0) + 1 } : u));
      damageApplied = true;
    } else {
      const healthKey = player === "player" ? "enemyHealth" : "playerHealth";
      nextState = { ...nextState, [healthKey]: Math.max(0, nextState[healthKey] - 1) } as MatchState;
      damageApplied = true;
      bus?.emit("HERO_TAKES_DAMAGE", { playerId: healthKey === "enemyHealth" ? "enemy" : "player", amount: 1 }, nextState);
    }

    nextState = {
      ...nextState,
      battlefieldUnits: updatedUnits,
      [manaKey]: nextState[manaKey] - cost,
      [usedKey]: true
    } as MatchState;

    if (damageApplied) {
      bus?.emit("HERO_POWER_CAST", { playerId: player, heroId }, nextState);
    }
    return nextState;
  }

  return nextState;
}

export function executeHeroUltimate(
  player: PlayerId,
  heroId: HeroId,
  matchState: MatchState,
  bus: EventBusLike = null
): MatchState {
  const isPlayer = player === "player";
  const manaKey = isPlayer ? "playerMana" : "enemyMana";
  let nextState = { ...matchState } as MatchState;

  if (heroId === HeroId.VOID_LYRA) {
    const cost = 10;
    if (nextState[manaKey] < cost) return nextState;
    const heroState = nextState.heroStates[player];
    const deaths = heroState.passiveState.lastFriendlyDeaths.slice(-2).reverse();
    let workingState = { ...nextState, [manaKey]: nextState[manaKey] - cost } as MatchState;
    deaths.forEach(unit => {
      workingState = summonUnit(player, workingState, unit.cardId, undefined, bus);
      const idx = workingState.battlefieldUnits.findIndex(u => u.cardId === unit.cardId && u.owner === player && u.uid !== unit.uid);
      if (idx >= 0) {
        const revived = workingState.battlefieldUnits[idx];
        workingState.battlefieldUnits[idx] = {
          ...revived,
          attackBuff: (revived.attackBuff ?? 0) + 2,
          healthBuff: (revived.healthBuff ?? 0) + 2,
          tags: [...(revived.tags ?? []), "Corrupted"]
        };
      }
    });
    nextState = workingState;
    bus?.emit("HERO_ULTIMATE_CAST", { playerId: player, heroId }, nextState);
    return nextState;
  }

  if (heroId === HeroId.EMBER_THAROS) {
    const cost = 10;
    if (nextState[manaKey] < cost) return nextState;
    const units = nextState.battlefieldUnits.map(u => {
      if (u.owner !== player) return u;
      return {
        ...u,
        attackBuff: (u.attackBuff ?? 0) + 2,
        healthBuff: (u.healthBuff ?? 0) + 1,
        rush: true,
        exhausted: false
      };
    });
    const healthKey = player === "player" ? "playerHealth" : "enemyHealth";
    const newHealth = Math.max(0, nextState[healthKey] - 3);
    nextState = {
      ...nextState,
      [manaKey]: nextState[manaKey] - cost,
      battlefieldUnits: units,
      [healthKey]: newHealth
    } as MatchState;
    bus?.emit("HERO_TAKES_DAMAGE", { playerId: player, amount: 3 }, nextState);
    bus?.emit("HERO_ULTIMATE_CAST", { playerId: player, heroId }, nextState);
    return nextState;
  }

  return nextState;
}
