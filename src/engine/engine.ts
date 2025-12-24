import { CardRegistry, getHeroPowerFor } from "../cards/CardRegistry";
import {
  DEFAULT_SEED,
  ENEMY_ID,
  HERO_HEALTH,
  MAX_BOARD_SIZE,
  MAX_HAND_SIZE,
  MAX_MANA,
  PLAYER_ID,
  STARTING_HAND_SIZE,
} from "./constants";
import { shuffleWithRng } from "./rng";
import type {
  CardInstance,
  GameEvent,
  GameState,
  Intent,
  MinionInstance,
  PlayerId,
  PlayerState,
  SlamProfile,
  TargetSpec,
} from "./types";

const PLAYER_DECK: string[] = [
  "VOID_VOID_INITIATE",
  "VOID_VOID_INITIATE",
  "VOID_UMBRAL_THRALL",
  "VOID_UMBRAL_THRALL",
  "VOID_VOIDBOUND_ACOLYTE",
  "VOID_VOIDBOUND_ACOLYTE",
  "VOID_ABYSSAL_WATCHER",
  "VOID_ABYSSAL_WATCHER",
  "VOID_GRAVETIDE_COLLECTOR",
  "VOID_GRAVETIDE_COLLECTOR",
  "VOID_HOLLOW_SENTINEL",
  "VOID_HOLLOW_SENTINEL",
  "VOID_VOID_LEECH",
  "VOID_VOID_LEECH",
  "VOID_DUSK_HERALD",
  "VOID_DUSK_HERALD",
  "VOID_OBSIDIAN_WARDEN",
  "VOID_OBSIDIAN_WARDEN",
  "VOID_VOID_TITHE",
  "VOID_VOID_TITHE",
  "VOID_GRASP_OF_NOTHING",
  "VOID_GRASP_OF_NOTHING",
  "VOID_SHADOW_RECLAIM",
  "VOID_SHADOW_RECLAIM",
  "VOID_GRAVE_OFFERING",
  "VOID_GRAVE_OFFERING",
  "VOID_SILENCE_THE_LIGHT",
  "VOID_SILENCE_THE_LIGHT",
  "VOID_ENCROACHING_VOID",
  "VOID_ENCROACHING_VOID",
];

const ENEMY_DECK: string[] = [
  "EMBER_EMBERFOOT_SOLDIER",
  "EMBER_EMBERFOOT_SOLDIER",
  "EMBER_ASHBOUND_INITIATE",
  "EMBER_ASHBOUND_INITIATE",
  "EMBER_CINDERBLADE_RAIDER",
  "EMBER_CINDERBLADE_RAIDER",
  "EMBER_FLAMEFORGED_BRUTE",
  "EMBER_FLAMEFORGED_BRUTE",
  "EMBER_ASHSPIRE_VANGUARD",
  "EMBER_ASHSPIRE_VANGUARD",
  "EMBER_EMBER_HOUND",
  "EMBER_EMBER_HOUND",
  "EMBER_MOLTEN_CHAMPION",
  "EMBER_MOLTEN_CHAMPION",
  "EMBER_PYREBOUND_KNIGHT",
  "EMBER_PYREBOUND_KNIGHT",
  "EMBER_INFERNAL_COLOSSUS",
  "EMBER_INFERNAL_COLOSSUS",
  "EMBER_SCORCHING_COMMAND",
  "EMBER_SCORCHING_COMMAND",
  "EMBER_ASHFALL_STRIKE",
  "EMBER_ASHFALL_STRIKE",
  "EMBER_FLAME_SURGE",
  "EMBER_FLAME_SURGE",
  "EMBER_BATTLE_CRY_OF_EMBERS",
  "EMBER_BATTLE_CRY_OF_EMBERS",
  "EMBER_MOLTEN_VERDICT",
  "EMBER_MOLTEN_VERDICT",
  "EMBER_BURN_THE_WEAK",
  "EMBER_BURN_THE_WEAK",
];

