import { CardRegistry, getHeroPowerFor } from "../cards/CardRegistry";
import { COMBAT_TIMING } from "./combatTiming";
import {
  DEFAULT_SEED,
  ENEMY_DECK,
  ENEMY_ID,
  HERO_HEALTH,
  MAX_BOARD_SIZE,
  MAX_HAND_SIZE,
  MAX_MANA,
  PLAYER_DECK,
  PLAYER_ID,
  STARTING_HAND_SIZE,
} from "./constants";
import { shuffleWithRng, nextRng } from "./rng";
import type {
  CardInstance,
  GameEvent,
  GameState,
  HeroState,
  Intent,
  MinionInstance,
  PlayerId,
  PlayerState,
  SlamProfile,
  TargetSpec,
} from "./types";

const getCardDef = (cardId: string) => CardRegistry[cardId];

const nextId = (state: GameState) => {
  state.nextId += 1;
  return `${state.nextId}`;
};

const addEvent = (
  draft: { state: GameState; events: GameEvent[]; nextEventId: number },
  event: Omit<GameEvent, "id">
) => {
  const id = draft.nextEventId;
  draft.nextEventId += 1;
  draft.events.push({ ...event, id } as GameEvent);
};

const cloneState = (state: GameState): GameState => ({
  ...state,
  players: {
    player: {
      ...state.players.player,
      hero: { ...state.players.player.hero },
      hand: [...state.players.player.hand],
      board: state.players.player.board.map((m) => ({ ...m })),
    },
    enemy: {
      ...state.players.enemy,
      hero: { ...state.players.enemy.hero },
      hand: [...state.players.enemy.hand],
      board: state.players.enemy.board.map((m) => ({ ...m })),
    },
  },
  log: [...state.log],
});

const getOpponent = (playerId: PlayerId): PlayerId => (playerId === PLAYER_ID ? ENEMY_ID : PLAYER_ID);

const hasKeyword = (cardId: string, keyword: string) => {
  const card = getCardDef(cardId);
  if (!card || card.type !== "MINION") return false;
  return (card.keywords ?? []).includes(keyword);
};

