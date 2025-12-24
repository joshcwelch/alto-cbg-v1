import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { BoardSlots } from "./BoardSlots";
import AbilityFrame from "./AbilityFrame";
import BoardCursor from "./BoardCursor";
import BoardMinion from "./BoardMinion";
import CardBack from "./CardBack";
import CursorCoords from "./CursorCoords";
import EndTurnButton from "./EndTurnButton";
import HandCard from "./HandCard";
import HeroSlot from "./HeroSlot";
import ManaBar from "./ManaBar";
import MenuStamp from "./MenuStamp";
import GraveyardPortal, { GRAVEYARD_PORTAL_SIZE } from "./GraveyardPortal";
import GraveyardVoidFX from "./GraveyardVoidFX";
import { useGameContext } from "../GameRoot";
import { CardRegistry, getHeroPowerFor } from "../cards/CardRegistry";
import { chooseAiIntent } from "../ai/ai";
import { COMBAT_TIMING } from "../engine/combatTiming";
import { MAX_BOARD_SIZE } from "../engine/constants";
import {
  createInitialState,
  engineReducer,
  getCardTargetType,
  getHeroPowerTargetTypeFor,
} from "../engine/engine";
import type { Intent, MinionInstance, SlamProfile, TargetSpec } from "../engine/types";

type HeroTargetHover =
  | { id: "enemy-hero"; x: number; y: number }
  | { id: "player-hero"; x: number; y: number }
  | null;

type MinionTargetHover =
  | { id: string; owner: "enemy" | "player"; x: number; y: number }
  | null;