const clonePlayer = (player: PlayerState): PlayerState => ({
  ...player,
  hero: { ...player.hero },
  deck: [...player.deck],
  hand: player.hand.map((card) => ({ ...card })),
  board: player.board.map((minion) => ({ ...minion })),
});

const cloneState = (state: GameState): GameState => ({
  ...state,
  players: {
    player: clonePlayer(state.players.player),
    enemy: clonePlayer(state.players.enemy),
  },
  log: [...state.log],
});

const getOpponent = (player: PlayerId): PlayerId => (player === PLAYER_ID ? ENEMY_ID : PLAYER_ID);

const addEvent = (
  draft: { events: GameEvent[]; nextEventId: number },
  event: Omit<GameEvent, "id">
) => {
  draft.nextEventId += 1;
  draft.events.push({ id: draft.nextEventId, ...event });
};

const nextId = (draft: { nextId: number }) => {
  draft.nextId += 1;
  return `id-${draft.nextId}`;
};

const getCardDef = (cardId: string) => CardRegistry[cardId];

const hasKeyword = (cardId: string, keyword: string) => {
  const card = getCardDef(cardId);
  if (!card) return false;
  const tags = card.tags ?? [];
  return card.text.includes(keyword) || tags.includes(keyword);
};

const createMinion = (cardId: string, owner: PlayerId, id: string): MinionInstance => {
  const card = getCardDef(cardId);
  if (!card) {
    throw new Error(`Missing card definition for ${cardId}`);
  }
  return {
    id,
    cardId,
    owner,
    attack: card.attack ?? 0,
    health: card.health ?? 0,
    maxHealth: card.health ?? 0,
    canAttack: false,
    summoningSick: true,
    taunt: hasKeyword(cardId, "Taunt"),
    lifesteal: hasKeyword(cardId, "Lifesteal"),
    stealth: hasKeyword(cardId, "Stealth"),
    shield: hasKeyword(cardId, "Shield"),
    resilient: hasKeyword(cardId, "Resilient"),
    cloaked: hasKeyword(cardId, "Cloak"),
    berserkerBuffedThisTurn: false,
    deathrattle: cardId === "VOID_VOIDBOUND_ACOLYTE" ? "DRAW_CARD" : null,
    onAttackDrainHero: cardId === "VOID_ABYSSBOUND_SPECTER",
  };
};

const applyDamageToMinion = (
  minion: MinionInstance,
  amount: number,
  activeTurn: PlayerId
): { next: MinionInstance; actualDamage: number } => {
  if (amount <= 0) {
    return { next: minion, actualDamage: 0 };
  }
  if (minion.shield) {
    return { next: { ...minion, shield: false }, actualDamage: 0 };
  }
  let nextHealth = minion.health - amount;
  if (minion.resilient && activeTurn === minion.owner) {
    nextHealth = Math.max(1, nextHealth);
  }
  const actualDamage = Math.max(0, minion.health - nextHealth);
  return { next: { ...minion, health: nextHealth }, actualDamage };
};

const applyHeroDamage = (
  player: PlayerState,
  amount: number
): { nextPlayer: PlayerState; actualDamage: number } => {
  const actual = Math.max(0, amount);
  if (actual <= 0) {
    return { nextPlayer: player, actualDamage: 0 };
  }
  const updatedBoard = player.board.map((minion) => {
    if (
      minion.cardId === "EMBER_EMBERFORGED_BERSERKER" &&
      !minion.berserkerBuffedThisTurn
    ) {
      return {
        ...minion,
        attack: minion.attack + 1,
        berserkerBuffedThisTurn: true,
      };
    }
    return minion;
  });
  return {
    nextPlayer: {
      ...player,
      hero: { ...player.hero, health: Math.max(0, player.hero.health - actual) },
      board: updatedBoard,
    },
    actualDamage: actual,
  };
};

