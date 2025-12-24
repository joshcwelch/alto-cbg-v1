import { getCard } from "../cards/CardRegistry";
import { getCardTargetType, getHeroPowerTargetTypeFor } from "../engine/engine";
import type { GameState, Intent, PlayerId, TargetSpec } from "../engine/types";

const getTargetableMinions = (minions: { id: string; health: number; maxHealth: number; taunt: boolean; stealth: boolean; cloaked: boolean }[]) =>
  minions.filter((minion) => !minion.stealth && !minion.cloaked && minion.health > 0);

const pickLowestHealth = <T extends { health: number; id: string }>(minions: T[]) =>
  minions.slice().sort((a, b) => a.health - b.health || a.id.localeCompare(b.id))[0] ?? null;

export const chooseAiIntent = (state: GameState): Intent | null => {
  if (state.winner || state.turn !== "enemy") return null;
  const ai = state.players.enemy;
  const opponent = state.players.player;

  const heroPowerTargetType = getHeroPowerTargetTypeFor("enemy");
  const canUseHeroPower = !ai.hero.heroPowerUsed && ai.mana >= 2;
  const targetableEnemyMinions = getTargetableMinions(opponent.board);

  if (canUseHeroPower && heroPowerTargetType === "ENEMY_ANY") {
    const killTarget = targetableEnemyMinions.find((minion) => minion.health <= 1);
    if (killTarget) {
      return {
        type: "USE_HERO_POWER",
        player: "enemy",
        target: { type: "MINION", id: killTarget.id, owner: "player" },
      };
    }
  }

  const playableCards = ai.hand
    .map((card) => ({ card, def: getCard(card.cardId) }))
    .filter((entry) => entry.def && entry.def.cost <= ai.mana);

  if (playableCards.length > 0) {
    playableCards.sort((a, b) => {
      if (b.def!.cost !== a.def!.cost) return b.def!.cost - a.def!.cost;
      if (b.def!.type !== a.def!.type) return b.def!.type === "MINION" ? 1 : -1;
      return a.card.cardId.localeCompare(b.card.cardId);
    });
    const choice = playableCards[0];
    const targetType = getCardTargetType(choice.card.cardId);

    const chooseTarget = (): TargetSpec | undefined => {
      if (targetType === "NONE") return undefined;
      if (targetType === "FRIENDLY_MINION") {
        const target = pickLowestHealth(getTargetableMinions(ai.board));
        return target ? { type: "MINION", id: target.id, owner: "enemy" } : undefined;
      }
      if (targetType === "ENEMY_MINION") {
        const target = pickLowestHealth(targetableEnemyMinions);
        return target ? { type: "MINION", id: target.id, owner: "player" } : undefined;
      }
      if (targetType === "ANY_MINION") {
        const friendly = pickLowestHealth(getTargetableMinions(ai.board));
        const enemy = pickLowestHealth(targetableEnemyMinions);
        if (!friendly) return enemy ? { type: "MINION", id: enemy.id, owner: "player" } : undefined;
        if (!enemy) return { type: "MINION", id: friendly.id, owner: "enemy" };
        return enemy.health <= friendly.health
          ? { type: "MINION", id: enemy.id, owner: "player" }
          : { type: "MINION", id: friendly.id, owner: "enemy" };
      }
      if (targetType === "ENEMY_ANY") {
        const target = pickLowestHealth(targetableEnemyMinions);
        return target
          ? { type: "MINION", id: target.id, owner: "player" }
          : { type: "HERO", player: "player" };
      }
      return undefined;
    };

    const target = chooseTarget();
    if (targetType === "NONE" || target) {
      return {
        type: "PLAY_CARD",
        player: "enemy",
        handId: choice.card.id,
        target,
      };
    }
  }

  if (canUseHeroPower && heroPowerTargetType === "ENEMY_ANY") {
    const target: TargetSpec = targetableEnemyMinions.length
      ? { type: "MINION", id: targetableEnemyMinions[0].id, owner: "player" }
      : { type: "HERO", player: "player" };
    return { type: "USE_HERO_POWER", player: "enemy", target };
  }

  const attackers = ai.board.filter((minion) => minion.canAttack && !minion.summoningSick);
  if (attackers.length > 0) {
    const attacker = attackers.sort((a, b) => a.id.localeCompare(b.id))[0];
    const taunts = targetableEnemyMinions.filter((minion) => minion.taunt);
    const targetPool = taunts.length > 0 ? taunts : targetableEnemyMinions;
    const target: TargetSpec =
      targetPool.length > 0
        ? { type: "MINION", id: pickLowestHealth(targetPool)!.id, owner: "player" }
        : { type: "HERO", player: "player" };
    return { type: "DECLARE_ATTACK", player: "enemy", attackerId: attacker.id, target };
  }

  return { type: "END_TURN", player: "enemy" };
};
