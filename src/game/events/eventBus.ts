import type { BattlefieldUnit, PlayerId } from "../../core/cardTypes";
import type { MatchState } from "../state/matchState";
import { executeHeroPassive } from "../heroes/heroAbilities";
import type { HeroId } from "../heroes/heroTypes";

export type EventBusType =
  | "UNIT_DIED"
  | "HERO_TAKES_DAMAGE"
  | "HERO_POWER_CAST"
  | "HERO_ULTIMATE_CAST"
  | "SUMMON_UNIT";

export type EventPayloadMap = {
  UNIT_DIED: { playerId: PlayerId; unit: BattlefieldUnit };
  HERO_TAKES_DAMAGE: { playerId: PlayerId; amount: number };
  HERO_POWER_CAST: { playerId: PlayerId; heroId: HeroId };
  HERO_ULTIMATE_CAST: { playerId: PlayerId; heroId: HeroId };
  SUMMON_UNIT: { playerId: PlayerId; unit: BattlefieldUnit };
};

type Handler<T extends EventBusType> = (payload: EventPayloadMap[T], matchState?: MatchState) => void;

class EventBus {
  private listeners: { [K in EventBusType]: Handler<K>[] } = {
    UNIT_DIED: [],
    HERO_TAKES_DAMAGE: [],
    HERO_POWER_CAST: [],
    HERO_ULTIMATE_CAST: [],
    SUMMON_UNIT: []
  };

  on<T extends EventBusType>(type: T, handler: Handler<T>) {
    // duplicate-avoidance
    if (!this.listeners[type].includes(handler as Handler<EventBusType>)) {
      this.listeners[type].push(handler as Handler<EventBusType>);
    }
  }

  emit<T extends EventBusType>(type: T, payload: EventPayloadMap[T], matchState?: MatchState) {
    this.listeners[type].forEach(handler => handler(payload as any, matchState));

    if (!matchState) return;

    if (type === "UNIT_DIED") {
      const { playerId, unit } = payload as EventPayloadMap["UNIT_DIED"];
      const heroState = matchState.heroStates[playerId];
      if (heroState) {
        executeHeroPassive(playerId, heroState, matchState, { type: "UNIT_DIED", payload: { playerId, unit } }, this);
      }
    }

    if (type === "HERO_TAKES_DAMAGE") {
      const payloadTyped = payload as EventPayloadMap["HERO_TAKES_DAMAGE"];
      const { playerId } = payloadTyped;
      const heroState = matchState.heroStates[playerId];
      if (heroState) {
        executeHeroPassive(playerId, heroState, matchState, { type: "HERO_TAKES_DAMAGE", payload: payloadTyped }, this);
      }
    }
  }
}

export const eventBus = new EventBus();