const applyHeroHeal = (player: PlayerState, amount: number): PlayerState => {
  if (amount <= 0) return player;
  return {
    ...player,
    hero: { ...player.hero, health: Math.min(player.hero.maxHealth, player.hero.health + amount) },
  };
};

const drawCards = (
  draft: {
    state: GameState;
    events: GameEvent[];
    nextEventId: number;
  },
  playerId: PlayerId,
  count: number
) => {
  const player = draft.state.players[playerId];
  for (let i = 0; i < count; i += 1) {
    if (player.deckIndex >= player.deck.length) {
      player.hero.fatigue += 1;
      const fatigueAmount = player.hero.fatigue;
      addEvent(draft, { type: "FATIGUE", payload: { player: playerId, amount: fatigueAmount } });
      const damaged = applyHeroDamage(player, fatigueAmount);
      draft.state.players[playerId] = damaged.nextPlayer;
      addEvent(draft, {
        type: "DAMAGE_DEALT",
        payload: {
          source: { type: "FATIGUE" },
          target: { type: "HERO", player: playerId },
          amount: damaged.actualDamage,
        },
      });
      continue;
    }
    const cardId = player.deck[player.deckIndex];
    player.deckIndex += 1;
    if (player.hand.length >= MAX_HAND_SIZE) {
      addEvent(draft, { type: "CARD_BURNED", payload: { player: playerId, cardId } });
      continue;
    }
    const card: CardInstance = {
      id: nextId(draft.state),
      cardId,
    };
    player.hand.push(card);
    addEvent(draft, { type: "CARD_DRAWN", payload: { player: playerId, cardId } });
  }
};

const resolveDeaths = (
  playerBoard: MinionInstance[],
  enemyBoard: MinionInstance[]
): { playerBoard: MinionInstance[]; enemyBoard: MinionInstance[]; dead: MinionInstance[] } => {
  const deadPlayer = playerBoard.filter((minion) => minion.health <= 0);
  const deadEnemy = enemyBoard.filter((minion) => minion.health <= 0);
  return {
    playerBoard: playerBoard.filter((minion) => minion.health > 0),
    enemyBoard: enemyBoard.filter((minion) => minion.health > 0),
    dead: [...deadPlayer, ...deadEnemy],
  };
};

const handleDeathrattles = (
  draft: {
    state: GameState;
    events: GameEvent[];
    nextEventId: number;
  },
  dead: MinionInstance[]
) => {
  const draws = { player: 0, enemy: 0 };
  dead.forEach((minion) => {
    if (minion.deathrattle === "DRAW_CARD") {
      draws[minion.owner] += 1;
    }
  });
  if (draws.player) drawCards(draft, PLAYER_ID, draws.player);
  if (draws.enemy) drawCards(draft, ENEMY_ID, draws.enemy);
};

const getSpellTargetType = (
  cardId: string
):
  | "NONE"
  | "FRIENDLY_MINION"
  | "ENEMY_MINION"
  | "ANY_MINION"
  | "ENEMY_ANY" => {
  switch (cardId) {
    case "VOID_GRASP_OF_NOTHING":
    case "EMBER_ASHFALL_STRIKE":
    case "EMBER_MOLTEN_VERDICT":
    case "EMBER_BURN_THE_WEAK":
      return "ENEMY_MINION";
    case "VOID_GRAVE_OFFERING":
      return "FRIENDLY_MINION";
    case "VOID_SILENCE_THE_LIGHT":
      return "ANY_MINION";
    case "EMBER_SCORCHING_COMMAND":
      return "ENEMY_ANY";
    default:
      return "NONE";
  }
};

const getHeroPowerTargetType = (playerId: PlayerId): "NONE" | "ENEMY_ANY" => {
  return playerId === PLAYER_ID ? "NONE" : "ENEMY_ANY";
};

const isTargetable = (minion: MinionInstance) => !minion.stealth && !minion.cloaked && minion.health > 0;