const createMinion = (cardId: string, owner: PlayerId, id: string): MinionInstance => {
  const card = getCardDef(cardId);
  if (!card || card.type !== "MINION") {
    return {
      id,
      cardId,
      owner,
      attack: 0,
      health: 0,
      maxHealth: 0,
      canAttack: false,
      summoningSick: true,
      taunt: false,
      lifesteal: false,
      stealth: false,
      shield: false,
      resilient: false,
      cloaked: false,
      berserkerBuffedThisTurn: false,
      deathrattle: null,
      onAttackDrainHero: false,
    };
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
  if (minion.resilient && activeTurn !== minion.owner) {
    nextHealth = Math.max(1, nextHealth);
  }

  return { next: { ...minion, health: nextHealth }, actualDamage: amount };
};

const applyHeroDamage = (
  player: PlayerState,
  amount: number
): { nextPlayer: PlayerState; actualDamage: number } => {
  if (amount <= 0) return { nextPlayer: player, actualDamage: 0 };
  const hero = player.hero;
  const nextHealth = hero.health - amount;
  return { nextPlayer: { ...player, hero: { ...hero, health: nextHealth } }, actualDamage: amount };
};

const applyHeroHeal = (player: PlayerState, amount: number): PlayerState => {
  if (amount <= 0) return player;
  const hero = player.hero;
  const nextHealth = Math.min(hero.maxHealth, hero.health + amount);
  return { ...player, hero: { ...hero, health: nextHealth } };
};

const spendManaAndRemoveCard = (player: PlayerState, handId: string, cost: number) => {
  player.hand = player.hand.filter((entry) => entry.id !== handId);
  player.mana -= cost;
};

const drawCard = (draft: { state: GameState; events: GameEvent[]; nextEventId: number }, playerId: PlayerId) => {
  const player = draft.state.players[playerId];

  if (player.deckIndex >= player.deck.length) {
    // fatigue
    player.hero.fatigue += 1;
    const fatigueDamage = player.hero.fatigue;
    const damaged = applyHeroDamage(player, fatigueDamage);
    draft.state.players[playerId] = damaged.nextPlayer;
    addEvent(draft, {
      type: "DAMAGE_DEALT",
      payload: {
        source: { type: "FATIGUE" },
        target: { type: "HERO", player: playerId },
        amount: damaged.actualDamage,
      },
    });
    return;
  }

  const cardId = player.deck[player.deckIndex];
  player.deckIndex += 1;

  if (player.hand.length >= MAX_HAND_SIZE) {
    addEvent(draft, { type: "CARD_BURNED", payload: { player: playerId, cardId } });
    return;
  }

  player.hand = [...player.hand, { id: nextId(draft.state), cardId }];
  addEvent(draft, { type: "CARD_DRAWN", payload: { player: playerId, cardId } });
};

const drawCards = (
  draft: { state: GameState; events: GameEvent[]; nextEventId: number },
  playerId: PlayerId,
  count: number
) => {
  for (let i = 0; i < count; i += 1) {
    drawCard(draft, playerId);
  }
};

const resolveDeaths = (playerBoard: MinionInstance[], enemyBoard: MinionInstance[]) => {
  const deadPlayer = playerBoard.filter((minion) => minion.health <= 0);
  const deadEnemy = enemyBoard.filter((minion) => minion.health <= 0);

  return {
    playerBoard: playerBoard.filter((minion) => minion.health > 0),
    enemyBoard: enemyBoard.filter((minion) => minion.health > 0),
    dead: [...deadPlayer, ...deadEnemy],
  };
};

const handleDeathrattles = (
  draft: { state: GameState; events: GameEvent[]; nextEventId: number },
  dead: MinionInstance[]
) => {
  const draws = { player: 0, enemy: 0 };
  dead.forEach((minion) => {
    if (minion.deathrattle === "DRAW_CARD") {
      draws[minion.owner] += 1;
    }
  });

  if (draws.player > 0) drawCards(draft, PLAYER_ID, draws.player);
  if (draws.enemy > 0) drawCards(draft, ENEMY_ID, draws.enemy);
};

const resolveDamageDeaths = (draft: { state: GameState; events: GameEvent[]; nextEventId: number }, slam: SlamProfile) => {
  const resolved = resolveDeaths(draft.state.players[PLAYER_ID].board, draft.state.players[ENEMY_ID].board);
  draft.state.players[PLAYER_ID].board = resolved.playerBoard;
  draft.state.players[ENEMY_ID].board = resolved.enemyBoard;

  resolved.dead.forEach((minion) => {
    addEvent(draft, { type: "MINION_DIED", payload: { minionId: minion.id, owner: minion.owner, slam } });
  });

  handleDeathrattles(draft, resolved.dead);
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

const startTurn = (draft: { state: GameState; events: GameEvent[]; nextEventId: number }) => {
  const active = draft.state.turn;
  draft.state.turnCounter += 1;

  const player = draft.state.players[active];
  player.maxMana = Math.min(MAX_MANA, player.maxMana + 1);
  player.mana = player.maxMana;
  player.hero.heroPowerUsed = false;

  // ✅ FIX: refresh ALL surviving minions at start of their owner's turn.
  // Summoned last turn? They were summoningSick=true and become ready now.
  player.board = player.board.map((minion) => ({
    ...minion,
    canAttack: true,
    summoningSick: false,
    berserkerBuffedThisTurn: false,
  }));

  drawCards(draft, active, 1);

  addEvent(draft, {
    type: "TURN_STARTED",
    payload: { player: active, turn: draft.state.turnCounter },
  });
};

const endTurn = (draft: { state: GameState; events: GameEvent[]; nextEventId: number }) => {
  addEvent(draft, {
    type: "TURN_ENDED",
    payload: { player: draft.state.turn, turn: draft.state.turnCounter },
  });
  draft.state.turn = getOpponent(draft.state.turn);
  startTurn(draft);
};

const getSpellTargetType = (cardId: string) => {
  switch (cardId) {
    case "VOID_VOID_TITHE":
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

const hasTaunt = (board: MinionInstance[]) => board.some((minion) => minion.taunt && isTargetable(minion));

const validateAttackTarget = (
  attacker: MinionInstance,
  target: TargetSpec,
  enemyBoard: MinionInstance[],
  enemyId: PlayerId
) => {
  if (target.type === "HERO") {
    if (target.player !== enemyId) return false;
    if (hasTaunt(enemyBoard)) return false;
    return true;
  }

  if (target.owner !== enemyId) return false;
  const targetMinion = enemyBoard.find((minion) => minion.id === target.id);
  if (!targetMinion) return false;
  if (!isTargetable(targetMinion)) return false;

  if (hasTaunt(enemyBoard)) {
    return !!targetMinion.taunt;
  }
  return true;
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

  baseState.log = draft.events;
  baseState.nextEventId = draft.nextEventId;
  baseState.rngState = rngState;

  return baseState;
};

const finalizeState = (draft: { state: GameState; events: GameEvent[]; nextEventId: number }) => {
  draft.state.log = [...draft.state.log, ...draft.events];
  draft.state.nextEventId = draft.nextEventId;
  return draft.state;
};

export const engineReducer = (state: GameState, intent: Intent): GameState => {
  if (state.winner) return state;

  // Keep the turn gate simple and explicit.
  if (intent.player !== state.turn) return state;

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
      endTurn(draft);
      ensureWinner(draft);
      break;
    }

    case "PLAY_CARD": {
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
        spendManaAndRemoveCard(active, card.id, cardDef.cost);

        addEvent(draft, { type: "CARD_PLAYED", payload: { player: intent.player, cardId: card.cardId } });
        break;
      }

      if (cardDef.type === "SPELL") {
        const targetType = getSpellTargetType(card.cardId);
        if (targetType === "NONE") {
          spendManaAndRemoveCard(active, card.id, cardDef.cost);
          addEvent(draft, { type: "CARD_PLAYED", payload: { player: intent.player, cardId: card.cardId } });
          break;
        }

        if (!intent.target) return state;
        if (targetType === "FRIENDLY_MINION") {
          if (intent.target.type !== "MINION") return state;
          const targetMinion = active.board.find((m) => m.id === intent.target!.id);
          if (!targetMinion) return state;

          const healed = Math.min(3, targetMinion.maxHealth - targetMinion.health);
          active.board = active.board.map((m) => (m.id === targetMinion.id ? { ...m, health: m.health + healed } : m));

          spendManaAndRemoveCard(active, card.id, cardDef.cost);

          addEvent(draft, { type: "CARD_PLAYED", payload: { player: intent.player, cardId: card.cardId } });
          break;
        }

        if (targetType === "ANY_MINION") {
          if (intent.target.type !== "MINION") return state;
          const owner = intent.target.owner;
          const targetBoard = draft.state.players[owner].board;
          const targetMinion = targetBoard.find((m) => m.id === intent.target!.id);
          if (!targetMinion) return state;

          draft.state.players[owner].board = targetBoard.map((m) =>
            m.id === targetMinion.id ? { ...m, stealth: false, cloaked: false } : m
          );

          spendManaAndRemoveCard(active, card.id, cardDef.cost);

          addEvent(draft, { type: "CARD_PLAYED", payload: { player: intent.player, cardId: card.cardId } });
          break;
        }

        if (targetType === "ENEMY_ANY") {
          const enemyId = getOpponent(intent.player);

          if (intent.target.type === "HERO") {
            if (intent.target.player !== enemyId) return state;
            const damaged = applyHeroDamage(opponent, 2);
            draft.state.players[enemyId] = damaged.nextPlayer;

            spendManaAndRemoveCard(active, card.id, cardDef.cost);

            addEvent(draft, { type: "CARD_PLAYED", payload: { player: intent.player, cardId: card.cardId } });
            addEvent(draft, {
              type: "DAMAGE_DEALT",
              payload: { source: { type: "SPELL" }, target: intent.target, amount: damaged.actualDamage },
            });
            ensureWinner(draft);
            break;
          }

          if (intent.target.type === "MINION") {
            if (intent.target.owner !== enemyId) return state;
            const targetMinion = opponent.board.find((m) => m.id === intent.target!.id);
            if (!targetMinion) return state;

            const result = applyDamageToMinion(targetMinion, 2, intent.player);
            opponent.board = opponent.board.map((m) => (m.id === targetMinion.id ? result.next : m));

            spendManaAndRemoveCard(active, card.id, cardDef.cost);

            addEvent(draft, { type: "CARD_PLAYED", payload: { player: intent.player, cardId: card.cardId } });
            addEvent(draft, {
              type: "DAMAGE_DEALT",
              payload: { source: { type: "SPELL" }, target: intent.target, amount: result.actualDamage },
            });

            resolveDamageDeaths(draft, "LIGHT");
            ensureWinner(draft);
            break;
          }
        }
      }

      break;
    }

    case "USE_HERO_POWER": {
      if (active.hero.heroPowerUsed) return state;

      const power = getHeroPowerFor(active.hero.id);
      if (!power) return state;
      if (active.mana < power.cost) return state;

      const targetType = getHeroPowerTargetType(intent.player);
      if (targetType === "NONE") {
        active.mana -= power.cost;
        active.hero.heroPowerUsed = true;
        drawCards(draft, intent.player, 1);
        break;
      }

      if (targetType === "ENEMY_ANY") {
        if (!intent.target) return state;
        const enemyId = getOpponent(intent.player);

        active.mana -= power.cost;
        active.hero.heroPowerUsed = true;

        if (intent.target.type === "HERO") {
          if (intent.target.player !== enemyId) return state;
          const damaged = applyHeroDamage(opponent, 2);
          draft.state.players[enemyId] = damaged.nextPlayer;

          addEvent(draft, {
            type: "DAMAGE_DEALT",
            payload: { source: { type: "HERO_POWER" }, target: intent.target, amount: damaged.actualDamage },
          });
          ensureWinner(draft);
          break;
        }

        if (intent.target.type === "MINION") {
          if (intent.target.owner !== enemyId) return state;
          const targetMinion = opponent.board.find((m) => m.id === intent.target!.id);
          if (!targetMinion) return state;

          const result = applyDamageToMinion(targetMinion, 2, intent.player);
          opponent.board = opponent.board.map((m) => (m.id === targetMinion.id ? result.next : m));

          addEvent(draft, {
            type: "DAMAGE_DEALT",
            payload: { source: { type: "HERO_POWER" }, target: intent.target, amount: result.actualDamage },
          });

          resolveDamageDeaths(draft, "LIGHT");
          ensureWinner(draft);
          break;
        }
      }

      break;
    }

    case "DECLARE_ATTACK": {
      const attacker = active.board.find((minion) => minion.id === intent.attackerId);
      if (!attacker || !attacker.canAttack || attacker.summoningSick) return state;
      if (!validateAttackTarget(attacker, intent.target, opponent.board, getOpponent(intent.player))) return state;

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

        active.board = active.board.map((minion) => (minion.id === attacker.id ? attackerResult.next : minion));
        opponent.board = opponent.board.map((minion) => (minion.id === targetMinion.id ? targetResult.next : minion));

        damageEvents.push({ target: intent.target, amount: targetResult.actualDamage });
        damageEvents.push({
          target: { type: "MINION", id: attacker.id, owner: intent.player },
          amount: attackerResult.actualDamage,
        });
      }

      if (attacker.lifesteal) {
        const healed = damageEvents.reduce((total, entry) => total + entry.amount, 0);
        draft.state.players[intent.player] = applyHeroHeal(active, healed);
      }

      const preResolveDead = resolveDeaths(active.board, opponent.board).dead;
      if (preResolveDead.length > 0) slamProfile = "HEAVY";

      ensureWinner(draft);
      if (draft.state.winner) slamProfile = "LETHAL";

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
