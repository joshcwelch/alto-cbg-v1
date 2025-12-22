import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BoardSlots } from "./BoardSlots";
import AbilityFrame from "./AbilityFrame";
import BoardCursor from "./BoardCursor";
import BoardMinion from "./BoardMinion";
import CardBack from "./CardBack";
import CursorCoords from "./CursorCoords";
import EndTurnButton from "./EndTurnButton";
import GraveyardPortal, { GRAVEYARD_PORTAL_SIZE } from "./GraveyardPortal";
import GraveyardVoidFX from "./GraveyardVoidFX";
import HandCard from "./HandCard";
import HeroSlot from "./HeroSlot";
import ManaBar from "./ManaBar";
import MenuStamp from "./MenuStamp";
import { useGameContext } from "../GameRoot";
import { CardRegistry, HeroPowers } from "../cards/CardRegistry";

type HandCardData = {
  id: string;
  cardId: string;
  slot: { x: number; y: number };
  rotation: number;
};

type MinionInstance = {
  id: string;
  cardId: string;
  owner: TurnState;
  art: string;
  alt: string;
  attack: number;
  health: number;
  maxHealth: number;
  tribe: string | null;
  canAttack: boolean;
  summoningSick: boolean;
  taunt: boolean;
  lifesteal: boolean;
  stealth: boolean;
  shield: boolean;
  resilient: boolean;
  cloaked: boolean;
  berserkerBuffedThisTurn: boolean;
  deathrattle: "WRAITH_BUFF" | "ROOTSNARL_TREANT" | "DRAW_CARD" | null;
  onAttackDrainHero: boolean;
};

type DragVisual = {
  id: string;
  minion: MinionInstance;
  art: string;
  alt: string;
  attack: number;
  health: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  startTime: number;
  durationMs: number;
};

type AttackVisual = {
  id: string;
  art: string;
  alt: string;
  attack: number;
  health: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  startTime: number;
  durationMs: number;
};

type GraveyardBurst = {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
};

type LaneConfig = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type TurnState = "player" | "enemy";