const hasTaunt = (board: MinionInstance[]) =>
  board.some((minion) => minion.taunt && isTargetable(minion));

const validateAttackTarget = (
  attacker: MinionInstance,
  target: TargetSpec,
  enemyBoard: MinionInstance[],
  enemyId: PlayerId
) => {
  if (target.type === "HERO") {
    if (target.player !== enemyId) return false;
    return !hasTaunt(enemyBoard);
  }
  if (target.owner !== enemyId) return false;
  const targetMinion = enemyBoard.find((minion) => minion.id === target.id);
  if (!targetMinion || !isTargetable(targetMinion)) return false;
  if (hasTaunt(enemyBoard)) {
    return targetMinion.taunt;
  }
  return true;
};

const applySpell = (
  draft: {
    state: GameState;
    events: GameEvent[];
    nextEventId: number;
  },
  playerId: PlayerId,
  cardId: string,
  target?: TargetSpec
) => {
  const player = draft.state.players[playerId];
  const enemy = draft.state.players[getOpponent(playerId)];
  const addDamageEvent = (targetSpec: TargetSpec, amount: number) => {
    addEvent(draft, {
      type: "DAMAGE_DEALT",
      payload: { source: { type: "SPELL" }, target: targetSpec, amount },
    });
  };

  switch (cardId) {
    case "VOID_VOID_TITHE": {
      const damaged = applyHeroDamage(player, 1);
      draft.state.players[playerId] = damaged.nextPlayer;
      addDamageEvent({ type: "HERO", player: playerId }, damaged.actualDamage);
      drawCards(draft, playerId, 1);
      return;
    }
    case "VOID_GRASP_OF_NOTHING": {
      if (!target || target.type !== "MINION") return;
      let actual = 0;
      enemy.board = enemy.board.map((minion) => {
        if (minion.id !== target.id) return minion;
        const result = applyDamageToMinion(minion, 2, playerId);
        actual = result.actualDamage;
        return result.next;
      });
      addDamageEvent(target, actual);
      return;
    }
    case "VOID_SHADOW_RECLAIM": {
      draft.state.players[playerId] = applyHeroHeal(player, 2);
      drawCards(draft, playerId, 1);
      return;
    }
    case "VOID_GRAVE_OFFERING": {
      if (!target || target.type !== "MINION") return;
      const board = player.board.map((minion) =>
        minion.id === target.id ? { ...minion, health: 0 } : minion
      );
      player.board = board;
      drawCards(draft, playerId, 2);
      return;
    }
    case "VOID_SILENCE_THE_LIGHT": {
      if (!target || target.type !== "MINION") return;
      const owner = target.owner;
      const ownerState = draft.state.players[owner];
      ownerState.board = ownerState.board.map((minion) =>
        minion.id === target.id
          ? {
              ...minion,
              attack: 1,
              taunt: false,
              lifesteal: false,
              stealth: false,
              shield: false,
              resilient: false,
              cloaked: false,
            }
          : minion
      );
      return;
    }
    case "VOID_ENCROACHING_VOID": {
      draft.state.players[PLAYER_ID].board = player.board.map((minion) => {
        const result = applyDamageToMinion(minion, 1, playerId);
        if (result.actualDamage > 0) {
          addDamageEvent({ type: "MINION", id: minion.id, owner: minion.owner }, result.actualDamage);
        }
        return result.next;
      });
      draft.state.players[ENEMY_ID].board = enemy.board.map((minion) => {
        const result = applyDamageToMinion(minion, 1, playerId);
        if (result.actualDamage > 0) {
          addDamageEvent({ type: "MINION", id: minion.id, owner: minion.owner }, result.actualDamage);
        }
        return result.next;
      });
      return;
    }
    case "EMBER_SCORCHING_COMMAND": {
      if (!target) return;
      if (target.type === "HERO") {
        const damaged = applyHeroDamage(enemy, 2);
        draft.state.players[getOpponent(playerId)] = damaged.nextPlayer;
        addDamageEvent(target, damaged.actualDamage);
        return;
      }
      let actual = 0;
      enemy.board = enemy.board.map((minion) => {
        if (minion.id !== target.id) return minion;
        const result = applyDamageToMinion(minion, 2, playerId);
        actual = result.actualDamage;
        return result.next;
      });
      addDamageEvent(target, actual);
      return;
    }
    case "EMBER_ASHFALL_STRIKE": {
      if (!target || target.type !== "MINION") return;
      let actual = 0;
      enemy.board = enemy.board.map((minion) => {
        if (minion.id !== target.id) return minion;
        const result = applyDamageToMinion(minion, 3, playerId);
        actual = result.actualDamage;
        return result.next;
      });
      addDamageEvent(target, actual);
      return;
    }
    case "EMBER_FLAME_SURGE": {
      enemy.board = enemy.board.map((minion) => {
        const result = applyDamageToMinion(minion, 1, playerId);
        if (result.actualDamage > 0) {
          addDamageEvent({ type: "MINION", id: minion.id, owner: minion.owner }, result.actualDamage);
        }
        return result.next;
      });
      return;
    }
    case "EMBER_BATTLE_CRY_OF_EMBERS": {
      player.board = player.board.map((minion) => ({ ...minion, attack: minion.attack + 1 }));
      return;
    }
    case "EMBER_MOLTEN_VERDICT": {
      if (!target || target.type !== "MINION") return;
      let targetResult: MinionInstance | null = null;
      let actual = 0;
      enemy.board = enemy.board.map((minion) => {
        if (minion.id !== target.id) return minion;
        const result = applyDamageToMinion(minion, 4, playerId);
        actual = result.actualDamage;
        targetResult = result.next;
        return result.next;
      });
      addDamageEvent(target, actual);
      if (targetResult && targetResult.health <= 0) {
        drawCards(draft, playerId, 1);
      }
      return;
    }
    case "EMBER_BURN_THE_WEAK": {
      if (!target || target.type !== "MINION") return;
      const targetMinion = enemy.board.find((minion) => minion.id === target.id);
      if (!targetMinion || targetMinion.health >= targetMinion.maxHealth) return;
      const firstHit = applyDamageToMinion(targetMinion, 2, playerId);
      let nextTarget = firstHit.next;
      addDamageEvent(target, firstHit.actualDamage);
      if (nextTarget.health > 0) {
        const secondHit = applyDamageToMinion(nextTarget, 1, playerId);
        nextTarget = secondHit.next;
        addDamageEvent(target, secondHit.actualDamage);
      }
      enemy.board = enemy.board.map((minion) => (minion.id === target.id ? nextTarget : minion));
      return;
    }
    default:
      return;
  }
};