type HandCardData = {
  id: string;
  cardId: string;
  slot: { x: number; y: number };
  rotation: number;
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

type LaneConfig = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type GraveyardBurst = {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
};

const minionSize = 130;
const heroFrameSize = 223;
const handSpacing = 120;

const getCardDef = (cardId: string) => CardRegistry[cardId];
const getCardArt = (cardId: string) => getCardDef(cardId)?.art;

const getLaneSlots = (lane: LaneConfig, count: number) => {
  const totalWidth = count * minionSize + (count - 1) * 16;
  const startX = lane.left + Math.max(0, Math.round((lane.width - totalWidth) / 2));
  const y = lane.top + Math.round((lane.height - minionSize) / 2);
  return Array.from({ length: count }, (_, index) => ({
    x: startX + index * (minionSize + 16),
    y,
  }));
};

const layoutMinions = (minions: MinionInstance[], lane: LaneConfig) => {
  const slots = getLaneSlots(lane, Math.max(1, minions.length));
  return minions.map((minion, index) => ({ ...minion, slot: slots[index] }));
};

const layoutHand = (cards: HandCardData[]) => {
  const count = cards.length;
  const centerX = BoardSlots.BoardCenter.x;
  const startX = centerX - ((count - 1) * handSpacing) / 2;
  const spread = count >= 2 ? 2 : 0;
  return cards.map((card, index) => ({
    ...card,
    slot: { x: startX + index * handSpacing, y: BoardSlots.Hand.y },
    rotation: (index - (count - 1) / 2) * spread,
  }));
};

const getEnemyHandSlot = (index: number) => ({
  x: BoardSlots.EnemyHand.x + index * 80,
  y: BoardSlots.EnemyHand.y,
});

const getSpellTarget = (
  targeting: MinionTargetHover,
  targetingHero: HeroTargetHover
): TargetSpec | undefined => {
  if (targetingHero) {
    return {
      type: "HERO",
      player: targetingHero.id === "enemy-hero" ? "enemy" : "player",
    };
  }

  if (targeting) {
    return {
      type: "MINION",
      id: targeting.id,
      owner: targeting.owner,
    };
  }

  return undefined;
};

const BoardStage = () => {
  const { cursor } = useGameContext();
  const [state, dispatch] = useReducer(engineReducer, undefined, createInitialState);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [spellTargetingFrom, setSpellTargetingFrom] = useState<{
    cardId: string;
    handId: string;
    x: number;
    y: number;
  } | null>(null);

  const [spellTargetingToMinion, setSpellTargetingToMinion] =
    useState<MinionTargetHover>(null);

  const [spellTargetingToHero, setSpellTargetingToHero] =
    useState<HeroTargetHover>(null);

  const [targetingFrom, setTargetingFrom] = useState<MinionInstance | null>(null);
  const [targetingToId, setTargetingToId] = useState<string | null>(null);
  const [targetingToHero, setTargetingToHero] =
    useState<HeroTargetHover>(null);

  const [attackVisual, setAttackVisual] = useState<AttackVisual | null>(null);
  const [attackVisualPos, setAttackVisualPos] =
    useState<{ x: number; y: number } | null>(null);
  const [graveyardBursts, setGraveyardBursts] = useState<GraveyardBurst[]>([]);

  const attackVisualFrameRef = useRef<number | null>(null);
  const combatTimeoutRef = useRef<number | null>(null);

  const [inputLocked, setInputLocked] = useState(false);
  const prevLogIndexRef = useRef(0);
  const minionCentersRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const attackQueueRef = useRef<
    Array<{ attackerId: string; target: TargetSpec; slam: SlamProfile }>
  >([]);
  const isAnimatingRef = useRef(false);

  const player = state.players.player;
  const enemy = state.players.enemy;

  const playerHeroPower = getHeroPowerFor(player.hero.id);
  const enemyHeroPower = getHeroPowerFor(enemy.hero.id);

  const isGameOver = !!state.winner;

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

  const playerHandCards = useMemo<HandCardData[]>(
    () =>
      player.hand.map((card) => ({
        ...card,
        slot: { x: BoardSlots.Hand.x, y: BoardSlots.Hand.y },
        rotation: 0,
      })),
    [player.hand]
  );

  const draggingCard = playerHandCards.find((card) => card.id === draggingId) ?? null;

  const playerMinionLayout = useMemo(
    () => layoutMinions(player.board, playerLane),
    [player.board, playerLane]
  );
  const enemyMinionLayout = useMemo(
    () => layoutMinions(enemy.board, enemyLane),
    [enemy.board, enemyLane]
  );

  const playerHeroCenter = useMemo(
    () => ({
      x: BoardSlots.HeroBottom.x + 58 + heroFrameSize / 2,
      y: BoardSlots.HeroBottom.y - 45 + heroFrameSize / 2,
    }),
    []
  );
  const enemyHeroCenter = useMemo(
    () => ({
      x: BoardSlots.HeroBottom.x + 58 + heroFrameSize / 2,
      y: BoardSlots.HeroTop.y + 80 + heroFrameSize / 2,
    }),
    []
  );
  const graveyardCenter = useMemo(
    () => ({
      x: BoardSlots.Graveyard.x,
      y: BoardSlots.Graveyard.y,
    }),
    []
  );

  useEffect(() => {
    const centers = new Map<string, { x: number; y: number }>();

    playerMinionLayout.forEach((minion) =>
      centers.set(minion.id, {
        x: minion.slot.x + minionSize / 2,
        y: minion.slot.y + minionSize / 2,
      })
    );
    enemyMinionLayout.forEach((minion) =>
      centers.set(minion.id, {
        x: minion.slot.x + minionSize / 2,
        y: minion.slot.y + minionSize / 2,
      })
    );

    minionCentersRef.current = centers;
  }, [playerMinionLayout, enemyMinionLayout]);

  const dispatchIntent = useCallback(
    (intent: Intent) => {
      if (!inputLocked) dispatch(intent);
    },
    [inputLocked]
  );

  const startAttackVisual = useCallback(
    (attackerId: string, target: TargetSpec, slam: SlamProfile): number => {
      setAttackVisual(null);
      setAttackVisualPos(null);

      const start = minionCentersRef.current.get(attackerId);
      if (!start) return 0;

      const end =
        target.type === "HERO"
          ? target.player === "enemy"
            ? enemyHeroCenter
            : playerHeroCenter
          : minionCentersRef.current.get(target.id);

      if (!end) return 0;

      const attacker = [...player.board, ...enemy.board].find(
        (minion) => minion.id === attackerId
      );
      if (!attacker) return 0;

      const duration =
        COMBAT_TIMING.attackWindup + COMBAT_TIMING.impactPause;

      setAttackVisual({
        id: `${attackerId}-${Date.now()}`,
        art: getCardArt(attacker.cardId) ?? "/assets/cards/sunlance-champion.png",
        alt: getCardDef(attacker.cardId)?.name ?? "Attacker",
        attack: attacker.attack,
        health: attacker.health,
        start: { x: start.x - minionSize / 2, y: start.y - minionSize / 2 },
        end: { x: end.x - minionSize / 2, y: end.y - minionSize / 2 },
        startTime: performance.now(),
        durationMs: duration,
      });

      return duration;
    },
    [player.board, enemy.board, enemyHeroCenter, playerHeroCenter]
  );

  const runNextAttack = useCallback(() => {
    if (isAnimatingRef.current) return;

    const next = attackQueueRef.current.shift();
    if (!next) {
      setInputLocked(false);
      return;
    }

    isAnimatingRef.current = true;
    setInputLocked(true);

    const moveDuration = startAttackVisual(
      next.attackerId,
      next.target,
      next.slam
    );

    combatTimeoutRef.current = window.setTimeout(() => {
      isAnimatingRef.current = false;
      runNextAttack();
    }, moveDuration + COMBAT_TIMING.resolveBuffer);
  }, [startAttackVisual]);

  useEffect(() => {
    const newEvents = state.log.slice(prevLogIndexRef.current);
    prevLogIndexRef.current = state.log.length;

    newEvents.forEach((event) => {
      if (event.type === "ATTACK_DECLARED") {
        attackQueueRef.current.push({
          attackerId: event.payload.attackerId,
          target: event.payload.target,
          slam: event.payload.slam,
        });
      }
      if (event.type === "MINION_DIED") {
        const center =
          minionCentersRef.current.get(event.payload.minionId) ??
          { x: BoardSlots.BoardCenter.x, y: BoardSlots.BoardCenter.y };
        setGraveyardBursts((prev) => [
          ...prev,
          {
            id: `graveyard-${event.id}`,
            bounds: {
              x: center.x - minionSize / 2,
              y: center.y - minionSize / 2,
              width: minionSize,
              height: minionSize,
            },
          },
        ]);
      }
    });

    runNextAttack();
  }, [state.log, runNextAttack]);

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
    if (state.turn !== "enemy" || inputLocked || state.winner) return;

    const intent = chooseAiIntent(state);
    if (!intent) return;

    const t = window.setTimeout(() => dispatchIntent(intent), 400);
    return () => window.clearTimeout(t);
  }, [state, inputLocked, dispatchIntent]);

  const handleEndTurn = () => {
    if (isGameOver || inputLocked || state.turn !== "player") return;
    dispatchIntent({ type: "END_TURN", player: "player" });
  };

  const handlePlayerHeroPower = () => {
    if (isGameOver || inputLocked || state.turn !== "player") return;
    const targetType = getHeroPowerTargetTypeFor("player");
    if (targetType === "NONE") {
      dispatchIntent({ type: "USE_HERO_POWER", player: "player" });
    }
  };

  const handleSpellActivate = (card: HandCardData) => {
    if (isGameOver || inputLocked || state.turn !== "player") return;
    const cardDef = getCardDef(card.cardId);
    if (!cardDef || cardDef.type !== "SPELL") return;
    if (player.mana < cardDef.cost) return;
    const targetType = getCardTargetType(card.cardId);
    if (targetType === "NONE") {
      dispatchIntent({ type: "PLAY_CARD", player: "player", handId: card.id });
      return;
    }
    setSpellTargetingFrom({ cardId: card.cardId, handId: card.id, x: cursor.x, y: cursor.y });
  };

  const handleSpellTargetCommit = () => {
    if (!spellTargetingFrom) return;
    if (state.turn !== "player" || inputLocked) {
      setSpellTargetingFrom(null);
      setSpellTargetingToMinion(null);
      setSpellTargetingToHero(null);
      return;
    }
    const target = getSpellTarget(spellTargetingToMinion, spellTargetingToHero);
    if (!target) {
      setSpellTargetingFrom(null);
      setSpellTargetingToMinion(null);
      setSpellTargetingToHero(null);
      return;
    }
    dispatchIntent({ type: "PLAY_CARD", player: "player", handId: spellTargetingFrom.handId, target });
    setSpellTargetingFrom(null);
    setSpellTargetingToMinion(null);
    setSpellTargetingToHero(null);
  };

  const handleAttackCommit = () => {
    if (!targetingFrom) return;
    if (state.turn !== "player" || inputLocked) {
      setTargetingFrom(null);
      setTargetingToId(null);
      setTargetingToHero(null);
      return;
    }
    const target = targetingToHero
      ? ({ type: "HERO", player: targetingToHero.id === "enemy-hero" ? "enemy" : "player" } as TargetSpec)
      : targetingToId
        ? ({ type: "MINION", id: targetingToId, owner: "enemy" } as TargetSpec)
        : null;
    if (target) {
      dispatchIntent({ type: "DECLARE_ATTACK", player: "player", attackerId: targetingFrom.id, target });
    }
    setTargetingFrom(null);
    setTargetingToId(null);
    setTargetingToHero(null);
  };

  useEffect(() => {
    if (state.turn === "player" && !inputLocked) return;
    setSpellTargetingFrom(null);
    setSpellTargetingToMinion(null);
    setSpellTargetingToHero(null);
    setTargetingFrom(null);
    setTargetingToId(null);
    setTargetingToHero(null);
  }, [state.turn, inputLocked]);

  useEffect(() => {
    if (!spellTargetingFrom) return;
    const handlePointerUp = () => {
      handleSpellTargetCommit();
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [spellTargetingFrom, spellTargetingToHero, spellTargetingToMinion]);

  useEffect(() => {
    if (!targetingFrom) return;
    const handlePointerUp = () => {
      handleAttackCommit();
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [targetingFrom, targetingToHero, targetingToId]);

  const isCursorInPlayerLane =
    cursor.x >= playerLane.left &&
    cursor.x <= playerLane.left + playerLane.width &&
    cursor.y >= playerLane.top &&
    cursor.y <= playerLane.top + playerLane.height;

  useEffect(() => {
    if (!draggingId) return;
    const handlePointerUp = () => {
      const card = playerHandCards.find((item) => item.id === draggingId);
      if (card) {
        const cardDef = getCardDef(card.cardId);
        const canPlayMinion =
          !!cardDef &&
          cardDef.type === "MINION" &&
          state.turn === "player" &&
          !inputLocked &&
          player.mana >= cardDef.cost &&
          player.board.length < MAX_BOARD_SIZE;

        if (canPlayMinion && isCursorInPlayerLane) {
          dispatchIntent({ type: "PLAY_CARD", player: "player", handId: card.id });
        }
      }

      setDraggingId(null);
      setDragOffset({ x: 0, y: 0 });
    };

    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [
    dispatchIntent,
    draggingId,
    inputLocked,
    isCursorInPlayerLane,
    player.board.length,
    player.mana,
    playerHandCards,
    state.turn,
  ]);

  const ghostSlot =
    draggingCard && isCursorInPlayerLane && player.board.length < MAX_BOARD_SIZE
      ? { x: cursor.x - minionSize / 2, y: cursor.y - minionSize / 2 }
      : null;

  const targetingFromCenter = targetingFrom
    ? minionCentersRef.current.get(targetingFrom.id) ?? null
    : null;

  const activeTargetingEnd = targetingFrom
    ? targetingToHero
      ? { x: targetingToHero.x, y: targetingToHero.y }
      : targetingToId
        ? minionCentersRef.current.get(targetingToId) ?? null
        : { x: cursor.x, y: cursor.y }
    : spellTargetingFrom
      ? spellTargetingToHero
        ? { x: spellTargetingToHero.x, y: spellTargetingToHero.y }
        : spellTargetingToMinion
          ? { x: spellTargetingToMinion.x, y: spellTargetingToMinion.y }
          : { x: cursor.x, y: cursor.y }
      : null;

  const activeTargetingFrom = targetingFromCenter
    ? { x: targetingFromCenter.x, y: targetingFromCenter.y }
    : spellTargetingFrom
      ? { x: spellTargetingFrom.x, y: spellTargetingFrom.y }
      : null;

  const isPlayerHeroPowerDisabled =
    isGameOver ||
    inputLocked ||
    state.turn !== "player" ||
    player.hero.heroPowerUsed ||
    player.mana < (playerHeroPower?.cost ?? 2);

  return (
    <div className="board-stage">
      <MenuStamp slot={{ x: 24, y: 24 }} src="/assets/ui/menus/menuBackground.png" alt="Menu background" width={1} height={1} />
      <MenuStamp slot={{ x: 48, y: 24 }} src="/assets/ui/menus/map.png" alt="Map panel" width={1} height={1} />
      <MenuStamp slot={{ x: 72, y: 24 }} src="/assets/ui/menus/heroPanel.png" alt="Hero panel" width={1} height={1} />
      <GraveyardPortal center={graveyardCenter} />
      <GraveyardVoidFX
        bursts={graveyardBursts}
        portalCenter={graveyardCenter}
        portalSize={GRAVEYARD_PORTAL_SIZE}
        onBurstComplete={(id) => {
          setGraveyardBursts((prev) => prev.filter((burst) => burst.id !== id));
        }}
      />

      <HeroSlot
        slot={{ x: BoardSlots.HeroBottom.x + 58, y: BoardSlots.HeroTop.y + 80 }}
        portraitSrc="/assets/heroes/tharos.png"
        frameSrc="/assets/ui/frames/player-frame.png"
        alt="Enemy hero"
        health={enemy.hero.health}
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
        health={player.hero.health}
      />

      <ManaBar current={player.mana} max={player.maxMana} />

      <EndTurnButton
        slot={BoardSlots.EndTurn}
        isActive={state.turn === "player" && !isGameOver && !inputLocked}
        onEndTurn={handleEndTurn}
      />

      <AbilityFrame
        slot={BoardSlots.AbilityFrame}
        iconSrc="/assets/ui/hero powers/hp-lyra-vt.png"
        iconAlt={playerHeroPower?.name ?? "Lyra hero power"}
        onActivate={handlePlayerHeroPower}
        isDisabled={isPlayerHeroPowerDisabled}
        cost={playerHeroPower?.cost ?? 2}
      />

      <AbilityFrame
        slot={BoardSlots.EnemyAbilityFrame}
        iconSrc="/assets/ui/hero powers/hp-tharos-ec.png"
        iconAlt={enemyHeroPower?.name ?? "Tharos hero power"}
        isDisabled
        cost={enemyHeroPower?.cost ?? 2}
      />

      <div className="combat-lane combat-lane--enemy" />
      <div className="combat-lane combat-lane--player" />

      {layoutHand(playerHandCards).map((card, index) => {
        const cardDef = getCardDef(card.cardId);
        if (!cardDef) return null;
        const cardSlot =
          draggingId === card.id
            ? { x: cursor.x - dragOffset.x, y: cursor.y - dragOffset.y }
            : card.slot;
        const hoverOffsets = [
          { x: -12, y: -20 },
          { x: -8, y: -16 },
          { x: 0, y: -14 },
          { x: 8, y: -16 },
          { x: 12, y: -20 },
          { x: 16, y: -22 },
          { x: 20, y: -24 },
          { x: 22, y: -26 },
          { x: 26, y: -28 },
          { x: 30, y: -30 },
        ];
        return (
          <HandCard
            key={card.id}
            slot={cardSlot}
            artSrc={getCardArt(card.cardId) ?? "/assets/cards/sunlance-champion.png"}
            alt={cardDef.name}
            rotation={draggingId === card.id ? 0 : card.rotation}
            isDragging={draggingId === card.id}
            onDragStart={
              cardDef.type === "MINION"
                ? (event) => {
                    if (inputLocked || state.turn !== "player") return;
                    setDraggingId(card.id);
                    setDragOffset({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY });
                  }
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
              state.turn === "player" &&
              !inputLocked &&
              player.mana >= cardDef.cost &&
              (cardDef.type !== "MINION" || player.board.length < MAX_BOARD_SIZE)
            }
          />
        );
      })}

      {enemy.hand.map((_, index) => (
        <CardBack
          key={`enemy-back-${index}`}
          slot={getEnemyHandSlot(index)}
          rotation={180}
        />
      ))}

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
          artSrc={getCardArt(minion.cardId) ?? "/assets/cards/sunlance-champion.png"}
          alt={getCardDef(minion.cardId)?.name ?? "Minion"}
          attack={minion.attack}
          health={minion.health}
          isExhausted={minion.summoningSick}
          onTargetStart={(event) => {
            if (state.turn !== "player" || inputLocked) return;
            if (!minion.canAttack) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setTargetingFrom(minion);
          }}
          onTargetEnter={() => {
            if (spellTargetingFrom && !minion.stealth && !minion.cloaked) {
              setSpellTargetingToMinion({
                id: minion.id,
                owner: "player",
                x: minion.slot.x + minionSize / 2,
                y: minion.slot.y + minionSize / 2,
              });
            }
          }}
          onTargetLeave={() => {
            if (spellTargetingToMinion?.id === minion.id && spellTargetingToMinion.owner === "player") {
              setSpellTargetingToMinion(null);
            }
          }}
        />
      ))}

      {enemyMinionLayout.map((minion) => (
        <BoardMinion
          key={minion.id}
          slot={minion.slot}
          artSrc={getCardArt(minion.cardId) ?? "/assets/cards/sunlance-champion.png"}
          alt={getCardDef(minion.cardId)?.name ?? "Minion"}
          attack={minion.attack}
          health={minion.health}
          isExhausted={minion.summoningSick}
          onTargetEnter={() => {
            if (targetingFrom) {
              setTargetingToId(minion.id);
            }
            if (spellTargetingFrom && !minion.stealth && !minion.cloaked) {
              setSpellTargetingToMinion({
                id: minion.id,
                owner: "enemy",
                x: minion.slot.x + minionSize / 2,
                y: minion.slot.y + minionSize / 2,
              });
            }
          }}
          onTargetLeave={() => {
            if (targetingToId === minion.id) {
              setTargetingToId(null);
            }
            if (spellTargetingToMinion?.id === minion.id && spellTargetingToMinion.owner === "enemy") {
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
        turn={state.turn}
        timeLeftMs={50000}
        mana={player.mana}
        manaMax={player.maxMana}
      />

      <BoardCursor />
    </div>
  );
};

export default BoardStage;