const BoardStage = () => {
  const { cursor } = useGameContext();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [turn, setTurn] = useState<TurnState>("player");
  const [sharedMana, setSharedMana] = useState(1);
  const [sharedMaxMana, setSharedMaxMana] = useState(1);
  const [playerHealth, setPlayerHealth] = useState(30);
  const [enemyHealth, setEnemyHealth] = useState(30);
  const [playerHeroPowerUsed, setPlayerHeroPowerUsed] = useState(false);
  const [enemyHeroPowerUsed, setEnemyHeroPowerUsed] = useState(false);
  const [enemyBonusManaNextTurn, setEnemyBonusManaNextTurn] = useState(false);
  const winner = playerHealth <= 0 ? "enemy" : enemyHealth <= 0 ? "player" : null;
  const isGameOver = winner !== null;
  const [turnTimeLeftMs, setTurnTimeLeftMs] = useState(50000);
  const turnTimeoutRef = useRef<number | null>(null);
  const prevTurnRef = useRef<TurnState | null>(null);
  const roundPendingRef = useRef(false);
  const [targetingFrom, setTargetingFrom] = useState<{ id: string; x: number; y: number } | null>(
    null
  );
  const [targetingToId, setTargetingToId] = useState<string | null>(null);
  const [targetingToHero, setTargetingToHero] = useState<{
    id: "enemy-hero" | "player-hero";
    x: number;
    y: number;
  } | null>(null);
  const [spellTargetingFrom, setSpellTargetingFrom] = useState<{
    cardId: string;
    handId: string;
    x: number;
    y: number;
  } | null>(null);
  const [spellTargetingToMinion, setSpellTargetingToMinion] = useState<{
    id: string;
    owner: TurnState;
  } | null>(null);
  const [spellTargetingToHero, setSpellTargetingToHero] = useState<{
    id: "enemy-hero" | "player-hero";
    x: number;
    y: number;
  } | null>(null);

  const cardArtOverrides: Record<string, string> = useMemo(
    () => ({
      CELESTIAL_CRYSTAL_ACOLYTE: "/assets/cards/crystal-acolyte.png",
      CELESTIAL_LIGHTBORN_ADEPT: "/assets/cards/sunlance-scout.png",
      CELESTIAL_DAWNWATCH_CLERIC: "/assets/cards/beacon-monk.png",
      EMBER_EMBERFORGED_BERSERKER: "/assets/cards/sunlance-champion.png",
      SYLVAN_ROOTSNARL_GUARDIAN: "/assets/cards/seraphic-warden.png",
    }),
    []
  );

  const playerDeckIds = useMemo(
    () => [
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
    ],
    []
  );

  const enemyDeckIds = useMemo(
    () => [
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
    ],
    []
  );

  const playerHeroPower = HeroPowers.LYRA_VOID_TITHE;
  const enemyHeroPower = HeroPowers.THAROS_EMBER_COMMAND;

  const createHand = (deck: string[], owner: string) =>
    deck.slice(0, 5).map((cardId, index) => ({
      id: `${owner}-hand-${index}-${cardId}`,
      cardId,
      slot: { x: BoardSlots.Hand.x, y: BoardSlots.Hand.y },
      rotation: 0,
    }));

  const [handCards, setHandCards] = useState<HandCardData[]>(() =>
    createHand(playerDeckIds, "player")
  );
  const [playerDrawIndex, setPlayerDrawIndex] = useState(5);

  const [playerMinions, setPlayerMinions] = useState<MinionInstance[]>([]);
  const [enemyMinions, setEnemyMinions] = useState<MinionInstance[]>([]);
  const [enemyHand, setEnemyHand] = useState<HandCardData[]>(() =>
    createHand(enemyDeckIds, "enemy")
  );
  const [enemyDrawIndex, setEnemyDrawIndex] = useState(5);
  const drawCards = (owner: TurnState, count: number, handSizeOffset = 0) => {
    if (count <= 0) return;
    if (owner === "player") {
      setPlayerDrawIndex((index) => {
        let nextIndex = index;
        setHandCards((prev) => {
          let nextHand = [...prev];
          for (let i = 0; i < count; i += 1) {
            if (nextHand.length + handSizeOffset >= maxHandSize) break;
            const cardId = playerDeckIds[nextIndex % playerDeckIds.length];
            nextHand = [
              ...nextHand,
              {
                id: `hand-${Date.now()}-${nextIndex}-${i}`,
                cardId,
                slot: prev[0]?.slot ?? { x: BoardSlots.Hand.x, y: BoardSlots.Hand.y },
                rotation: 0,
              },
            ];
            nextIndex += 1;
          }
          return nextHand;
        });
        return nextIndex;
      });
      return;
    }
    setEnemyDrawIndex((index) => {
      let nextIndex = index;
      setEnemyHand((prev) => {
        let nextHand = [...prev];
        for (let i = 0; i < count; i += 1) {
          if (nextHand.length + handSizeOffset >= maxHandSize) break;
          const cardId = enemyDeckIds[nextIndex % enemyDeckIds.length];
          nextHand = [
            ...nextHand,
            {
              id: `enemy-${Date.now()}-${nextIndex}-${i}`,
              cardId,
              slot: { x: BoardSlots.Hand.x, y: BoardSlots.Hand.y },
              rotation: 0,
            },
          ];
          nextIndex += 1;
        }
        return nextHand;
      });
      return nextIndex;
    });
  };
  const [enemyDrag, setEnemyDrag] = useState<DragVisual | null>(null);
  const [enemyDragPos, setEnemyDragPos] = useState<{ x: number; y: number } | null>(null);
  const enemyDragFrameRef = useRef<number | null>(null);
  const enemyAttackTimerRef = useRef<number | null>(null);
  const [attackVisual, setAttackVisual] = useState<AttackVisual | null>(null);
  const [attackVisualPos, setAttackVisualPos] = useState<{ x: number; y: number } | null>(null);
  const attackVisualFrameRef = useRef<number | null>(null);
  const pendingAttackRef = useRef<{
    visualId: string;
    owner: TurnState;
    attackerId: string;
    targetMinionId: string | null;
    targetHero: "player-hero" | "enemy-hero" | null;
  } | null>(null);
  const [graveyardBursts, setGraveyardBursts] = useState<GraveyardBurst[]>([]);
  const prevMinionIdsRef = useRef<{ player: Set<string>; enemy: Set<string> }>({
    player: new Set(),
    enemy: new Set(),
  });
  const prevMinionBoundsRef = useRef<
    Map<string, { x: number; y: number; width: number; height: number }>
  >(new Map());

  const playerLane: LaneConfig = useMemo(
    () => ({
      left: 268,
      top: 590,
      width: 1000,
      height: 180,
    }),
    []
  );

  const enemyLane: LaneConfig = useMemo(
    () => ({
      left: 268,
      top: 250,
      width: 1000,
      height: 180,
    }),
    []
  );

  const minionSize = 130;
  const heroFrameSize = 223;
  const maxHandSize = 7;
  const enemyCardBackSize = { width: 140, height: 210 };
  const attackDelayMs = 260;

  const getCardDef = (cardId: string) => CardRegistry[cardId];
  const getCardArt = (cardId: string) =>
    CardRegistry[cardId]?.art ?? cardArtOverrides[cardId];
  // TODO: Add art paths for any card IDs not covered by CardRegistry art or overrides.

  const createMinionFromCard = (cardId: string, owner: TurnState): MinionInstance | null => {
    const card = getCardDef(cardId);
    if (!card || card.type !== "MINION") return null;
    const text = card.text ?? "";
    const tags = card.tags ?? [];
    const hasKeyword = (keyword: string) =>
      text.includes(keyword) || tags.some((tag) => tag === keyword);
    const deathrattle =
      cardId === "VOID_SHARDLANDS_WRAITH"
        ? "WRAITH_BUFF"
        : cardId === "SYLVAN_ROOTSNARL_GUARDIAN"
          ? "ROOTSNARL_TREANT"
          : cardId === "VOID_VOIDBOUND_ACOLYTE"
            ? "DRAW_CARD"
            : null;
    return {
      id: `${owner}-minion-${Date.now()}-${cardId}`,
      cardId,
      owner,
      art: getCardArt(cardId) ?? "/assets/cards/sunlance-champion.png",
      alt: card.name,
      attack: card.attack ?? 0,
      health: card.health ?? 0,
      maxHealth: card.health ?? 0,
      tribe: card.tribe ?? null,
      canAttack: false,
      summoningSick: true,
      taunt: hasKeyword("Taunt"),
      lifesteal: hasKeyword("Lifesteal"),
      stealth: hasKeyword("Stealth"),
      shield: hasKeyword("Shield"),
      resilient: hasKeyword("Resilient"),
      cloaked: hasKeyword("Cloak"),
      berserkerBuffedThisTurn: false,
      deathrattle,
      onAttackDrainHero: cardId === "VOID_ABYSSBOUND_SPECTER",
    };
  };

  const applyDamageToMinion = (
    minion: MinionInstance,
    amount: number,
    activeTurn: TurnState
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

  const applyHeroDamage = (amount: number, minions: MinionInstance[], currentHealth: number) => {
    const actual = Math.max(0, amount);
    if (actual <= 0) {
      return {
        nextHealth: currentHealth,
        nextMinions: minions,
        actualDamage: 0,
      };
    }
    const nextMinions = minions.map((minion) => {
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
    const nextHealth = Math.max(0, currentHealth - actual);
    return { nextHealth, nextMinions, actualDamage: actual };
  };

  const applyHeroHeal = (currentHealth: number, amount: number) =>
    amount > 0 ? Math.min(30, currentHealth + amount) : currentHealth;

  const handleDeathrattle = (
    dead: MinionInstance,
    playerMinions: MinionInstance[],
    enemyMinions: MinionInstance[]
  ) => {
    let nextPlayer = playerMinions;
    let nextEnemy = enemyMinions;
    const draws = { player: 0, enemy: 0 };
    const friendly = dead.owner === "player" ? nextPlayer : nextEnemy;
    const enemy = dead.owner === "player" ? nextEnemy : nextPlayer;

    if (dead.deathrattle === "WRAITH_BUFF") {
      if (friendly.length === 0) return { nextPlayer, nextEnemy, draws };
      const index = Math.floor(Math.random() * friendly.length);
      const boosted = friendly.map((minion, i) =>
        i === index
          ? {
              ...minion,
              health: minion.health + 1,
              maxHealth: minion.maxHealth + 1,
            }
          : minion
      );
      if (dead.owner === "player") {
        nextPlayer = boosted;
      } else {
        nextEnemy = boosted;
      }
      return { nextPlayer, nextEnemy, draws };
    }
    if (dead.deathrattle === "ROOTSNARL_TREANT") {
      // TODO: Add proper Treant art/registry entry when available.
      const treant: MinionInstance = {
        id: `${dead.owner}-treant-${Date.now()}`,
        cardId: "TOKEN_TREANT",
        owner: dead.owner,
        art: "/assets/cards/beacon-monk.png",
        alt: "Treant",
        attack: 2,
        health: 3,
        maxHealth: 3,
        tribe: "Treant",
        canAttack: false,
        summoningSick: true,
        taunt: true,
        lifesteal: false,
        stealth: false,
        shield: false,
        resilient: false,
        cloaked: false,
        berserkerBuffedThisTurn: false,
        deathrattle: null,
        onAttackDrainHero: false,
      };
      if (dead.owner === "player") {
        nextPlayer = [...friendly, treant];
      } else {
        nextEnemy = [...friendly, treant];
      }
      return { nextPlayer, nextEnemy, draws };
    }
    if (dead.cardId === "GEAR_SPIRE_GEARSPIRE_COLOSSUS") {
      const slots = Math.max(0, 7 - friendly.length);
      if (slots === 0) return { nextPlayer, nextEnemy, draws };
      const constructs: MinionInstance[] = Array.from({ length: Math.min(2, slots) }, (_, i) => ({
        id: `${dead.owner}-construct-${Date.now()}-${i}`,
        cardId: "TOKEN_CONSTRUCT",
        owner: dead.owner,
        art: "/assets/cards/sunlance-champion.png",
        alt: "Construct",
        attack: 2,
        health: 2,
        maxHealth: 2,
        tribe: "Construct",
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
      }));
      if (dead.owner === "player") {
        nextPlayer = [...friendly, ...constructs];
      } else {
        nextEnemy = [...friendly, ...constructs];
      }
      return { nextPlayer, nextEnemy, draws };
    }
    if (dead.deathrattle === "DRAW_CARD") {
      if (dead.owner === "player") {
        draws.player += 1;
      } else {
        draws.enemy += 1;
      }
    }
    return { nextPlayer, nextEnemy, draws };
  };

  const resolveDeaths = (
    playerMinions: MinionInstance[],
    enemyMinions: MinionInstance[]
  ): { player: MinionInstance[]; enemy: MinionInstance[]; draws: { player: number; enemy: number } } => {
    let nextPlayer = playerMinions;
    let nextEnemy = enemyMinions;
    const draws = { player: 0, enemy: 0 };
    const deadPlayer = nextPlayer.filter((minion) => minion.health <= 0);
    const deadEnemy = nextEnemy.filter((minion) => minion.health <= 0);

    nextPlayer = nextPlayer.filter((minion) => minion.health > 0);
    nextEnemy = nextEnemy.filter((minion) => minion.health > 0);

    deadPlayer.forEach((dead) => {
      const result = handleDeathrattle(dead, nextPlayer, nextEnemy);
      nextPlayer = result.nextPlayer;
      nextEnemy = result.nextEnemy;
      draws.player += result.draws.player;
      draws.enemy += result.draws.enemy;
    });

    deadEnemy.forEach((dead) => {
      const result = handleDeathrattle(dead, nextPlayer, nextEnemy);
      nextPlayer = result.nextPlayer;
      nextEnemy = result.nextEnemy;
      draws.player += result.draws.player;
      draws.enemy += result.draws.enemy;
    });

    return { player: nextPlayer, enemy: nextEnemy, draws };
  };

  const applyBattlecry = (
    cardId: string,
    owner: TurnState,
    sourceId: string,
    currentPlayerMinions: MinionInstance[],
    currentEnemyMinions: MinionInstance[]
  ) => {
    let nextPlayer = currentPlayerMinions;
    let nextEnemy = currentEnemyMinions;
    let nextPlayerHealth = playerHealth;
    let nextEnemyHealth = enemyHealth;

    const summonTokenNextToSource = (token: MinionInstance, isPlayer: boolean) => {
      if (isPlayer) {
        if (nextPlayer.length >= 7) return;
        const sourceIndex = nextPlayer.findIndex((minion) => minion.id === sourceId);
        const insertIndex = sourceIndex >= 0 ? sourceIndex + 1 : nextPlayer.length;
        nextPlayer = [...nextPlayer.slice(0, insertIndex), token, ...nextPlayer.slice(insertIndex)];
      } else {
        if (nextEnemy.length >= 7) return;
        const sourceIndex = nextEnemy.findIndex((minion) => minion.id === sourceId);
        const insertIndex = sourceIndex >= 0 ? sourceIndex + 1 : nextEnemy.length;
        nextEnemy = [...nextEnemy.slice(0, insertIndex), token, ...nextEnemy.slice(insertIndex)];
      }
    };

    const healMostDamaged = (minions: MinionInstance[], amount: number) => {
      const damaged = minions.filter((minion) => minion.health < minion.maxHealth);
      if (damaged.length === 0) {
        return minions;
      }
      const target = damaged.reduce((lowest, current) =>
        current.health < lowest.health ? current : lowest
      );
      return minions.map((minion) =>
        minion.id === target.id
          ? { ...minion, health: Math.min(minion.maxHealth, minion.health + amount) }
          : minion
      );
    };

    const applyHeroDamageToOwner = (amount: number) => {
      if (owner === "player") {
        const result = applyHeroDamage(amount, nextPlayer, nextPlayerHealth);
        nextPlayerHealth = result.nextHealth;
        nextPlayer = result.nextMinions;
      } else {
        const result = applyHeroDamage(amount, nextEnemy, nextEnemyHealth);
        nextEnemyHealth = result.nextHealth;
        nextEnemy = result.nextMinions;
      }
    };

    const applyHeroHealToOwner = (amount: number) => {
      if (owner === "player") {
        nextPlayerHealth = applyHeroHeal(nextPlayerHealth, amount);
      } else {
        nextEnemyHealth = applyHeroHeal(nextEnemyHealth, amount);
      }
    };

    const applyVolcanoBlast = () => {
      let anyDied = false;
      nextPlayer = nextPlayer.map((minion) => {
        if (minion.id === sourceId) return minion;
        const result = applyDamageToMinion(minion, 2, owner);
        if (result.next.health <= 0) anyDied = true;
        return result.next;
      });
      nextEnemy = nextEnemy.map((minion) => {
        const result = applyDamageToMinion(minion, 2, owner);
        if (result.next.health <= 0) anyDied = true;
        return result.next;
      });
      const resolved = resolveDeaths(nextPlayer, nextEnemy);
      nextPlayer = resolved.player;
      nextEnemy = resolved.enemy;
      if (resolved.draws.player) drawCards("player", resolved.draws.player);
      if (resolved.draws.enemy) drawCards("enemy", resolved.draws.enemy);
      return anyDied;
    };

    switch (cardId) {
      case "CELESTIAL_CRYSTAL_ACOLYTE":
        applyHeroHealToOwner(2);
        break;
      case "GEAR_SPIRE_SCRAPLING_CREW": {
        const scrapling: MinionInstance = {
          id: `${owner}-scrapling-${Date.now()}`,
          cardId: "TOKEN_SCRAPLING",
          owner,
          art: "/assets/cards/sunlance-champion.png",
          alt: "Scrapling",
          attack: 1,
          health: 1,
          maxHealth: 1,
          tribe: "Construct",
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
        summonTokenNextToSource(scrapling, owner === "player");
        break;
      }
      case "WILD_BATTLEFIELD_MEDIC":
        if (owner === "player") {
          nextPlayer = healMostDamaged(nextPlayer, 2);
          nextPlayerHealth = applyHeroHeal(nextPlayerHealth, 1);
        } else {
          nextEnemy = healMostDamaged(nextEnemy, 2);
          nextEnemyHealth = applyHeroHeal(nextEnemyHealth, 1);
        }
        break;
      case "EMBER_LAVA_IMP":
        applyHeroDamageToOwner(1);
        break;
      case "VOID_DUSK_HERALD":
        applyHeroDamageToOwner(1);
        break;
      case "EMBER_VOLCANO_TITAN": {
        const died = applyVolcanoBlast();
        if (died) {
          applyVolcanoBlast();
        }
        break;
      }
      case "GEAR_SPIRE_IRONHOWL_CANNONEER": {
        nextEnemy = nextEnemy.map((minion) => applyDamageToMinion(minion, 1, owner).next);
        if (owner === "player") {
          const result = applyHeroDamage(1, nextEnemy, nextEnemyHealth);
          nextEnemyHealth = result.nextHealth;
          nextEnemy = result.nextMinions;
        } else {
          const result = applyHeroDamage(1, nextPlayer, nextPlayerHealth);
          nextPlayerHealth = result.nextHealth;
          nextPlayer = result.nextMinions;
        }
      const resolved = resolveDeaths(nextPlayer, nextEnemy);
      nextPlayer = resolved.player;
      nextEnemy = resolved.enemy;
      if (resolved.draws.player) drawCards("player", resolved.draws.player);
      if (resolved.draws.enemy) drawCards("enemy", resolved.draws.enemy);
        break;
      }
      default:
        break;
    }

    return { nextPlayer, nextEnemy, nextPlayerHealth, nextEnemyHealth };
  };

  type SpellTargetType =
    | "NONE"
    | "ENEMY_MINION"
    | "FRIENDLY_MINION"
    | "ANY_MINION"
    | "ENEMY_ANY";

  const getSpellTargetType = (cardId: string): SpellTargetType => {
    switch (cardId) {
      case "VOID_GRASP_OF_NOTHING":
        return "ENEMY_MINION";
      case "VOID_GRAVE_OFFERING":
        return "FRIENDLY_MINION";
      case "VOID_SILENCE_THE_LIGHT":
        return "ANY_MINION";
      case "EMBER_SCORCHING_COMMAND":
        return "ENEMY_ANY";
      case "EMBER_ASHFALL_STRIKE":
        return "ENEMY_MINION";
      case "EMBER_MOLTEN_VERDICT":
        return "ANY_MINION";
      case "EMBER_BURN_THE_WEAK":
        return "ENEMY_MINION";
      default:
        return "NONE";
    }
  };

  const resolveSpell = (
    cardId: string,
    owner: TurnState,
    targetMinion: { id: string; owner: TurnState } | null,
    targetHero: "player-hero" | "enemy-hero" | null
  ) => {
    let nextPlayer = playerMinions;
    let nextEnemy = enemyMinions;
    let nextPlayerHealth = playerHealth;
    let nextEnemyHealth = enemyHealth;
    const draws = { player: 0, enemy: 0 };
    const isEnemyTarget = (ownerId: TurnState, targetOwner: TurnState) =>
      ownerId === "player" ? targetOwner === "enemy" : targetOwner === "player";
    const isFriendlyTarget = (ownerId: TurnState, targetOwner: TurnState) =>
      ownerId === targetOwner;

    const applyDamageToHeroTarget = (targetOwner: TurnState, amount: number) => {
      if (targetOwner === "player") {
        const result = applyHeroDamage(amount, nextPlayer, nextPlayerHealth);
        nextPlayer = result.nextMinions;
        nextPlayerHealth = result.nextHealth;
        return result.actualDamage;
      }
      const result = applyHeroDamage(amount, nextEnemy, nextEnemyHealth);
      nextEnemy = result.nextMinions;
      nextEnemyHealth = result.nextHealth;
      return result.actualDamage;
    };

    const applyHealToHeroTarget = (targetOwner: TurnState, amount: number) => {
      if (targetOwner === "player") {
        nextPlayerHealth = applyHeroHeal(nextPlayerHealth, amount);
      } else {
        nextEnemyHealth = applyHeroHeal(nextEnemyHealth, amount);
      }
    };

    const updateMinion = (ownerId: TurnState, updated: MinionInstance) => {
      if (ownerId === "player") {
        nextPlayer = nextPlayer.map((minion) => (minion.id === updated.id ? updated : minion));
      } else {
        nextEnemy = nextEnemy.map((minion) => (minion.id === updated.id ? updated : minion));
      }
    };

    const applyDamageToMinionTarget = (
      target: { id: string; owner: TurnState },
      amount: number
    ) => {
      const list = target.owner === "player" ? nextPlayer : nextEnemy;
      const minion = list.find((entry) => entry.id === target.id);
      if (!minion) return { died: false };
      const result = applyDamageToMinion(minion, amount, owner);
      updateMinion(target.owner, result.next);
      return { died: result.next.health <= 0 };
    };

    switch (cardId) {
      case "VOID_VOID_TITHE":
        applyDamageToHeroTarget(owner, 1);
        if (owner === "player") draws.player += 1;
        else draws.enemy += 1;
        break;
      case "VOID_GRASP_OF_NOTHING":
        if (!targetMinion || !isEnemyTarget(owner, targetMinion.owner)) return null;
        applyDamageToMinionTarget(targetMinion, 2);
        break;
      case "VOID_SHADOW_RECLAIM":
        applyHealToHeroTarget(owner, 2);
        if (owner === "player") draws.player += 1;
        else draws.enemy += 1;
        break;
      case "VOID_GRAVE_OFFERING": {
        if (!targetMinion || !isFriendlyTarget(owner, targetMinion.owner)) return null;
        const list = targetMinion.owner === "player" ? nextPlayer : nextEnemy;
        const minion = list.find((entry) => entry.id === targetMinion.id);
        if (!minion) return null;
        updateMinion(targetMinion.owner, { ...minion, health: 0 });
        if (owner === "player") draws.player += 2;
        else draws.enemy += 2;
        break;
      }
      case "VOID_SILENCE_THE_LIGHT": {
        if (!targetMinion) return null;
        const list = targetMinion.owner === "player" ? nextPlayer : nextEnemy;
        const minion = list.find((entry) => entry.id === targetMinion.id);
        if (!minion) return null;
        updateMinion(targetMinion.owner, {
          ...minion,
          attack: 1,
          taunt: false,
          lifesteal: false,
          stealth: false,
          shield: false,
          resilient: false,
          cloaked: false,
          onAttackDrainHero: false,
        });
        break;
      }
      case "VOID_ENCROACHING_VOID":
        nextPlayer = nextPlayer.map((minion) => applyDamageToMinion(minion, 1, owner).next);
        nextEnemy = nextEnemy.map((minion) => applyDamageToMinion(minion, 1, owner).next);
        break;
      case "EMBER_SCORCHING_COMMAND":
        if (targetMinion && isEnemyTarget(owner, targetMinion.owner)) {
          applyDamageToMinionTarget(targetMinion, 2);
        } else if (targetHero) {
          applyDamageToHeroTarget(targetHero === "player-hero" ? "player" : "enemy", 2);
        } else {
          return null;
        }
        break;
      case "EMBER_ASHFALL_STRIKE":
        if (!targetMinion || !isEnemyTarget(owner, targetMinion.owner)) return null;
        applyDamageToMinionTarget(targetMinion, 3);
        break;
      case "EMBER_FLAME_SURGE": {
        const targetList = owner === "player" ? nextEnemy : nextPlayer;
        const updated = targetList.map((minion) => applyDamageToMinion(minion, 1, owner).next);
        if (owner === "player") {
          nextEnemy = updated;
        } else {
          nextPlayer = updated;
        }
        break;
      }
      case "EMBER_BATTLE_CRY_OF_EMBERS":
        if (owner === "player") {
          nextPlayer = nextPlayer.map((minion) => ({ ...minion, attack: minion.attack + 1 }));
        } else {
          nextEnemy = nextEnemy.map((minion) => ({ ...minion, attack: minion.attack + 1 }));
        }
        break;
      case "EMBER_MOLTEN_VERDICT": {
        if (!targetMinion) return null;
        const result = applyDamageToMinionTarget(targetMinion, 4);
        if (result.died) {
          if (owner === "player") draws.player += 1;
          else draws.enemy += 1;
        }
        break;
      }
      case "EMBER_BURN_THE_WEAK": {
        if (!targetMinion || !isEnemyTarget(owner, targetMinion.owner)) return null;
        const list = targetMinion.owner === "player" ? nextPlayer : nextEnemy;
        const minion = list.find((entry) => entry.id === targetMinion.id);
        if (!minion || minion.health >= minion.maxHealth) return null;
        const first = applyDamageToMinionTarget(targetMinion, 2);
        const updatedList = targetMinion.owner === "player" ? nextPlayer : nextEnemy;
        const updatedMinion = updatedList.find((entry) => entry.id === targetMinion.id);
        if (updatedMinion && updatedMinion.health > 0) {
          applyDamageToMinionTarget(targetMinion, 1);
        }
        if (first.died) {
          // no extra effect
        }
        break;
      }
      default:
        break;
    }

    const resolved = resolveDeaths(nextPlayer, nextEnemy);
    nextPlayer = resolved.player;
    nextEnemy = resolved.enemy;
    draws.player += resolved.draws.player;
    draws.enemy += resolved.draws.enemy;

    return { nextPlayer, nextEnemy, nextPlayerHealth, nextEnemyHealth, draws };
  };

  const hasTaunt = (minions: MinionInstance[]) =>
    minions.some((minion) => minion.taunt && minion.health > 0);

  const getTargetableMinions = (minions: MinionInstance[]) =>
    minions.filter((minion) => !minion.stealth && !minion.cloaked && minion.health > 0);

  const pickLowestHealth = (minions: MinionInstance[]) => {
    if (minions.length === 0) return null;
    return minions.reduce((lowest, current) =>
      current.health < lowest.health ? current : lowest
    );
  };

  const getEnemyPlayableIndex = () => {
    const targetableEnemy = getTargetableMinions(playerMinions);
    const targetableFriendly = getTargetableMinions(enemyMinions);
    return enemyHand.findIndex((entry) => {
      const cardDef = getCardDef(entry.cardId);
      if (!cardDef || sharedMana < cardDef.cost) return false;
      if (cardDef.type === "MINION") {
        return enemyMinions.length < 7;
      }
      const targetType = getSpellTargetType(entry.cardId);
      if (entry.cardId === "EMBER_BURN_THE_WEAK") {
        return targetableEnemy.some((minion) => minion.health < minion.maxHealth);
      }
      switch (targetType) {
        case "ENEMY_MINION":
          return targetableEnemy.length > 0;
        case "FRIENDLY_MINION":
          return targetableFriendly.length > 0;
        case "ANY_MINION":
          return targetableEnemy.length + targetableFriendly.length > 0;
        case "ENEMY_ANY":
          return true;
        default:
          return true;
      }
    });
  };

  const executePlayerAttack = (
    attackerId: string,
    targetMinionId: string | null,
    targetHero: "enemy-hero" | null
  ) => {
    if (turn !== "player") return;
    if (isGameOver) return;
    const attacker = playerMinions.find((minion) => minion.id === attackerId);
    if (!attacker || !attacker.canAttack || attacker.summoningSick) return;

    const enemyTaunts = hasTaunt(enemyMinions);
    const targetMinion = targetMinionId
      ? enemyMinions.find((minion) => minion.id === targetMinionId)
      : null;

    if (targetHero && enemyTaunts) return;
    if (targetMinion) {
      if (enemyTaunts && !targetMinion.taunt) return;
      if (targetMinion.stealth || targetMinion.cloaked) return;
    }

    let nextPlayer = playerMinions;
    let nextEnemy = enemyMinions;
    let nextPlayerHealth = playerHealth;
    let nextEnemyHealth = enemyHealth;

    const updatePlayerMinion = (updated: MinionInstance) => {
      nextPlayer = nextPlayer.map((minion) => (minion.id === updated.id ? updated : minion));
    };

    const updateEnemyMinion = (updated: MinionInstance) => {
      nextEnemy = nextEnemy.map((minion) => (minion.id === updated.id ? updated : minion));
    };

    if (targetHero) {
      const result = applyHeroDamage(attacker.attack, nextEnemy, nextEnemyHealth);
      nextEnemy = result.nextMinions;
      nextEnemyHealth = result.nextHealth;
      if (attacker.lifesteal) {
        nextPlayerHealth = applyHeroHeal(nextPlayerHealth, result.actualDamage);
      }
      if (attacker.onAttackDrainHero) {
        const drain = applyHeroDamage(1, nextEnemy, nextEnemyHealth);
        nextEnemy = drain.nextMinions;
        nextEnemyHealth = drain.nextHealth;
        nextPlayerHealth = applyHeroHeal(nextPlayerHealth, drain.actualDamage);
      }
      updatePlayerMinion({
        ...attacker,
        canAttack: false,
        stealth: false,
      });
    } else if (targetMinion) {
      const attackerResult = applyDamageToMinion(attacker, targetMinion.attack, turn);
      const targetResult = applyDamageToMinion(targetMinion, attacker.attack, turn);

      updatePlayerMinion({
        ...attackerResult.next,
        canAttack: false,
        stealth: false,
      });
      updateEnemyMinion(targetResult.next);

      if (attacker.lifesteal) {
        nextPlayerHealth = applyHeroHeal(nextPlayerHealth, targetResult.actualDamage);
      }
      if (targetMinion.lifesteal) {
        nextEnemyHealth = applyHeroHeal(nextEnemyHealth, attackerResult.actualDamage);
      }
      if (attacker.onAttackDrainHero) {
        const drain = applyHeroDamage(1, nextEnemy, nextEnemyHealth);
        nextEnemy = drain.nextMinions;
        nextEnemyHealth = drain.nextHealth;
        nextPlayerHealth = applyHeroHeal(nextPlayerHealth, drain.actualDamage);
      }
    }

    const resolved = resolveDeaths(nextPlayer, nextEnemy);
    nextPlayer = resolved.player;
    nextEnemy = resolved.enemy;
    if (resolved.draws.player) drawCards("player", resolved.draws.player);
    if (resolved.draws.enemy) drawCards("enemy", resolved.draws.enemy);

    setPlayerMinions(nextPlayer);
    setEnemyMinions(nextEnemy);
    setPlayerHealth(nextPlayerHealth);
    setEnemyHealth(nextEnemyHealth);
  };

  const getPlayerAttackContext = (
    attackerId: string,
    targetMinionId: string | null,
    targetHero: "enemy-hero" | null
  ): { attacker: MinionInstance; targetMinion: MinionInstance | null } | null => {
    if (turn !== "player") return;
    if (isGameOver) return;
    const attacker = playerMinions.find((minion) => minion.id === attackerId);
    if (!attacker || !attacker.canAttack || attacker.summoningSick) return;

    const enemyTaunts = hasTaunt(enemyMinions);
    const targetMinion = targetMinionId
      ? enemyMinions.find((minion) => minion.id === targetMinionId)
      : null;

    if (targetHero && enemyTaunts) return;
    if (targetMinion) {
      if (enemyTaunts && !targetMinion.taunt) return;
      if (targetMinion.stealth || targetMinion.cloaked) return;
    } else {
      if (!targetHero) return;
    }
    return { attacker, targetMinion };
  };

  const queuePlayerAttack = (
    attackerId: string,
    targetMinionId: string | null,
    targetHero: "enemy-hero" | null
  ) => {
    const context = getPlayerAttackContext(attackerId, targetMinionId, targetHero);
    if (!context) return;
    const visualId =
      targetHero || context.targetMinion
        ? spawnAttackVisual(
            context.attacker,
            context.targetMinion ? context.targetMinion.id : null,
            targetHero
          )
        : null;
    if (!visualId) return;
    pendingAttackRef.current = {
      visualId,
      owner: "player",
      attackerId,
      targetMinionId,
      targetHero,
    };
  };

  const executeEnemyAttack = (
    attackerId: string,
    targetMinionId: string | null,
    targetHero: "player-hero" | null
  ) => {
    if (turn !== "enemy") return;
    if (isGameOver) return;
    const attacker = enemyMinions.find((minion) => minion.id === attackerId);
    if (!attacker || !attacker.canAttack || attacker.summoningSick) return;

    const playerTaunts = hasTaunt(playerMinions);
    const targetMinion = targetMinionId
      ? playerMinions.find((minion) => minion.id === targetMinionId)
      : null;

    if (targetHero && playerTaunts) return;
    if (targetMinion) {
      if (playerTaunts && !targetMinion.taunt) return;
      if (targetMinion.stealth || targetMinion.cloaked) return;
    }

    let nextPlayer = playerMinions;
    let nextEnemy = enemyMinions;
    let nextPlayerHealth = playerHealth;
    let nextEnemyHealth = enemyHealth;

    const updatePlayerMinion = (updated: MinionInstance) => {
      nextPlayer = nextPlayer.map((minion) => (minion.id === updated.id ? updated : minion));
    };

    const updateEnemyMinion = (updated: MinionInstance) => {
      nextEnemy = nextEnemy.map((minion) => (minion.id === updated.id ? updated : minion));
    };

    if (targetHero) {
      const result = applyHeroDamage(attacker.attack, nextPlayer, nextPlayerHealth);
      nextPlayer = result.nextMinions;
      nextPlayerHealth = result.nextHealth;
      if (attacker.lifesteal) {
        nextEnemyHealth = applyHeroHeal(nextEnemyHealth, result.actualDamage);
      }
      if (attacker.onAttackDrainHero) {
        const drain = applyHeroDamage(1, nextPlayer, nextPlayerHealth);
        nextPlayer = drain.nextMinions;
        nextPlayerHealth = drain.nextHealth;
        nextEnemyHealth = applyHeroHeal(nextEnemyHealth, drain.actualDamage);
      }
      updateEnemyMinion({
        ...attacker,
        canAttack: false,
        stealth: false,
      });
    } else if (targetMinion) {
      const attackerResult = applyDamageToMinion(attacker, targetMinion.attack, turn);
      const targetResult = applyDamageToMinion(targetMinion, attacker.attack, turn);

      updateEnemyMinion({
        ...attackerResult.next,
        canAttack: false,
        stealth: false,
      });
      updatePlayerMinion(targetResult.next);

      if (attacker.lifesteal) {
        nextEnemyHealth = applyHeroHeal(nextEnemyHealth, targetResult.actualDamage);
      }
      if (targetMinion.lifesteal) {
        nextPlayerHealth = applyHeroHeal(nextPlayerHealth, attackerResult.actualDamage);
      }
      if (attacker.onAttackDrainHero) {
        const drain = applyHeroDamage(1, nextPlayer, nextPlayerHealth);
        nextPlayer = drain.nextMinions;
        nextPlayerHealth = drain.nextHealth;
        nextEnemyHealth = applyHeroHeal(nextEnemyHealth, drain.actualDamage);
      }
    }

    const resolved = resolveDeaths(nextPlayer, nextEnemy);
    nextPlayer = resolved.player;
    nextEnemy = resolved.enemy;
    if (resolved.draws.player) drawCards("player", resolved.draws.player);
    if (resolved.draws.enemy) drawCards("enemy", resolved.draws.enemy);

    setEnemyMinions(nextEnemy);
    setPlayerMinions(nextPlayer);
    setEnemyHealth(nextEnemyHealth);
    setPlayerHealth(nextPlayerHealth);
  };

  const getEnemyAttackContext = (
    attackerId: string,
    targetMinionId: string | null,
    targetHero: "player-hero" | null
  ): { attacker: MinionInstance; targetMinion: MinionInstance | null } | null => {
    if (turn !== "enemy") return;
    if (isGameOver) return;
    const attacker = enemyMinions.find((minion) => minion.id === attackerId);
    if (!attacker || !attacker.canAttack || attacker.summoningSick) return;

    const playerTaunts = hasTaunt(playerMinions);
    const targetMinion = targetMinionId
      ? playerMinions.find((minion) => minion.id === targetMinionId)
      : null;

    if (targetHero && playerTaunts) return;
    if (targetMinion) {
      if (playerTaunts && !targetMinion.taunt) return;
      if (targetMinion.stealth || targetMinion.cloaked) return;
    } else {
      if (!targetHero) return;
    }

    return { attacker, targetMinion };
  };

  const queueEnemyAttack = (
    attackerId: string,
    targetMinionId: string | null,
    targetHero: "player-hero" | null
  ) => {
    const context = getEnemyAttackContext(attackerId, targetMinionId, targetHero);
    if (!context) return;
    const visualId =
      targetHero || context.targetMinion
        ? spawnAttackVisual(
            context.attacker,
            context.targetMinion ? context.targetMinion.id : null,
            targetHero
          )
        : null;
    if (!visualId) return;
    pendingAttackRef.current = {
      visualId,
      owner: "enemy",
      attackerId,
      targetMinionId,
      targetHero,
    };
  };
  const getLaneSlots = (lane: LaneConfig, count: number) => {
    const clamped = Math.max(1, count);
    const gap = 6;
    const groupWidth = clamped * minionSize + (clamped - 1) * gap;
    const startX = lane.left + Math.round((lane.width - groupWidth) / 2);
    const y = lane.top + Math.round((lane.height - minionSize) / 2);
    return Array.from({ length: clamped }, (_, index) => ({
      x: startX + index * (minionSize + gap),
      y,
    }));
  };

  const isCursorInPlayerLane =
    cursor.x >= playerLane.left &&
    cursor.x <= playerLane.left + playerLane.width &&
    cursor.y >= playerLane.top &&
    cursor.y <= playerLane.top + playerLane.height;

  const getInsertionIndex = () => {
    if (!draggingId || !isCursorInPlayerLane || playerMinions.length >= 7) return null;
    const slots = getLaneSlots(playerLane, playerMinions.length + 1);
    let bestIndex = 0;
    let bestDistance = Infinity;
    slots.forEach((slot, index) => {
      const centerX = slot.x + minionSize / 2;
      const distance = Math.abs(cursor.x - centerX);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  };

  const insertionIndex = getInsertionIndex();

  const layoutPlayerMinions = (minions: MinionInstance[]) => {
    if (insertionIndex === null) {
      const slots = getLaneSlots(playerLane, Math.max(1, minions.length));
      return minions.map((minion, index) => ({ ...minion, slot: slots[index] }));
    }
    const slots = getLaneSlots(playerLane, minions.length + 1);
    return minions.map((minion, index) => {
      const slotIndex = index < insertionIndex ? index : index + 1;
      return { ...minion, slot: slots[slotIndex] };
    });
  };

  const layoutEnemyMinions = (minions: MinionInstance[]) => {
    const slots = getLaneSlots(enemyLane, Math.max(1, minions.length));
    return minions.map((minion, index) => ({ ...minion, slot: slots[index] }));
  };

  const spawnAttackVisual = (
    attacker: MinionInstance,
    targetMinionId: string | null,
    targetHero: "player-hero" | "enemy-hero" | null
  ) => {
    const startCenter =
      playerMinionCenters[attacker.id] ?? enemyMinionCenters[attacker.id];
    if (!startCenter) return;
    let targetCenter: { x: number; y: number } | null = null;
    if (targetMinionId) {
      targetCenter = playerMinionCenters[targetMinionId] ?? enemyMinionCenters[targetMinionId];
    } else if (targetHero === "enemy-hero") {
      targetCenter = enemyHeroCenter;
    } else if (targetHero === "player-hero") {
      targetCenter = playerHeroCenter;
    }
    if (!targetCenter) return;
    const end = {
      x: targetCenter.x - minionSize / 2,
      y: targetCenter.y - minionSize / 2,
    };
    const start = {
      x: startCenter.x - minionSize / 2,
      y: startCenter.y - minionSize / 2,
    };
    const visualId = `attack-${attacker.id}-${Date.now()}`;
    setAttackVisual({
      id: visualId,
      art: attacker.art,
      alt: attacker.alt,
      attack: attacker.attack,
      health: attacker.health,
      start,
      end,
      startTime: performance.now(),
      durationMs: attackDelayMs,
    });
    setAttackVisualPos(start);
    return visualId;
  };

  const getEnemyHandSlot = (index: number) => ({
    x: BoardSlots.EnemyHand.x + index * 105,
    y: BoardSlots.EnemyHand.y,
  });

  useEffect(() => {
    if (!draggingId) return;
    const handlePointerUp = () => {
      const dragged = handCards.find((card) => card.id === draggingId);
      if (dragged && turn === "player") {
        const cardDef = getCardDef(dragged.cardId);
        const canAfford = cardDef?.cost !== undefined && sharedMana >= cardDef.cost;
        const isMinion = cardDef?.type === "MINION";
        if (
          isMinion &&
          canAfford &&
          isCursorInPlayerLane &&
          playerMinions.length < 7 &&
          insertionIndex !== null
        ) {
          const newMinion = createMinionFromCard(dragged.cardId, "player");
          if (!newMinion) {
            setDraggingId(null);
            return;
          }
          let nextPlayer = [...playerMinions];
          nextPlayer.splice(insertionIndex, 0, newMinion);
          let nextEnemy = [...enemyMinions];
          const battlecryResult = applyBattlecry(
            dragged.cardId,
            "player",
            newMinion.id,
            nextPlayer,
            nextEnemy
          );
          nextPlayer = battlecryResult.nextPlayer;
          nextEnemy = battlecryResult.nextEnemy;
          setPlayerMinions(nextPlayer);
          setEnemyMinions(nextEnemy);
          setPlayerHealth(battlecryResult.nextPlayerHealth);
          setEnemyHealth(battlecryResult.nextEnemyHealth);
          setSharedMana((prev) => Math.max(0, prev - (cardDef.cost ?? 0)));
          setHandCards((prev) => {
            const filtered = prev.filter((card) => card.id !== draggingId);
            if (
              dragged.cardId !== "WILD_NOMAD_TRADER" ||
              filtered.length === 0 ||
              playerDeckIds.length === 0
            ) {
              return filtered;
            }
            const replaceIndex = Math.floor(Math.random() * filtered.length);
            const randomCardId = playerDeckIds[Math.floor(Math.random() * playerDeckIds.length)];
            return filtered.map((card, index) =>
              index === replaceIndex
                ? {
                    ...card,
                    id: `${card.id}-swap-${Date.now()}`,
                    cardId: randomCardId,
                  }
                : card
            );
          });
        }
      }
      setDraggingId(null);
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [
    cursor.x,
    cursor.y,
    draggingId,
    handCards,
    insertionIndex,
    isCursorInPlayerLane,
    playerMinions,
    enemyMinions,
    sharedMana,
    turn,
    playerDeckIds,
  ]);

  const handleDragStart = (id: string, slotX: number, slotY: number) => {
    if (isGameOver) return;
    if (turn !== "player") return;
    const card = handCards.find((entry) => entry.id === id);
    if (!card) return;
    const cardDef = getCardDef(card.cardId);
    if (!cardDef || cardDef.type !== "MINION") return;
    if (sharedMana < cardDef.cost) return;
    setDraggingId(id);
    setDragOffset({ x: cursor.x - slotX, y: cursor.y - slotY });
  };

  const clearSpellTargeting = () => {
    setSpellTargetingFrom(null);
    setSpellTargetingToMinion(null);
    setSpellTargetingToHero(null);
  };

  const castPlayerSpell = (
    cardId: string,
    handId: string,
    targetMinion: { id: string; owner: TurnState } | null,
    targetHero: "player-hero" | "enemy-hero" | null
  ) => {
    const cardDef = getCardDef(cardId);
    if (!cardDef || cardDef.type !== "SPELL") return;
    const result = resolveSpell(cardId, "player", targetMinion, targetHero);
    if (!result) return;
    setPlayerMinions(result.nextPlayer);
    setEnemyMinions(result.nextEnemy);
    setPlayerHealth(result.nextPlayerHealth);
    setEnemyHealth(result.nextEnemyHealth);
    if (result.draws.player) drawCards("player", result.draws.player, -1);
    if (result.draws.enemy) drawCards("enemy", result.draws.enemy);
    setSharedMana((prev) => Math.max(0, prev - cardDef.cost));
    setHandCards((prev) => prev.filter((card) => card.id !== handId));
  };

  const handleSpellActivate = (card: HandCardData) => {
    if (isGameOver) return;
    if (turn !== "player") return;
    if (spellTargetingFrom || targetingFrom) return;
    const cardDef = getCardDef(card.cardId);
    if (!cardDef || cardDef.type !== "SPELL") return;
    if (sharedMana < cardDef.cost) return;
    const targetType = getSpellTargetType(card.cardId);
    if (targetType === "NONE") {
      castPlayerSpell(card.cardId, card.id, null, null);
      return;
    }
    if (targetType === "ENEMY_MINION" && getTargetableMinions(enemyMinions).length === 0) {
      return;
    }
    if (targetType === "FRIENDLY_MINION" && getTargetableMinions(playerMinions).length === 0) {
      return;
    }
    if (
      targetType === "ANY_MINION" &&
      getTargetableMinions(playerMinions).length + getTargetableMinions(enemyMinions).length === 0
    ) {
      return;
    }
    setSpellTargetingFrom({
      cardId: card.cardId,
      handId: card.id,
      x: card.slot.x + 90,
      y: card.slot.y + 120,
    });
  };

  const handlePlayerHeroPower = () => {
    if (isGameOver) return;
    if (turn !== "player") return;
    if (playerHeroPowerUsed) return;
    if (sharedMana < playerHeroPower.cost) return;
    setPlayerHeroPowerUsed(true);
    setSharedMana((prev) => Math.max(0, prev - playerHeroPower.cost));
    const result = applyHeroDamage(1, playerMinions, playerHealth);
    setPlayerMinions(result.nextMinions);
    setPlayerHealth(result.nextHealth);
    drawCards("player", 1);
  };

  useEffect(() => {
    if (!spellTargetingFrom) return;
    const handlePointerUp = () => {
      if (isGameOver) {
        clearSpellTargeting();
        return;
      }
      const targetHero = spellTargetingToHero?.id ?? null;
      castPlayerSpell(
        spellTargetingFrom.cardId,
        spellTargetingFrom.handId,
        spellTargetingToMinion,
        targetHero
      );
      clearSpellTargeting();
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [isGameOver, spellTargetingFrom, spellTargetingToHero, spellTargetingToMinion]);

  const getHandSlot = (id: string, slotX: number, slotY: number) => {
    if (draggingId === id) {
      return { x: cursor.x - dragOffset.x, y: cursor.y - dragOffset.y };
    }
    return { x: slotX, y: slotY };
  };

  const layoutHand = (cards: HandCardData[]) => {
    const count = Math.max(1, cards.length);
    const shouldFan = cards.length > 1;
    const gap = 120;
    const groupWidth = count * 180 + (count - 1) * (gap - 180);
    const startX = BoardSlots.Hand.x + Math.round((5 * 180 + 4 * (gap - 180) - groupWidth) / 2);
    return cards.map((card, index) => {
      const x = startX + index * gap;
      const y = BoardSlots.Hand.y + (shouldFan ? (index === 0 || index === count - 1 ? 12 : index === 1 || index === count - 2 ? 6 : 0) : 0);
      const rotation = shouldFan ? (index === 0 ? -12 : index === 1 ? -6 : index === count - 1 ? 12 : index === count - 2 ? 6 : 0) : 0;
      return { ...card, slot: { x, y }, rotation };
    });
  };

  const draggingCard = draggingId ? handCards.find((card) => card.id === draggingId) : null;
  const playerMinionLayout = layoutPlayerMinions(playerMinions);
  const ghostSlot =
    insertionIndex !== null ? getLaneSlots(playerLane, playerMinions.length + 1)[insertionIndex] : null;
  const enemyMinionLayout = layoutEnemyMinions(enemyMinions);
  const minionBounds = useMemo(() => {
    const bounds = new Map<string, { x: number; y: number; width: number; height: number }>();
    playerMinionLayout.forEach((minion) => {
      bounds.set(minion.id, {
        x: minion.slot.x,
        y: minion.slot.y,
        width: minionSize,
        height: minionSize,
      });
    });
    enemyMinionLayout.forEach((minion) => {
      bounds.set(minion.id, {
        x: minion.slot.x,
        y: minion.slot.y,
        width: minionSize,
        height: minionSize,
      });
    });
    return bounds;
  }, [enemyMinionLayout, minionSize, playerMinionLayout]);
  const isVoidFxEnabled = true;
  const handleGraveyardBurstComplete = useCallback((id: string) => {
    setGraveyardBursts((prev) => prev.filter((burst) => burst.id !== id));
  }, []);

  useEffect(() => {
    const prevPlayerIds = prevMinionIdsRef.current.player;
    const prevEnemyIds = prevMinionIdsRef.current.enemy;
    const currentPlayerIds = new Set(playerMinions.map((minion) => minion.id));
    const currentEnemyIds = new Set(enemyMinions.map((minion) => minion.id));

    if (isVoidFxEnabled) {
      const nextBursts: GraveyardBurst[] = [];
      prevPlayerIds.forEach((id) => {
        if (!currentPlayerIds.has(id)) {
          const bounds = prevMinionBoundsRef.current.get(id);
          if (bounds) {
            nextBursts.push({
              id: `graveyard-${id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              bounds,
            });
          }
        }
      });
      prevEnemyIds.forEach((id) => {
        if (!currentEnemyIds.has(id)) {
          const bounds = prevMinionBoundsRef.current.get(id);
          if (bounds) {
            nextBursts.push({
              id: `graveyard-${id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              bounds,
            });
          }
        }
      });
      if (nextBursts.length > 0) {
        setGraveyardBursts((prev) => [...prev, ...nextBursts]);
      }
    }

    prevMinionIdsRef.current = { player: currentPlayerIds, enemy: currentEnemyIds };
    prevMinionBoundsRef.current = minionBounds;
  }, [enemyMinions, isVoidFxEnabled, minionBounds, playerMinions]);

  useEffect(() => {
    if (isGameOver) return;
    const clearTurnTimeout = () => {
      if (turnTimeoutRef.current !== null) {
        window.clearTimeout(turnTimeoutRef.current);
        turnTimeoutRef.current = null;
      }
    };

    clearTurnTimeout();

    const duration = turn === "player" ? 50000 : 10000;
    const endAt = performance.now() + duration;
    setTurnTimeLeftMs(duration);

    const tick = () => {
      const remaining = Math.max(0, Math.ceil(endAt - performance.now()));
      setTurnTimeLeftMs(remaining);
    };

    const intervalId = window.setInterval(tick, 250);
    turnTimeoutRef.current = window.setTimeout(() => {
      setTurn((prev) => (prev === "player" ? "enemy" : "player"));
    }, duration);

    return () => {
      clearTurnTimeout();
      window.clearInterval(intervalId);
    };
  }, [isGameOver, turn]);

  useEffect(() => {
    if (isGameOver) return;
    const prevTurn = prevTurnRef.current;
    if (prevTurn === "player" && turn === "enemy") {
      roundPendingRef.current = true;
    }
    if (prevTurn === "enemy" && turn === "player" && roundPendingRef.current) {
      setSharedMaxMana((prev) => {
        const next = Math.min(10, prev + 1);
        setSharedMana(next);
        return next;
      });
      roundPendingRef.current = false;
    }
    if (prevTurn && prevTurn !== turn) {
      const bonus = turn === "enemy" && enemyBonusManaNextTurn ? 1 : 0;
      setSharedMana(Math.min(10, sharedMaxMana + bonus));
      if (turn === "enemy" && enemyBonusManaNextTurn) {
        setEnemyBonusManaNextTurn(false);
      }
    }
    if (prevTurn === "enemy" && turn === "player") {
      setPlayerHeroPowerUsed(false);
      setPlayerMinions((prev) =>
        prev.map((minion) => ({
          ...minion,
          canAttack: !minion.summoningSick,
          summoningSick: false,
          berserkerBuffedThisTurn: false,
          cloaked: false,
        }))
      );
      setHandCards((prev) => {
        if (prev.length >= maxHandSize) return prev;
        const nextCardId = playerDeckIds[playerDrawIndex % playerDeckIds.length];
        const nextId = `hand-${Date.now()}-${playerDrawIndex}`;
        setPlayerDrawIndex((index) => index + 1);
        return [
          ...prev,
          {
            id: nextId,
            cardId: nextCardId,
            slot: prev[0]?.slot ?? { x: BoardSlots.Hand.x, y: BoardSlots.Hand.y },
            rotation: 0,
          },
        ];
      });
    }
    if (prevTurn === "player" && turn === "enemy") {
      setEnemyHeroPowerUsed(false);
      setEnemyMinions((prev) =>
        prev.map((minion) => ({
          ...minion,
          canAttack: !minion.summoningSick,
          summoningSick: false,
          berserkerBuffedThisTurn: false,
          cloaked: false,
        }))
      );
      setEnemyHand((prev) => {
        if (prev.length >= maxHandSize) return prev;
        const nextCardId = enemyDeckIds[enemyDrawIndex % enemyDeckIds.length];
        const nextId = `enemy-${Date.now()}-${enemyDrawIndex}`;
        setEnemyDrawIndex((index) => index + 1);
        return [
          ...prev,
          {
            id: nextId,
            cardId: nextCardId,
            slot: { x: BoardSlots.Hand.x, y: BoardSlots.Hand.y },
            rotation: 0,
          },
        ];
      });
    }
    prevTurnRef.current = turn;
  }, [
    enemyDeckIds,
    enemyDrawIndex,
    isGameOver,
    maxHandSize,
    playerDeckIds,
    playerDrawIndex,
    sharedMaxMana,
    enemyBonusManaNextTurn,
    turn,
  ]);


  useEffect(() => {
    if (turn !== "enemy") return;
    if (isGameOver) return;
    if (enemyHand.length === 0 || enemyDrag) return;
    const playTimeout = window.setTimeout(() => {
      const playableIndex = getEnemyPlayableIndex();

      if (playableIndex === -1) return;
      const card = enemyHand[playableIndex];
      const cardDef = getCardDef(card.cardId);
      if (!cardDef) return;

      if (cardDef.type === "MINION") {
        const newMinion = createMinionFromCard(card.cardId, "enemy");
        if (!newMinion) return;
        const start = getEnemyHandSlot(playableIndex);
        const targetSlots = getLaneSlots(enemyLane, enemyMinions.length + 1);
        const target = targetSlots[enemyMinions.length];
        const end = {
          x: target.x + (minionSize - enemyCardBackSize.width) / 2,
          y: target.y + (minionSize - enemyCardBackSize.height) / 2,
        };
        setEnemyHand((prev) => {
          const filtered = prev.filter((entry) => entry.id !== card.id);
          if (
            card.cardId !== "WILD_NOMAD_TRADER" ||
            filtered.length === 0 ||
            enemyDeckIds.length === 0
          ) {
            return filtered;
          }
          const replaceIndex = Math.floor(Math.random() * filtered.length);
          const randomCardId = enemyDeckIds[Math.floor(Math.random() * enemyDeckIds.length)];
          return filtered.map((entry, index) =>
            index === replaceIndex
              ? {
                  ...entry,
                  id: `${entry.id}-swap-${Date.now()}`,
                  cardId: randomCardId,
                }
              : entry
          );
        });
        setSharedMana((prev) => Math.max(0, prev - cardDef.cost));
        setEnemyDrag({
          id: `enemy-drag-${Date.now()}`,
          minion: newMinion,
          art: newMinion.art,
          alt: cardDef.name,
          attack: newMinion.attack,
          health: newMinion.health,
          start,
          end,
          startTime: performance.now(),
          durationMs: 700,
        });
        setEnemyDragPos(start);
        const battlecryResult = applyBattlecry(
          card.cardId,
          "enemy",
          newMinion.id,
          playerMinions,
          enemyMinions
        );
        setPlayerMinions(battlecryResult.nextPlayer);
        setEnemyMinions(battlecryResult.nextEnemy);
        setPlayerHealth(battlecryResult.nextPlayerHealth);
        setEnemyHealth(battlecryResult.nextEnemyHealth);
        return;
      }

      const targetableEnemy = getTargetableMinions(playerMinions);
      const targetableFriendly = getTargetableMinions(enemyMinions);
      const targetType = getSpellTargetType(card.cardId);
      let targetMinion: { id: string; owner: TurnState } | null = null;
      let targetHero: "player-hero" | "enemy-hero" | null = null;

      if (targetType === "ENEMY_MINION") {
        let candidates = targetableEnemy;
        if (card.cardId === "EMBER_BURN_THE_WEAK") {
          candidates = candidates.filter((minion) => minion.health < minion.maxHealth);
        }
        const target = pickLowestHealth(candidates);
        if (!target) return;
        targetMinion = { id: target.id, owner: "player" };
      } else if (targetType === "FRIENDLY_MINION") {
        const target = pickLowestHealth(targetableFriendly);
        if (!target) return;
        targetMinion = { id: target.id, owner: "enemy" };
      } else if (targetType === "ANY_MINION") {
        const enemyTarget = pickLowestHealth(targetableEnemy);
        const friendlyTarget = pickLowestHealth(targetableFriendly);
        if (enemyTarget && friendlyTarget) {
          targetMinion =
            enemyTarget.health <= friendlyTarget.health
              ? { id: enemyTarget.id, owner: "player" }
              : { id: friendlyTarget.id, owner: "enemy" };
        } else if (enemyTarget) {
          targetMinion = { id: enemyTarget.id, owner: "player" };
        } else if (friendlyTarget) {
          targetMinion = { id: friendlyTarget.id, owner: "enemy" };
        }
      } else if (targetType === "ENEMY_ANY") {
        const enemyTarget = pickLowestHealth(targetableEnemy);
        if (enemyTarget) {
          targetMinion = { id: enemyTarget.id, owner: "player" };
        } else {
          targetHero = "player-hero";
        }
      }

      const result = resolveSpell(card.cardId, "enemy", targetMinion, targetHero);
      if (!result) return;
      setPlayerMinions(result.nextPlayer);
      setEnemyMinions(result.nextEnemy);
      setPlayerHealth(result.nextPlayerHealth);
      setEnemyHealth(result.nextEnemyHealth);
      if (result.draws.player) drawCards("player", result.draws.player);
      if (result.draws.enemy) drawCards("enemy", result.draws.enemy, -1);
      setEnemyHand((prev) => prev.filter((entry) => entry.id !== card.id));
      setSharedMana((prev) => Math.max(0, prev - cardDef.cost));
    }, 2500);
    return () => window.clearTimeout(playTimeout);
  }, [
    enemyDeckIds,
    enemyDrag,
    enemyHand,
    enemyMinions,
    isGameOver,
    playerMinions,
    sharedMana,
    turn,
  ]);

  useEffect(() => {
    if (turn !== "enemy") return;
    if (isGameOver) return;
    if (enemyHeroPowerUsed) return;
    if (sharedMana < enemyHeroPower.cost) return;
    const powerTimeout = window.setTimeout(() => {
      let nextPlayer = playerMinions;
      let nextEnemy = enemyMinions;
      let nextPlayerHealth = playerHealth;
      let nextEnemyHealth = enemyHealth;
      let bonusMana = false;

      const targetableEnemy = getTargetableMinions(playerMinions);
      const target = pickLowestHealth(targetableEnemy);

      if (target) {
        const result = applyDamageToMinion(target, 1, "enemy");
        nextPlayer = nextPlayer.map((minion) =>
          minion.id === target.id ? result.next : minion
        );
        if (result.next.health <= 0) {
          bonusMana = true;
        }
      } else {
        const result = applyHeroDamage(1, nextPlayer, nextPlayerHealth);
        nextPlayer = result.nextMinions;
        nextPlayerHealth = result.nextHealth;
      }

      const resolved = resolveDeaths(nextPlayer, nextEnemy);
      nextPlayer = resolved.player;
      nextEnemy = resolved.enemy;
      if (resolved.draws.player) drawCards("player", resolved.draws.player);
      if (resolved.draws.enemy) drawCards("enemy", resolved.draws.enemy);

      setPlayerMinions(nextPlayer);
      setEnemyMinions(nextEnemy);
      setPlayerHealth(nextPlayerHealth);
      setEnemyHealth(nextEnemyHealth);
      if (bonusMana) {
        setEnemyBonusManaNextTurn(true);
      }
      setEnemyHeroPowerUsed(true);
      setSharedMana((prev) => Math.max(0, prev - enemyHeroPower.cost));
    }, 1800);

    return () => window.clearTimeout(powerTimeout);
  }, [
    enemyHeroPower.cost,
    enemyHeroPowerUsed,
    enemyMinions,
    enemyHealth,
    isGameOver,
    playerMinions,
    playerHealth,
    sharedMana,
    turn,
  ]);

  useEffect(() => {
    if (enemyAttackTimerRef.current !== null) {
      window.clearTimeout(enemyAttackTimerRef.current);
      enemyAttackTimerRef.current = null;
    }
    if (turn !== "enemy") return;
    if (isGameOver) return;
    const attackers = enemyMinions.filter((minion) => minion.canAttack && !minion.summoningSick);
    if (attackers.length === 0) {
      const hasSpellPlay = getEnemyPlayableIndex() !== -1;
      const canUseHeroPower = !enemyHeroPowerUsed && sharedMana >= enemyHeroPower.cost;
      if (!hasSpellPlay && !canUseHeroPower && !enemyDrag && !attackVisual) {
        setTurn("player");
      }
      return;
    }

    enemyAttackTimerRef.current = window.setTimeout(() => {
      const currentAttacker = enemyMinions.find(
        (minion) => minion.canAttack && !minion.summoningSick
      );
      if (!currentAttacker) return;
      const taunts = playerMinions.filter(
        (minion) => minion.taunt && !minion.stealth && !minion.cloaked && minion.health > 0
      );
      const eligible = (taunts.length > 0 ? taunts : playerMinions).filter(
        (minion) => !minion.stealth && !minion.cloaked && minion.health > 0
      );
      if (eligible.length > 0) {
        const target = eligible[Math.floor(Math.random() * eligible.length)];
        queueEnemyAttack(currentAttacker.id, target.id, null);
      } else {
        queueEnemyAttack(currentAttacker.id, null, "player-hero");
      }
    }, 1200);

    return () => {
      if (enemyAttackTimerRef.current !== null) {
        window.clearTimeout(enemyAttackTimerRef.current);
        enemyAttackTimerRef.current = null;
      }
    };
  }, [
    attackVisual,
    enemyHand,
    enemyHeroPower.cost,
    enemyHeroPowerUsed,
    enemyMinions,
    isGameOver,
    playerMinions,
    sharedMana,
    turn,
  ]);


  useEffect(() => {
    if (!enemyDrag) return;

    const animate = (time: number) => {
      const elapsed = time - enemyDrag.startTime;
      const t = Math.min(1, elapsed / enemyDrag.durationMs);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = enemyDrag.start.x + (enemyDrag.end.x - enemyDrag.start.x) * eased;
      const y = enemyDrag.start.y + (enemyDrag.end.y - enemyDrag.start.y) * eased;
      setEnemyDragPos({ x, y });

      if (t < 1) {
        enemyDragFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        setEnemyMinions((prev) => [...prev, enemyDrag.minion]);
        setEnemyDrag(null);
        setEnemyDragPos(null);
      }
    };

    enemyDragFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (enemyDragFrameRef.current !== null) {
        window.cancelAnimationFrame(enemyDragFrameRef.current);
        enemyDragFrameRef.current = null;
      }
    };
  }, [enemyDrag]);

  useEffect(() => {
    if (!attackVisual) return;
    if (attackVisualFrameRef.current !== null) {
      window.cancelAnimationFrame(attackVisualFrameRef.current);
      attackVisualFrameRef.current = null;
    }

    const animate = (time: number) => {
      const elapsed = time - attackVisual.startTime;
      const t = Math.min(1, elapsed / attackVisual.durationMs);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = attackVisual.start.x + (attackVisual.end.x - attackVisual.start.x) * eased;
      const y = attackVisual.start.y + (attackVisual.end.y - attackVisual.start.y) * eased;
      setAttackVisualPos({ x, y });

      if (t < 1) {
        attackVisualFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        const pending = pendingAttackRef.current;
        if (pending && pending.visualId === attackVisual.id) {
          if (pending.owner === "player") {
            executePlayerAttack(
              pending.attackerId,
              pending.targetMinionId,
              pending.targetHero === "enemy-hero" ? "enemy-hero" : null
            );
          } else {
            executeEnemyAttack(
              pending.attackerId,
              pending.targetMinionId,
              pending.targetHero === "player-hero" ? "player-hero" : null
            );
          }
          pendingAttackRef.current = null;
        }
        setAttackVisual(null);
        setAttackVisualPos(null);
      }
    };

    attackVisualFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (attackVisualFrameRef.current !== null) {
        window.cancelAnimationFrame(attackVisualFrameRef.current);
        attackVisualFrameRef.current = null;
      }
    };
  }, [attackVisual]);

  useEffect(() => {
    if (!targetingFrom) return;
    const handlePointerUp = () => {
      if (isGameOver) {
        setTargetingFrom(null);
        setTargetingToId(null);
        setTargetingToHero(null);
        return;
      }
      if (targetingFrom) {
        queuePlayerAttack(
          targetingFrom.id,
          targetingToId,
          targetingToHero?.id === "enemy-hero" ? "enemy-hero" : null
        );
      }
      setTargetingFrom(null);
      setTargetingToId(null);
      setTargetingToHero(null);
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [isGameOver, targetingFrom, targetingToHero, targetingToId]);


  const playerMinionCenters = useMemo(() => {
    return playerMinionLayout.reduce<Record<string, { x: number; y: number }>>((acc, minion) => {
      acc[minion.id] = { x: minion.slot.x + minionSize / 2, y: minion.slot.y + minionSize / 2 };
      return acc;
    }, {});
  }, [minionSize, playerMinionLayout]);

  const enemyMinionCenters = useMemo(() => {
    return enemyMinionLayout.reduce<Record<string, { x: number; y: number }>>((acc, minion) => {
      acc[minion.id] = { x: minion.slot.x + minionSize / 2, y: minion.slot.y + minionSize / 2 };
      return acc;
    }, {});
  }, [enemyMinionLayout, minionSize]);

  const enemyHeroCenter = {
    x: BoardSlots.HeroBottom.x + 58 + heroFrameSize / 2,
    y: BoardSlots.HeroTop.y + 80 + heroFrameSize / 2,
  };
  const playerHeroCenter = {
    x: BoardSlots.HeroBottom.x + 58 + heroFrameSize / 2,
    y: BoardSlots.HeroBottom.y - 45 + heroFrameSize / 2,
  };

  const targetingEnd = targetingFrom
    ? targetingToHero
      ? { x: targetingToHero.x, y: targetingToHero.y }
      : targetingToId && enemyMinionCenters[targetingToId]
        ? enemyMinionCenters[targetingToId]
        : { x: cursor.x, y: cursor.y }
    : null;

  const spellTargetingEnd = spellTargetingFrom
    ? spellTargetingToHero
      ? { x: spellTargetingToHero.x, y: spellTargetingToHero.y }
      : spellTargetingToMinion
        ? spellTargetingToMinion.owner === "player"
          ? playerMinionCenters[spellTargetingToMinion.id]
          : enemyMinionCenters[spellTargetingToMinion.id]
        : { x: cursor.x, y: cursor.y }
    : null;

  const activeTargetingFrom = targetingFrom
    ? { x: targetingFrom.x, y: targetingFrom.y }
    : spellTargetingFrom
      ? { x: spellTargetingFrom.x, y: spellTargetingFrom.y }
      : null;
  const activeTargetingEnd = targetingFrom ? targetingEnd : spellTargetingEnd;

  const handleEndTurn = () => {
    if (isGameOver) return;
    if (turn !== "player") return;
    setTurn("enemy");
  };

  const isPlayerHeroPowerDisabled =
    isGameOver || turn !== "player" || playerHeroPowerUsed || sharedMana < playerHeroPower.cost;

  return (
    <div className="board-stage">
      <MenuStamp slot={{ x: 24, y: 24 }} src="/assets/ui/menus/menuBackground.png" alt="Menu background" width={1} height={1} />
      <MenuStamp slot={{ x: 48, y: 24 }} src="/assets/ui/menus/map.png" alt="Map panel" width={1} height={1} />
      <MenuStamp slot={{ x: 72, y: 24 }} src="/assets/ui/menus/heroPanel.png" alt="Hero panel" width={1} height={1} />
      <HeroSlot
        slot={{ x: BoardSlots.HeroBottom.x + 58, y: BoardSlots.HeroTop.y + 80 }}
        portraitSrc="/assets/heroes/tharos.png"
        frameSrc="/assets/ui/frames/player-frame.png"
        alt="Enemy hero"
        health={enemyHealth}
        onTargetEnter={() => {
          if (targetingFrom) {
            setTargetingToHero({ id: "enemy-hero", x: enemyHeroCenter.x, y: enemyHeroCenter.y });
          }
          if (spellTargetingFrom) {
            setSpellTargetingToHero({
              id: "enemy-hero",
              x: enemyHeroCenter.x,
              y: enemyHeroCenter.y,
            });
          }
        }}
        onTargetLeave={() => {
          if (targetingToHero?.id === "enemy-hero") {
            setTargetingToHero(null);
          }
          if (spellTargetingToHero?.id === "enemy-hero") {
            setSpellTargetingToHero(null);
          }
        }}
      />
      <HeroSlot
        slot={{ x: BoardSlots.HeroBottom.x + 58, y: BoardSlots.HeroBottom.y - 45 }}
        portraitSrc="/assets/heroes/lyra.png"
        frameSrc="/assets/ui/frames/player-frame.png"
        alt="Player hero"
        health={playerHealth}
      />
      <ManaBar current={sharedMana} max={sharedMaxMana} />
      <EndTurnButton
        slot={BoardSlots.EndTurn}
        isActive={turn === "player" && !isGameOver}
        onEndTurn={handleEndTurn}
      />
      <AbilityFrame
        slot={BoardSlots.AbilityFrame}
        iconSrc="/assets/ui/hero powers/hp-lyra-vt.png"
        iconAlt={playerHeroPower?.name ?? "Lyra hero power"}
        onActivate={handlePlayerHeroPower}
        isDisabled={isPlayerHeroPowerDisabled}
        cost={playerHeroPower.cost}
      />
      <AbilityFrame
        slot={BoardSlots.EnemyAbilityFrame}
        iconSrc="/assets/ui/hero powers/hp-tharos-ec.png"
        iconAlt={enemyHeroPower?.name ?? "Tharos hero power"}
        isDisabled
        cost={enemyHeroPower.cost}
      />
      <div className="combat-lane combat-lane--enemy" />
      <div className="combat-lane combat-lane--player" />
      {layoutHand(handCards).map((card, index) => {
        const cardDef = getCardDef(card.cardId);
        if (!cardDef) {
          return null;
        }
        const slot = getHandSlot(card.id, card.slot.x, card.slot.y);
        const hoverOffsets = [
          { x: -12, y: -20 },
          { x: -8, y: -16 },
          { x: 0, y: -14 },
          { x: 8, y: -16 },
          { x: 12, y: -20 },
          { x: 16, y: -22 },
          { x: 20, y: -24 },
        ];
        return (
          <HandCard
            key={card.id}
            slot={slot}
            artSrc={getCardArt(card.cardId) ?? "/assets/cards/sunlance-champion.png"}
            alt={cardDef.name}
            rotation={draggingId === card.id ? 0 : card.rotation}
            isDragging={draggingId === card.id}
            onDragStart={
              cardDef.type === "MINION"
                ? () => handleDragStart(card.id, card.slot.x, card.slot.y)
                : undefined
            }
            onActivate={() => handleSpellActivate(card)}
            name={cardDef.name}
            text={cardDef.text}
            cost={cardDef.cost}
            attack={cardDef.attack}
            health={cardDef.health}
            type={cardDef.type}
            hoverOffset={hoverOffsets[index] ?? { x: 0, y: -18 }}
            isPlayable={
              turn === "player" &&
              sharedMana >= cardDef.cost &&
              (cardDef.type !== "MINION" || playerMinions.length < 7)
            }
          />
        );
      })}
      {enemyHand.map((_, index) => (
        <CardBack
          key={`enemy-back-${index}`}
          slot={getEnemyHandSlot(index)}
          rotation={180}
        />
      ))}
      {enemyDrag && enemyDragPos && (
        <CardBack slot={enemyDragPos} rotation={180} />
      )}
      {attackVisual && attackVisualPos && (
        <BoardMinion
          slot={attackVisualPos}
          artSrc={attackVisual.art}
          alt={attackVisual.alt}
          attack={attackVisual.attack}
          health={attackVisual.health}
          isAttackVisual
        />
      )}
      {isVoidFxEnabled && graveyardBursts.length > 0 && (
        <GraveyardVoidFX
          bursts={graveyardBursts}
          portalCenter={BoardSlots.Graveyard}
          portalSize={GRAVEYARD_PORTAL_SIZE}
          onBurstComplete={handleGraveyardBurstComplete}
        />
      )}
      <GraveyardPortal center={BoardSlots.Graveyard} />
      {ghostSlot && draggingCard && (
        <BoardMinion
          slot={ghostSlot}
          artSrc={getCardArt(draggingCard.cardId) ?? "/assets/cards/sunlance-champion.png"}
          alt={getCardDef(draggingCard.cardId)?.name ?? "Card"}
          isGhost
        />
      )}
      {playerMinionLayout.map((minion) => (
        <BoardMinion
          key={minion.id}
          slot={minion.slot}
          artSrc={minion.art}
          alt={minion.alt}
          attack={minion.attack}
          health={minion.health}
          isExhausted={minion.summoningSick}
          onTargetStart={(event) => {
            if (turn !== "player" || !minion.canAttack) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setTargetingFrom({
              id: minion.id,
              x: minion.slot.x + minionSize / 2,
              y: minion.slot.y + minionSize / 2,
            });
          }}
          onTargetEnter={() => {
            if (spellTargetingFrom && !minion.stealth && !minion.cloaked) {
              setSpellTargetingToMinion({ id: minion.id, owner: "player" });
            }
          }}
          onTargetLeave={() => {
            if (
              spellTargetingToMinion?.id === minion.id &&
              spellTargetingToMinion.owner === "player"
            ) {
              setSpellTargetingToMinion(null);
            }
          }}
        />
      ))}
      {enemyMinionLayout.map((minion) => (
        <BoardMinion
          key={minion.id}
          slot={minion.slot}
          artSrc={minion.art}
          alt={minion.alt}
          attack={minion.attack}
          health={minion.health}
          isExhausted={minion.summoningSick}
          onTargetEnter={() => {
            if (targetingFrom) {
              setTargetingToId(minion.id);
            }
            if (spellTargetingFrom && !minion.stealth && !minion.cloaked) {
              setSpellTargetingToMinion({ id: minion.id, owner: "enemy" });
            }
          }}
          onTargetLeave={() => {
            if (targetingToId === minion.id) {
              setTargetingToId(null);
            }
            if (
              spellTargetingToMinion?.id === minion.id &&
              spellTargetingToMinion.owner === "enemy"
            ) {
              setSpellTargetingToMinion(null);
            }
          }}
        />
      ))}
      {activeTargetingFrom && activeTargetingEnd && (
        <svg className="targeting-overlay" viewBox="0 0 1536 1024">
          <defs>
            <marker
              id="target-arrowhead"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L12,6 L0,12 Z" fill="rgba(120, 180, 255, 0.9)" />
            </marker>
          </defs>
          <line
            x1={activeTargetingFrom.x}
            y1={activeTargetingFrom.y}
            x2={activeTargetingEnd.x}
            y2={activeTargetingEnd.y}
            stroke="rgba(120, 180, 255, 0.9)"
            strokeWidth="6"
            strokeLinecap="round"
            markerEnd="url(#target-arrowhead)"
          />
        </svg>
      )}

      <CursorCoords
        turn={turn}
        timeLeftMs={turnTimeLeftMs}
        mana={sharedMana}
        manaMax={sharedMaxMana}
      />
      <BoardCursor />
      {winner && (
        <div className="game-over">
          <div className="game-over__panel">
            <div className="game-over__title">{winner === "player" ? "Victory" : "Defeat"}</div>
            <div className="game-over__subtitle">
              {winner === "player" ? "Lyra prevails." : "Tharos prevails."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardStage;