const resolveDamageDeaths = (
  draft: { state: GameState; events: GameEvent[]; nextEventId: number },
  slam?: SlamProfile
) => {
  const playerBoard = draft.state.players[PLAYER_ID].board;
  const enemyBoard = draft.state.players[ENEMY_ID].board;
  const resolved = resolveDeaths(playerBoard, enemyBoard);
  draft.state.players[PLAYER_ID].board = resolved.playerBoard;
  draft.state.players[ENEMY_ID].board = resolved.enemyBoard;
  resolved.dead.forEach((minion) => {
    addEvent(draft, {
      type: "MINION_DIED",
      payload: { minionId: minion.id, owner: minion.owner, slam },
    });
  });
  handleDeathrattles(draft, resolved.dead);
};

const startTurn = (draft: {
  state: GameState;
  events: GameEvent[];
  nextEventId: number;
}) => {
  const active = draft.state.turn;
  draft.state.turnCounter += 1;
  const player = draft.state.players[active];
  player.maxMana = Math.min(MAX_MANA, player.maxMana + 1);
  player.mana = player.maxMana;
  player.hero.heroPowerUsed = false;
  player.board = player.board.map((minion) => ({
    ...minion,
    canAttack: !minion.summoningSick,
    summoningSick: false,
    berserkerBuffedThisTurn: false,
  }));
  drawCards(draft, active, 1);
  addEvent(draft, {
    type: "TURN_STARTED",
    payload: { player: active, turn: draft.state.turnCounter },
  });
};

const endTurn = (draft: {
  state: GameState;
  events: GameEvent[];
  nextEventId: number;
}) => {
  addEvent(draft, {
    type: "TURN_ENDED",
    payload: { player: draft.state.turn, turn: draft.state.turnCounter },
  });
  draft.state.turn = getOpponent(draft.state.turn);
  startTurn(draft);
};

const ensureWinner = (draft: { state: GameState }) => {
  const playerHero = draft.state.players[PLAYER_ID].hero.health;
  const enemyHero = draft.state.players[ENEMY_ID].hero.health;
  if (playerHero <= 0) {
    draft.state.winner = ENEMY_ID;
  } else if (enemyHero <= 0) {
    draft.state.winner = PLAYER_ID;
  }
};

export const createInitialState = (seed: number = DEFAULT_SEED): GameState => {
  let rngState = seed >>> 0;
  const playerShuffle = shuffleWithRng(PLAYER_DECK, rngState);
  rngState = playerShuffle.next;
  const enemyShuffle = shuffleWithRng(ENEMY_DECK, rngState);
  rngState = enemyShuffle.next;

  const baseState: GameState = {
    turn: PLAYER_ID,
    turnCounter: 0,
    players: {
      player: {
        hero: { id: "LYRA", name: "Lyra", health: HERO_HEALTH, maxHealth: HERO_HEALTH, fatigue: 0, heroPowerUsed: false },
        deck: playerShuffle.shuffled,
        deckIndex: 0,
        hand: [],
        board: [],
        mana: 0,
        maxMana: 0,
      },
      enemy: {
        hero: { id: "THAROS", name: "Tharos", health: HERO_HEALTH, maxHealth: HERO_HEALTH, fatigue: 0, heroPowerUsed: false },
        deck: enemyShuffle.shuffled,
        deckIndex: 0,
        hand: [],
        board: [],
        mana: 0,
        maxMana: 0,
      },
    },
    winner: null,
    log: [],
    rngState,
    nextId: 0,
    nextEventId: 0,
  };

  const draft = { state: baseState, events: [] as GameEvent[], nextEventId: 0 };
  drawCards(draft, PLAYER_ID, STARTING_HAND_SIZE);
  drawCards(draft, ENEMY_ID, STARTING_HAND_SIZE);
  startTurn(draft);
  draft.state.log = [...draft.state.log, ...draft.events];
  draft.state.nextEventId = draft.nextEventId;
  return draft.state;
};

const finalizeState = (draft: {
  state: GameState;
  events: GameEvent[];
  nextEventId: number;
}) => {
  draft.state.nextEventId = draft.nextEventId;
  draft.state.log = [...draft.state.log, ...draft.events];
  return draft.state;
};

export const engineReducer = (state: GameState, intent: Intent): GameState => {
  if (state.winner) return state;
  if (intent.player !== state.turn && intent.type !== "DECLARE_ATTACK") {
    return state;
  }

  const nextState = cloneState(state);
  const draft = {
    state: nextState,
    events: [] as GameEvent[],
    nextEventId: nextState.nextEventId,
  };

  const active = draft.state.players[state.turn];
  const opponent = draft.state.players[getOpponent(state.turn)];

  switch (intent.type) {
    case "END_TURN": {
      if (intent.player !== state.turn) return state;
      endTurn(draft);
      break;
    }
    case "PLAY_CARD": {
      if (intent.player !== state.turn) return state;
      const handIndex = active.hand.findIndex((card) => card.id === intent.handId);
      if (handIndex === -1) return state;
      const card = active.hand[handIndex];
      const cardDef = getCardDef(card.cardId);
      if (!cardDef) return state;
      if (active.mana < cardDef.cost) return state;

      if (cardDef.type === "MINION") {
        if (active.board.length >= MAX_BOARD_SIZE) return state;
        const minion = createMinion(card.cardId, intent.player, nextId(draft.state));
        active.board = [...active.board, minion];
        active.hand = active.hand.filter((entry) => entry.id !== card.id);
        active.mana -= cardDef.cost;
        addEvent(draft, { type: "CARD_PLAYED", payload: { player: intent.player, cardId: card.cardId } });

        if (card.cardId === "VOID_DUSK_HERALD") {
          const damaged = applyHeroDamage(active, 1);
          draft.state.players[intent.player] = damaged.nextPlayer;
          addEvent(draft, {
            type: "DAMAGE_DEALT",
            payload: { source: { type: "OTHER" }, target: { type: "HERO", player: intent.player }, amount: damaged.actualDamage },
          });
        }
        ensureWinner(draft);
        return finalizeState(draft);
      }

      const targetType = getSpellTargetType(card.cardId);
      if (targetType !== "NONE" && !intent.target) return state;
      if (targetType === "FRIENDLY_MINION" && intent.target?.type !== "MINION") return state;
      if (targetType === "ENEMY_MINION" && intent.target?.type !== "MINION") return state;
      if (targetType === "ANY_MINION" && intent.target?.type !== "MINION") return state;
      if (targetType === "ENEMY_ANY" && !intent.target) return state;
      if (intent.target?.type === "MINION") {
        if (intent.target.owner !== getOpponent(intent.player)) return state;
        const targetMinion = opponent.board.find((minion) => minion.id === intent.target?.id);
        if (!targetMinion || !isTargetable(targetMinion)) return state;
      }
      if (intent.target?.type === "HERO" && intent.target.player !== getOpponent(intent.player)) {
        return state;
      }
      if (intent.target?.type === "MINION") {
        const targetOwner = intent.target.owner;
        if (
          targetType === "FRIENDLY_MINION" &&
          targetOwner !== intent.player
        )
          return state;
        if (
          (targetType === "ENEMY_MINION" || targetType === "ENEMY_ANY") &&
          targetOwner !== getOpponent(intent.player)
        )
          return state;
        const ownerState = draft.state.players[targetOwner];
        const targetMinion = ownerState.board.find((minion) => minion.id === intent.target?.id);
        if (!targetMinion || !isTargetable(targetMinion)) return state;
      }

      active.hand = active.hand.filter((entry) => entry.id !== card.id);
      active.mana -= cardDef.cost;
      addEvent(draft, { type: "CARD_PLAYED", payload: { player: intent.player, cardId: card.cardId } });
      applySpell(draft, intent.player, card.cardId, intent.target);
      resolveDamageDeaths(draft);
      ensureWinner(draft);
      break;
    }
    case "USE_HERO_POWER": {
      if (intent.player !== state.turn) return state;
      const heroPower = getHeroPowerFor(active.hero.id);
      if (!heroPower) return state;
      if (active.hero.heroPowerUsed) return state;
      if (active.mana < heroPower.cost) return state;
      const targetType = getHeroPowerTargetType(intent.player);
      if (targetType === "ENEMY_ANY" && !intent.target) return state;

      active.hero.heroPowerUsed = true;
      active.mana -= heroPower.cost;
      addEvent(draft, { type: "HERO_POWER_USED", payload: { player: intent.player, powerId: heroPower.id } });

      if (intent.player === PLAYER_ID) {
        const damaged = applyHeroDamage(active, 1);
        draft.state.players[intent.player] = damaged.nextPlayer;
        addEvent(draft, {
          type: "DAMAGE_DEALT",
          payload: { source: { type: "HERO_POWER" }, target: { type: "HERO", player: intent.player }, amount: damaged.actualDamage },
        });
        drawCards(draft, intent.player, 1);
      } else {
        const target = intent.target;
        if (!target) return state;
        if (target.type === "HERO") {
          const damaged = applyHeroDamage(opponent, 1);
          draft.state.players[getOpponent(intent.player)] = damaged.nextPlayer;
          addEvent(draft, {
            type: "DAMAGE_DEALT",
            payload: { source: { type: "HERO_POWER" }, target, amount: damaged.actualDamage },
          });
        } else {
          opponent.board = opponent.board.map((minion) =>
            minion.id === target.id ? applyDamageToMinion(minion, 1, intent.player).next : minion
          );
          addEvent(draft, {
            type: "DAMAGE_DEALT",
            payload: { source: { type: "HERO_POWER" }, target, amount: 1 },
          });
        }
      }
      resolveDamageDeaths(draft);
      ensureWinner(draft);
      break;
    }
    case "DECLARE_ATTACK": {
      if (intent.player !== state.turn) return state;
      const attacker = active.board.find((minion) => minion.id === intent.attackerId);
      if (!attacker || !attacker.canAttack || attacker.summoningSick) return state;
      if (!validateAttackTarget(attacker, intent.target, opponent.board, getOpponent(intent.player)))
        return state;

      attacker.canAttack = false;
      const damageEvents: Array<{ target: TargetSpec; amount: number }> = [];
      let slamProfile: SlamProfile = "LIGHT";

      if (intent.target.type === "HERO") {
        const damaged = applyHeroDamage(opponent, attacker.attack);
        draft.state.players[getOpponent(intent.player)] = damaged.nextPlayer;
        damageEvents.push({ target: intent.target, amount: damaged.actualDamage });
      } else {
        const targetMinion = opponent.board.find((minion) => minion.id === intent.target.id);
        if (!targetMinion) return state;
        const attackerResult = applyDamageToMinion(attacker, targetMinion.attack, intent.player);
        const targetResult = applyDamageToMinion(targetMinion, attacker.attack, intent.player);
        active.board = active.board.map((minion) =>
          minion.id === attacker.id ? attackerResult.next : minion
        );
        opponent.board = opponent.board.map((minion) =>
          minion.id === targetMinion.id ? targetResult.next : minion
        );
        damageEvents.push({ target: intent.target, amount: targetResult.actualDamage });
        damageEvents.push({ target: { type: "MINION", id: attacker.id, owner: intent.player }, amount: attackerResult.actualDamage });
      }

      if (attacker.lifesteal) {
        const healed = damageEvents.reduce((total, entry) => total + entry.amount, 0);
        draft.state.players[intent.player] = applyHeroHeal(active, healed);
      }

      const preResolveDead = resolveDeaths(active.board, opponent.board).dead;
      if (preResolveDead.length > 0) {
        slamProfile = "HEAVY";
      }
      ensureWinner(draft);
      if (draft.state.winner) {
        slamProfile = "LETHAL";
      }

      addEvent(draft, {
        type: "ATTACK_DECLARED",
        payload: { player: intent.player, attackerId: attacker.id, target: intent.target, slam: slamProfile },
      });
      damageEvents.forEach((entry) => {
        addEvent(draft, {
          type: "DAMAGE_DEALT",
          payload: { source: { type: "ATTACK" }, target: entry.target, amount: entry.amount, slam: slamProfile },
        });
      });
      resolveDamageDeaths(draft, slamProfile);
      addEvent(draft, { type: "COMBAT_RESOLVED", payload: { slam: slamProfile } });
      ensureWinner(draft);
      break;
    }
    default:
      return state;
  }

  return finalizeState(draft);
};

export const getCardTargetType = getSpellTargetType;
export const getHeroPowerTargetTypeFor = getHeroPowerTargetType;
