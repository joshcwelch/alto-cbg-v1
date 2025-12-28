import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { BoardSlots } from "./BoardSlots";
import AbilityFrame from "./AbilityFrame";
import BoardCursor from "./BoardCursor";
import BoardMinion from "./BoardMinion";
import CardBack from "./CardBack";
import CardPreview from "./CardPreview";
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
import { AttackAnimationService } from "../presentation/AttackAnimationService";
import { COMBAT_TIMING } from "../engine/combatTiming";
import { MAX_BOARD_SIZE } from "../engine/constants";
import {
  createInitialState,
  engineReducer,
  getCardTargetType,
  getHeroPowerTargetTypeFor,
} from "../engine/engine";
import type { GameEvent, Intent, MinionInstance, SlamProfile, TargetSpec } from "../engine/types";

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
  artSrc?: string;
  frameSrc?: string;
};

type PresentationMinionSnapshot = {
  id: string;
  cardId: string;
  artSrc: string;
  alt: string;
  attack: number;
  health: number;
  slot: { x: number; y: number };
  center: { x: number; y: number };
};

const minionSize = 130;
const heroFrameSize = 223;
const handSpacing = 120;
const previewCardSize = { width: 220, height: 330 };
const previewMargin = 12;
const boardSize = { width: 1536, height: 1024 };

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

const getPreviewPosition = (slot: { x: number; y: number }) => {
  const preferRight = slot.x + minionSize + 16;
  const preferLeft = slot.x - previewCardSize.width - 16;
  let x =
    preferRight + previewCardSize.width <= boardSize.width - previewMargin
      ? preferRight
      : preferLeft;
  x = Math.max(previewMargin, Math.min(x, boardSize.width - previewCardSize.width - previewMargin));
  let y = slot.y + minionSize / 2 - previewCardSize.height / 2;
  y = Math.max(previewMargin, Math.min(y, boardSize.height - previewCardSize.height - previewMargin));
  return { x, y };
};

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
  const { cursor, scale, offsetX, offsetY } = useGameContext();
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
  const [ghostAttack, setGhostAttack] = useState<AttackVisual | null>(null);
  const [ghostAttackPos, setGhostAttackPos] =
    useState<{ x: number; y: number } | null>(null);
  const [graveyardBursts, setGraveyardBursts] = useState<GraveyardBurst[]>([]);
  const [minionPreview, setMinionPreview] = useState<{
    minionId: string;
    position: { x: number; y: number };
  } | null>(null);

  const attackVisualFrameRef = useRef<number | null>(null);
  const ghostAttackFrameRef = useRef<number | null>(null);
  const combatTimeoutRef = useRef<number | null>(null);
  const attackAnimatorRef = useRef<AttackAnimationService | null>(null);
  const attackLayerRef = useRef<HTMLDivElement | null>(null);

  const [inputLocked, setInputLocked] = useState(false);
  const minionCentersRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const attackQueueRef = useRef<
    Array<{
      attackerId: string;
      target: TargetSpec;
      slam: SlamProfile;
      showVisual: boolean;
      durationMs?: number;
    }>
  >([]);
  const isAnimatingRef = useRef(false);
  const presentationCursorRef = useRef(0);
  const playerGestureAttackRef = useRef(false);
  const lastSlamTargetRef = useRef<TargetSpec | null>(null);
  const pendingDeathEffectsRef = useRef<Map<string, () => void>>(new Map());
  const pendingDeathTimeoutsRef = useRef<Map<string, number>>(new Map());
  const damagePulseTimeoutRef = useRef<number | null>(null);
  const summonTimeoutsRef = useRef<Map<string, number>>(new Map());
  const summonRafRef = useRef<Map<string, number>>(new Map());
  const deathTimeoutsRef = useRef<Map<string, number>>(new Map());
  const deathRafRef = useRef<Map<string, number>>(new Map());
  const damageNumberTimeoutsRef = useRef<Map<number, number>>(new Map());
  const damageNumberRafRef = useRef<Map<number, number>>(new Map());
  const damageNumberPhaseTimeoutsRef = useRef<Map<number, number[]>>(new Map());
  const damageNumberDelayTimeoutsRef = useRef<Map<number, number>>(new Map());
  const hitFlashTimeoutsRef = useRef<Map<number, number>>(new Map());
  const hitFlashRafRef = useRef<Map<number, number>>(new Map());
  const impactPunchTimeoutsRef = useRef<Map<number, number>>(new Map());
  const impactPunchRafRef = useRef<Map<number, number>>(new Map());
  const knownMinionIdsRef = useRef<Set<string>>(new Set());
  const lastMinionSnapshotRef = useRef<Map<string, PresentationMinionSnapshot>>(new Map());
  const prevTurnRef = useRef(state.turn);

  const [presentationAttack, setPresentationAttack] = useState<{
    attackerId: string;
    target: TargetSpec;
    slam: SlamProfile;
  } | null>(null);
  const [damagePulse, setDamagePulse] = useState<{
    id: number;
    x: number;
    y: number;
    amount: number;
  } | null>(null);
  const [summonEffects, setSummonEffects] = useState<Record<string, { phase: "start" | "end" }>>({});
  const [deathEffects, setDeathEffects] = useState<Record<string, { phase: "start" | "end"; snapshot: PresentationMinionSnapshot }>>({});
  const [damageNumbers, setDamageNumbers] = useState<
    Record<
      number,
      {
        id: number;
        x: number;
        y: number;
        amount: number;
        isHealing: boolean;
        popScale: number;
        settleScale: number;
        brightness: number;
        phase: "pop" | "settle" | "drift";
      }
    >
  >({});
  const [hitFlashes, setHitFlashes] = useState<
    Record<number, { id: number; x: number; y: number; scale: number; phase: "start" | "end" }>
  >({});
  const [impactPunches, setImpactPunches] = useState<
    Record<number, { id: number; snapshot: PresentationMinionSnapshot; scale: number; phase: "start" | "end" }>
  >({});

  const player = state.players.player;
  const enemy = state.players.enemy;
  const playerDeckCount = Math.max(0, player.deck.length - player.deckIndex);
  const enemyDeckCount = Math.max(0, enemy.deck.length - enemy.deckIndex);

  const playerHeroPower = getHeroPowerFor(player.hero.id);
  const enemyHeroPower = getHeroPowerFor(enemy.hero.id);

  const isGameOver = !!state.winner;
  const presentationEnabled = true;
  const recoilAnimsRef = useRef<WeakMap<HTMLElement, Animation>>(new WeakMap());

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
    const snapshots = new Map<string, PresentationMinionSnapshot>(lastMinionSnapshotRef.current);

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

    playerMinionLayout.forEach((minion) => {
      snapshots.set(minion.id, {
        id: minion.id,
        cardId: minion.cardId,
        artSrc: getCardArt(minion.cardId) ?? "/assets/cards/sunlance-champion.png",
        alt: getCardDef(minion.cardId)?.name ?? "Minion",
        attack: minion.attack,
        health: minion.health,
        slot: minion.slot,
        center: {
          x: minion.slot.x + minionSize / 2,
          y: minion.slot.y + minionSize / 2,
        },
      });
    });
    enemyMinionLayout.forEach((minion) => {
      snapshots.set(minion.id, {
        id: minion.id,
        cardId: minion.cardId,
        artSrc: getCardArt(minion.cardId) ?? "/assets/cards/sunlance-champion.png",
        alt: getCardDef(minion.cardId)?.name ?? "Minion",
        attack: minion.attack,
        health: minion.health,
        slot: minion.slot,
        center: {
          x: minion.slot.x + minionSize / 2,
          y: minion.slot.y + minionSize / 2,
        },
      });
    });

    minionCentersRef.current = centers;
    lastMinionSnapshotRef.current = snapshots;
  }, [playerMinionLayout, enemyMinionLayout]);

  const dispatchIntent = useCallback(
    (intent: Intent) => {
      if (!inputLocked) dispatch(intent);
    },
    [inputLocked]
  );

  useEffect(() => {
    if (!attackAnimatorRef.current) {
      attackAnimatorRef.current = new AttackAnimationService();
    }
    return () => {
      attackAnimatorRef.current?.stopAll();
    };
  }, []);

  const startAttackVisual = useCallback(
    (attackerId: string, target: TargetSpec): number => {
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
      setPresentationAttack(null);
      setInputLocked(false);
      return;
    }

    isAnimatingRef.current = true;
    setInputLocked(true);
    setPresentationAttack(next);

    const moveDuration = next.showVisual
      ? startAttackVisual(next.attackerId, next.target)
      : next.durationMs ?? COMBAT_TIMING.attackWindup + COMBAT_TIMING.impactPause;

    combatTimeoutRef.current = window.setTimeout(() => {
      isAnimatingRef.current = false;
      runNextAttack();
    }, moveDuration + COMBAT_TIMING.resolveBuffer);
  }, [startAttackVisual]);

  const getTargetCenter = useCallback(
    (target: TargetSpec) => {
      if (target.type === "HERO") {
        return target.player === "enemy" ? enemyHeroCenter : playerHeroCenter;
      }
      const snapshot = lastMinionSnapshotRef.current.get(target.id);
      if (snapshot) return snapshot.center;
      return minionCentersRef.current.get(target.id) ?? null;
    },
    [enemyHeroCenter, playerHeroCenter]
  );

  const getMinionCenterById = useCallback(
    (minionId: string) => {
      const snapshot = lastMinionSnapshotRef.current.get(minionId);
      if (snapshot) return snapshot.center;
      const live = minionCentersRef.current.get(minionId);
      if (live) return live;
      const layout =
        playerMinionLayout.find((minion) => minion.id === minionId) ??
        enemyMinionLayout.find((minion) => minion.id === minionId);
      if (!layout) return null;
      return {
        x: layout.slot.x + minionSize / 2,
        y: layout.slot.y + minionSize / 2,
      };
    },
    [playerMinionLayout, enemyMinionLayout]
  );

  const getMinionById = useCallback(
    (minionId: string) =>
      player.board.find((minion) => minion.id === minionId) ??
      enemy.board.find((minion) => minion.id === minionId),
    [player.board, enemy.board]
  );

  const previewMinion = minionPreview ? getMinionById(minionPreview.minionId) : null;
  const previewCardDef = previewMinion ? getCardDef(previewMinion.cardId) : null;

  useEffect(() => {
    if (minionPreview && !previewMinion) {
      setMinionPreview(null);
    }
  }, [minionPreview, previewMinion]);


  const getSlamDurationMs = useCallback((slam?: SlamProfile) => {
    switch (slam) {
      case "LETHAL":
      case "HEAVY":
      case "LIGHT":
      default:
        return 1120;
    }
  }, []);

  const playEventSlam = useCallback(
    (attackerId: string, target: TargetSpec, slam: SlamProfile): boolean => {
      if (!presentationEnabled) return false;
      const animator = attackAnimatorRef.current;
      const layer = attackLayerRef.current;
      if (!animator || !layer) return false;
      const attacker = getMinionById(attackerId);
      if (!attacker) return false;
      const from = getMinionCenterById(attackerId);
      const to = getTargetCenter(target);
      if (!from || !to) return false;
      lastSlamTargetRef.current = target;
      void animator.playAttackSlam({
        layer,
        from,
        to,
        artUrl: getCardArt(attacker.cardId) ?? "/assets/cards/sunlance-champion.png",
        sizePx: minionSize,
        slam: slam ?? "LIGHT",
        attack: attacker.attack,
        health: attacker.health,
        onImpact: () => {
          const currentTarget = lastSlamTargetRef.current;
          if (currentTarget?.type === "MINION") {
            const pending = pendingDeathEffectsRef.current.get(currentTarget.id);
            if (pending) {
              pending();
              pendingDeathEffectsRef.current.delete(currentTarget.id);
            }
            const timeoutId = pendingDeathTimeoutsRef.current.get(currentTarget.id);
            if (timeoutId) {
              window.clearTimeout(timeoutId);
              pendingDeathTimeoutsRef.current.delete(currentTarget.id);
            }
          }
          lastSlamTargetRef.current = null;
        },
      });
      return true;
    },
    [presentationEnabled, getMinionById, getMinionCenterById, getTargetCenter]
  );

  const getRecoilDistance = (slam?: SlamProfile) => {
    switch (slam) {
      case "LETHAL":
        return 6;
      case "HEAVY":
        return 4;
      default:
        return 2;
    }
  };

  const playDefenderRecoil = useCallback(
    (target: TargetSpec, slam?: SlamProfile, attackerCenter?: { x: number; y: number } | null) => {
      const distance = getRecoilDistance(slam);
      const targetCenter = getTargetCenter(target);
      let dx = 0;
      let dy = 0;

      if (attackerCenter && targetCenter) {
        const vx = targetCenter.x - attackerCenter.x;
        const vy = targetCenter.y - attackerCenter.y;
        const len = Math.hypot(vx, vy);
        if (len > 0.001) {
          dx = (vx / len) * distance;
          dy = (vy / len) * distance;
        }
      } else if (target.type === "HERO") {
        dy = target.player === "enemy" ? distance : -distance;
      } else {
        dy = target.owner === "enemy" ? -distance : distance;
      }

      const element =
        target.type === "HERO"
          ? (document.querySelector(`[data-hero-id=\"${target.player}\"]`) as HTMLElement | null)
          : (document.querySelector(`[data-minion-id=\"${target.id}\"]`) as HTMLElement | null);

      if (!element || typeof element.animate !== "function") return;

      const existing = recoilAnimsRef.current.get(element);
      if (existing) {
        existing.cancel();
      }

      const anim = element.animate(
        [
          { transform: "translate(0px, 0px)" },
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "translate(0px, 0px)" },
        ],
        { duration: 100, easing: "ease-out" }
      );
      recoilAnimsRef.current.set(element, anim);
      anim.onfinish = () => {
        if (recoilAnimsRef.current.get(element) === anim) {
          recoilAnimsRef.current.delete(element);
        }
      };
      anim.oncancel = () => {
        if (recoilAnimsRef.current.get(element) === anim) {
          recoilAnimsRef.current.delete(element);
        }
      };
    },
    [getTargetCenter]
  );

  const addSummonEffect = useCallback(
    (minionId: string) => {
      if (!presentationEnabled) return;
      setSummonEffects((prev) => ({ ...prev, [minionId]: { phase: "start" } }));
      const rafId = window.requestAnimationFrame(() => {
        setSummonEffects((prev) => {
          if (!prev[minionId]) return prev;
          return { ...prev, [minionId]: { phase: "end" } };
        });
      });
      summonRafRef.current.set(minionId, rafId);
      const timeoutId = window.setTimeout(() => {
        setSummonEffects((prev) => {
          if (!prev[minionId]) return prev;
          const next = { ...prev };
          delete next[minionId];
          return next;
        });
        summonTimeoutsRef.current.delete(minionId);
        summonRafRef.current.delete(minionId);
      }, 520);
      summonTimeoutsRef.current.set(minionId, timeoutId);
    },
    [presentationEnabled]
  );

  const addDeathEffect = useCallback(
    (minionId: string) => {
      if (!presentationEnabled) return;
      const snapshot = lastMinionSnapshotRef.current.get(minionId);
      if (!snapshot) return;
      setDeathEffects((prev) => ({
        ...prev,
        [minionId]: { phase: "start", snapshot },
      }));
      const rafId = window.requestAnimationFrame(() => {
        setDeathEffects((prev) => {
          const current = prev[minionId];
          if (!current) return prev;
          return { ...prev, [minionId]: { ...current, phase: "end" } };
        });
      });
      deathRafRef.current.set(minionId, rafId);
      const timeoutId = window.setTimeout(() => {
        setDeathEffects((prev) => {
          if (!prev[minionId]) return prev;
          const next = { ...prev };
          delete next[minionId];
          return next;
        });
        deathTimeoutsRef.current.delete(minionId);
        deathRafRef.current.delete(minionId);
      }, 620);
      deathTimeoutsRef.current.set(minionId, timeoutId);
    },
    [presentationEnabled]
  );

  const addDamageNumber = useCallback(
    (event: { id: number; payload: { target: TargetSpec; amount: number; slam?: SlamProfile } }, force = false) => {
      if (!presentationEnabled) return;
      const center =
        event.payload.target.type === "MINION"
          ? lastMinionSnapshotRef.current.get(event.payload.target.id)?.center ?? getTargetCenter(event.payload.target)
          : getTargetCenter(event.payload.target);
      if (!center) return;
      const slamScale =
        event.payload.slam === "LETHAL" ? 1.12 : event.payload.slam === "HEAVY" ? 1.06 : 1;
      const brightness =
        event.payload.slam === "LETHAL" ? 1.08 : event.payload.slam === "HEAVY" ? 1.04 : 1;
      const isHealing = event.payload.amount < 0;
      const delayMs = playerGestureAttackRef.current ? 80 : 0;
      if (!force && delayMs > 0) {
        const delayId = window.setTimeout(() => {
          damageNumberDelayTimeoutsRef.current.delete(event.id);
          addDamageNumber(event, true);
        }, delayMs);
        damageNumberDelayTimeoutsRef.current.set(event.id, delayId);
        return;
      }

      setDamageNumbers((prev) => ({
        ...prev,
        [event.id]: {
          id: event.id,
          x: center.x,
          y: center.y,
          amount: Math.abs(event.payload.amount),
          isHealing,
          popScale: 1.25 * slamScale,
          settleScale: 1.0 * slamScale,
          brightness,
          phase: "pop",
        },
      }));

      const popTimer = window.setTimeout(() => {
        setDamageNumbers((prev) => {
          const current = prev[event.id];
          if (!current) return prev;
          return { ...prev, [event.id]: { ...current, phase: "settle" } };
        });
      }, 400);

      const driftTimer = window.setTimeout(() => {
        setDamageNumbers((prev) => {
          const current = prev[event.id];
          if (!current) return prev;
          return { ...prev, [event.id]: { ...current, phase: "drift" } };
        });
      }, 480);

      damageNumberPhaseTimeoutsRef.current.set(event.id, [popTimer, driftTimer]);

      const timeoutId = window.setTimeout(() => {
        setDamageNumbers((prev) => {
          if (!prev[event.id]) return prev;
          const next = { ...prev };
          delete next[event.id];
          return next;
        });
        damageNumberTimeoutsRef.current.delete(event.id);
        const timers = damageNumberPhaseTimeoutsRef.current.get(event.id);
        if (timers) timers.forEach((timer) => window.clearTimeout(timer));
        damageNumberPhaseTimeoutsRef.current.delete(event.id);
        damageNumberDelayTimeoutsRef.current.delete(event.id);
      }, 1500);
      damageNumberTimeoutsRef.current.set(event.id, timeoutId);
    },
    [presentationEnabled, getTargetCenter]
  );

  const addHitFlash = useCallback(
    (event: { id: number; payload: { target: TargetSpec; slam?: SlamProfile } }) => {
      if (!presentationEnabled) return;
      const center =
        event.payload.target.type === "MINION"
          ? lastMinionSnapshotRef.current.get(event.payload.target.id)?.center ?? getTargetCenter(event.payload.target)
          : getTargetCenter(event.payload.target);
      if (!center) return;
      const scale =
        event.payload.slam === "LETHAL" ? 1.08 : event.payload.slam === "HEAVY" ? 1.04 : 1;
      setHitFlashes((prev) => ({
        ...prev,
        [event.id]: {
          id: event.id,
          x: center.x,
          y: center.y,
          scale,
          phase: "start",
        },
      }));
      const rafId = window.requestAnimationFrame(() => {
        setHitFlashes((prev) => {
          const current = prev[event.id];
          if (!current) return prev;
          return { ...prev, [event.id]: { ...current, phase: "end" } };
        });
      });
      hitFlashRafRef.current.set(event.id, rafId);
      const timeoutId = window.setTimeout(() => {
        setHitFlashes((prev) => {
          if (!prev[event.id]) return prev;
          const next = { ...prev };
          delete next[event.id];
          return next;
        });
        hitFlashTimeoutsRef.current.delete(event.id);
        hitFlashRafRef.current.delete(event.id);
      }, 320);
      hitFlashTimeoutsRef.current.set(event.id, timeoutId);
    },
    [presentationEnabled, getTargetCenter]
  );

  const addImpactPunch = useCallback(
    (entry: { id: number; minionId: string; slam?: SlamProfile }) => {
      if (!presentationEnabled) return;
      const snapshot = lastMinionSnapshotRef.current.get(entry.minionId);
      if (!snapshot) return;
      const scale =
        entry.slam === "LETHAL" ? 1.08 : entry.slam === "HEAVY" ? 1.05 : 1.03;
      setImpactPunches((prev) => ({
        ...prev,
        [entry.id]: {
          id: entry.id,
          snapshot,
          scale,
          phase: "start",
        },
      }));
      const rafId = window.requestAnimationFrame(() => {
        setImpactPunches((prev) => {
          const current = prev[entry.id];
          if (!current) return prev;
          return { ...prev, [entry.id]: { ...current, phase: "end" } };
        });
      });
      impactPunchRafRef.current.set(entry.id, rafId);
      const timeoutId = window.setTimeout(() => {
        setImpactPunches((prev) => {
          if (!prev[entry.id]) return prev;
          const next = { ...prev };
          delete next[entry.id];
          return next;
        });
        impactPunchTimeoutsRef.current.delete(entry.id);
        impactPunchRafRef.current.delete(entry.id);
      }, 320);
      impactPunchTimeoutsRef.current.set(entry.id, timeoutId);
    },
    [presentationEnabled]
  );

  const clearDamagePulse = useCallback(() => {
    if (damagePulseTimeoutRef.current !== null) {
      window.clearTimeout(damagePulseTimeoutRef.current);
      damagePulseTimeoutRef.current = null;
    }
    setDamagePulse(null);
  }, []);

  const enqueueAttackPresentation = useCallback(
    (entry: {
      attackerId: string;
      target: TargetSpec;
      slam: SlamProfile;
      showVisual: boolean;
      durationMs?: number;
    }) => {
      if (!presentationEnabled) return;
      attackQueueRef.current.push(entry);
      runNextAttack();
    },
    [presentationEnabled, runNextAttack]
  );

  const showDamagePulse = useCallback(
    (event: { id: number; payload: { target: TargetSpec; amount: number } }) => {
      if (!presentationEnabled) return;
      const center = getTargetCenter(event.payload.target);
      if (!center) return;
      clearDamagePulse();
      setDamagePulse({
        id: event.id,
        x: center.x,
        y: center.y,
        amount: event.payload.amount,
      });
      damagePulseTimeoutRef.current = window.setTimeout(() => {
        setDamagePulse(null);
        damagePulseTimeoutRef.current = null;
      }, 700);
    },
    [presentationEnabled, getTargetCenter, clearDamagePulse]
  );

  const clearPresentationEffects = useCallback(() => {
    summonTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    summonRafRef.current.forEach((rafId) => window.cancelAnimationFrame(rafId));
    deathTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    deathRafRef.current.forEach((rafId) => window.cancelAnimationFrame(rafId));
    summonTimeoutsRef.current.clear();
    summonRafRef.current.clear();
    deathTimeoutsRef.current.clear();
    deathRafRef.current.clear();
    pendingDeathTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    pendingDeathTimeoutsRef.current.clear();
    pendingDeathEffectsRef.current.clear();
    setSummonEffects({});
    setDeathEffects({});
  }, []);

  const clearDamageNumbers = useCallback(() => {
    damageNumberTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    damageNumberRafRef.current.forEach((rafId) => window.cancelAnimationFrame(rafId));
    damageNumberPhaseTimeoutsRef.current.forEach((timers) => timers.forEach((timer) => window.clearTimeout(timer)));
    damageNumberDelayTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    damageNumberTimeoutsRef.current.clear();
    damageNumberRafRef.current.clear();
    damageNumberPhaseTimeoutsRef.current.clear();
    damageNumberDelayTimeoutsRef.current.clear();
    setDamageNumbers({});
  }, []);

  const clearHitFlashes = useCallback(() => {
    hitFlashTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    hitFlashRafRef.current.forEach((rafId) => window.cancelAnimationFrame(rafId));
    hitFlashTimeoutsRef.current.clear();
    hitFlashRafRef.current.clear();
    setHitFlashes({});
  }, []);

  const clearImpactPunches = useCallback(() => {
    impactPunchTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    impactPunchRafRef.current.forEach((rafId) => window.cancelAnimationFrame(rafId));
    impactPunchTimeoutsRef.current.clear();
    impactPunchRafRef.current.clear();
    setImpactPunches({});
  }, []);

  useEffect(() => {
    return () => {
      if (damagePulseTimeoutRef.current !== null) {
        window.clearTimeout(damagePulseTimeoutRef.current);
      }
      clearDamageNumbers();
      clearHitFlashes();
      clearImpactPunches();
      clearPresentationEffects();
      setGhostAttack(null);
      setGhostAttackPos(null);
    };
  }, [clearPresentationEffects, clearDamageNumbers, clearHitFlashes, clearImpactPunches]);

  useEffect(() => {
    if (!presentationEnabled) {
      setPresentationAttack(null);
      clearDamagePulse();
      clearDamageNumbers();
      clearHitFlashes();
      clearImpactPunches();
      clearPresentationEffects();
      attackAnimatorRef.current?.stopAll();
      setGhostAttack(null);
      setGhostAttackPos(null);
      return;
    }
  }, [
    presentationEnabled,
    clearDamagePulse,
    clearDamageNumbers,
    clearHitFlashes,
    clearImpactPunches,
    clearPresentationEffects,
  ]);

  useEffect(() => {
    if (prevTurnRef.current === state.turn) return;
    prevTurnRef.current = state.turn;
    clearDamagePulse();
    clearDamageNumbers();
    clearHitFlashes();
    clearImpactPunches();
    clearPresentationEffects();
    playerGestureAttackRef.current = false;
    attackAnimatorRef.current?.stopAll();
    setGhostAttack(null);
    setGhostAttackPos(null);
  }, [
    state.turn,
    clearDamagePulse,
    clearDamageNumbers,
    clearHitFlashes,
    clearImpactPunches,
    clearPresentationEffects,
  ]);

  useEffect(() => {
    if (!isGameOver) return;
    clearDamagePulse();
    clearDamageNumbers();
    clearHitFlashes();
    clearImpactPunches();
    clearPresentationEffects();
    playerGestureAttackRef.current = false;
    attackAnimatorRef.current?.stopAll();
    setGhostAttack(null);
    setGhostAttackPos(null);
  }, [
    isGameOver,
    clearDamagePulse,
    clearDamageNumbers,
    clearHitFlashes,
    clearImpactPunches,
    clearPresentationEffects,
  ]);

  const resolveSummonedMinionId = useCallback(
    (playerId: "player" | "enemy", cardId: string) => {
      const board = state.players[playerId].board;
      const known = knownMinionIdsRef.current;
      const candidate = board.find((minion) => minion.cardId === cardId && !known.has(minion.id));
      if (!candidate) return null;
      known.add(candidate.id);
      return candidate.id;
    },
    [state.players]
  );

  const getTargetAtPoint = useCallback(
    (point: { x: number; y: number }): TargetSpec | null => {
      const enemyHeroBounds = {
        x: BoardSlots.HeroBottom.x + 58,
        y: BoardSlots.HeroTop.y + 80,
        width: heroFrameSize,
        height: heroFrameSize,
      };
      const inEnemyHero =
        point.x >= enemyHeroBounds.x &&
        point.x <= enemyHeroBounds.x + enemyHeroBounds.width &&
        point.y >= enemyHeroBounds.y &&
        point.y <= enemyHeroBounds.y + enemyHeroBounds.height;
      if (inEnemyHero) {
        return { type: "HERO", player: "enemy" };
      }

      const enemyHit = enemyMinionLayout.find(
        (minion) =>
          point.x >= minion.slot.x &&
          point.x <= minion.slot.x + minionSize &&
          point.y >= minion.slot.y &&
          point.y <= minion.slot.y + minionSize
      );
      if (enemyHit) {
        return { type: "MINION", id: enemyHit.id, owner: "enemy" };
      }

      return null;
    },
    [enemyMinionLayout]
  );

  const previewAttackTarget = useMemo(() => {
    if (!targetingFrom) return null;
    if (targetingToHero) {
      return { type: "HERO", player: targetingToHero.id === "enemy-hero" ? "enemy" : "player" } as TargetSpec;
    }
    if (targetingToId) {
      return { type: "MINION", id: targetingToId, owner: "enemy" } as TargetSpec;
    }
    return getTargetAtPoint(cursor);
  }, [cursor, getTargetAtPoint, targetingFrom, targetingToHero, targetingToId]);

  const deathSkullTargets = useMemo(() => {
    if (!targetingFrom || !previewAttackTarget || previewAttackTarget.type !== "MINION") return [];
    const attacker = getMinionById(targetingFrom.id);
    const defender = getMinionById(previewAttackTarget.id);
    if (!attacker || !defender) return [];
    const targets: string[] = [];
    if (defender.attack >= attacker.health) targets.push(attacker.id);
    if (attacker.attack >= defender.health) targets.push(defender.id);
    return targets;
  }, [getMinionById, previewAttackTarget, targetingFrom]);

  const deathSkullPositions = useMemo(() => {
    if (deathSkullTargets.length === 0) return [];
    return deathSkullTargets
      .map((id) => {
        const center = getMinionCenterById(id);
        return center ? { id, x: center.x, y: center.y } : null;
      })
      .filter((entry): entry is { id: string; x: number; y: number } => !!entry);
  }, [deathSkullTargets, getMinionCenterById]);

  const presentationHandlers = useMemo(
    () => ({
      playSound: (cueId: string) => {
        console.debug("[presentation] sound", cueId);
      },
      getSoundCueForEvent: (event: GameEvent): string | null => {
        switch (event.type) {
          case "CARD_PLAYED":
            return "card_play";
          case "ATTACK_DECLARED":
            return "attack_swing";
          case "DAMAGE_DEALT":
            return "damage_hit";
          case "MINION_DIED":
            return "minion_die";
          case "TURN_STARTED":
            return "turn_start";
          default:
            return null;
        }
      },
      onCardPlayed: (cardId: string, playerId: "player" | "enemy") => {
        console.debug("[presentation] card played", cardId, playerId);
      },
      onMinionSummoned: (minionId: string) => {
        console.debug("[presentation] minion summoned", minionId);
        addSummonEffect(minionId);
      },
      onAttackDeclared: (attackerId: string) => {
        console.debug("[presentation] attack declared", attackerId);
      },
      onAttackQueued: (entry: {
        attackerId: string;
        target: TargetSpec;
        slam: SlamProfile;
        showVisual: boolean;
        durationMs?: number;
      }) => {
        console.debug("[presentation] attack queued", entry.attackerId);
        enqueueAttackPresentation(entry);
      },
      onDamageDealt: (event: { id: number; payload: { target: TargetSpec; amount: number; slam?: SlamProfile } }) => {
        console.debug("[presentation] damage dealt", event.payload.amount);
        showDamagePulse(event);
        addDamageNumber(event);
        addHitFlash(event);
        const attackerCenter = (() => {
          if (!presentationAttack) return null;
          const sameTarget =
            (event.payload.target.type === "HERO" &&
              presentationAttack.target.type === "HERO" &&
              presentationAttack.target.player === event.payload.target.player) ||
            (event.payload.target.type === "MINION" &&
              presentationAttack.target.type === "MINION" &&
              presentationAttack.target.id === event.payload.target.id &&
              presentationAttack.target.owner === event.payload.target.owner);
          if (!sameTarget) return null;
          return getMinionCenterById(presentationAttack.attackerId);
        })();
        playDefenderRecoil(event.payload.target, event.payload.slam, attackerCenter);
        if (event.payload.target.type === "MINION") {
          addImpactPunch({
            id: event.id,
            minionId: event.payload.target.id,
            slam: event.payload.slam,
          });
          if (presentationAttack?.target.type === "MINION") {
            const sameTarget =
              presentationAttack.target.id === event.payload.target.id &&
              presentationAttack.target.owner === event.payload.target.owner;
            if (sameTarget) {
              addImpactPunch({
                id: event.id * 10 + 1,
                minionId: presentationAttack.attackerId,
                slam: event.payload.slam,
              });
            }
          }
        }
      },
      onMinionDied: (minionId: string) => {
        console.debug("[presentation] minion died", minionId);
        const gestureTarget = lastSlamTargetRef.current;
        const eventTarget = presentationAttack?.target ?? null;
        const shouldDelay =
          (gestureTarget?.type === "MINION" && gestureTarget.id === minionId) ||
          (eventTarget?.type === "MINION" && eventTarget.id === minionId);
        const runDeath = () => {
          setDeathEffects((prev) => {
            if (!prev[minionId]) return prev;
            const next = { ...prev };
            delete next[minionId];
            return next;
          });
          const snapshot = lastMinionSnapshotRef.current.get(minionId);
          const center =
            snapshot?.center ??
            minionCentersRef.current.get(minionId) ??
            { x: BoardSlots.BoardCenter.x, y: BoardSlots.BoardCenter.y };
          window.setTimeout(() => {
            setGraveyardBursts((prev) => [
              ...prev,
              {
                id: `graveyard-${minionId}-${Date.now()}`,
                bounds: {
                  x: center.x - minionSize / 2,
                  y: center.y - minionSize / 2,
                  width: minionSize,
                  height: minionSize,
                },
                artSrc: snapshot?.artSrc ?? "/assets/cards/sunlance-champion.png",
                frameSrc: "/assets/ui/frames/minion.png",
              },
            ]);
          }, 260);
        };
        if (shouldDelay) {
          pendingDeathEffectsRef.current.set(minionId, runDeath);
          const timeoutId = window.setTimeout(() => {
            const pending = pendingDeathEffectsRef.current.get(minionId);
            if (pending) {
              pending();
              pendingDeathEffectsRef.current.delete(minionId);
            }
            pendingDeathTimeoutsRef.current.delete(minionId);
          }, 240);
          pendingDeathTimeoutsRef.current.set(minionId, timeoutId);
          return;
        }
        runDeath();
      },
      onTurnStart: (playerId: string) => {
        console.debug("[presentation] turn start", playerId);
      },
      onTurnEnd: (playerId: string) => {
        console.debug("[presentation] turn end", playerId);
      },
      onCombatResolved: () => {
        console.debug("[presentation] combat resolved");
        setPresentationAttack(null);
        playerGestureAttackRef.current = false;
      },
    }),
    [
      enqueueAttackPresentation,
      showDamagePulse,
      clearDamagePulse,
      addSummonEffect,
      addDeathEffect,
      addDamageNumber,
      addHitFlash,
      clearHitFlashes,
      addImpactPunch,
      clearImpactPunches,
      presentationAttack,
      getMinionCenterById,
      playDefenderRecoil,
    ]
  );

  useEffect(() => {
    const startIndex = presentationCursorRef.current;
    if (startIndex >= state.log.length) return;

    const events = state.log.slice(startIndex);
    if (!presentationEnabled) {
      presentationCursorRef.current = state.log.length;
      return;
    }
    events.forEach((event) => {
      const soundCue = presentationHandlers.getSoundCueForEvent(event);
      if (soundCue) {
        presentationHandlers.playSound(soundCue);
      }
      switch (event.type) {
        case "TURN_STARTED":
          presentationHandlers.onTurnStart(event.payload.player);
          break;
        case "TURN_ENDED":
          presentationHandlers.onTurnEnd(event.payload.player);
          break;
        case "CARD_PLAYED": {
          presentationHandlers.onCardPlayed(event.payload.cardId, event.payload.player);
          const cardDef = getCardDef(event.payload.cardId);
          if (cardDef?.type === "MINION") {
            const summonedId = resolveSummonedMinionId(event.payload.player, event.payload.cardId);
            if (summonedId) {
              presentationHandlers.onMinionSummoned(summonedId);
            }
          }
          break;
        }
        case "ATTACK_DECLARED": {
          presentationHandlers.onAttackDeclared(event.payload.attackerId);
          const shouldGhostSlam = event.payload.player === "enemy" || !playerGestureAttackRef.current;
          const usedGhostSlam = shouldGhostSlam
            ? playEventSlam(event.payload.attackerId, event.payload.target, event.payload.slam)
            : false;
          if (event.payload.player === "enemy" || !playerGestureAttackRef.current) {
            presentationHandlers.onAttackQueued({
              attackerId: event.payload.attackerId,
              target: event.payload.target,
              slam: event.payload.slam,
              showVisual: event.payload.player === "enemy" && !usedGhostSlam,
              durationMs: usedGhostSlam ? getSlamDurationMs(event.payload.slam) : undefined,
            });
          }
          break;
        }
        case "DAMAGE_DEALT":
          presentationHandlers.onDamageDealt({ id: event.id, payload: event.payload });
          break;
        case "MINION_DIED":
          presentationHandlers.onMinionDied(event.payload.minionId);
          break;
        case "COMBAT_RESOLVED":
          presentationHandlers.onCombatResolved();
          break;
        default:
          break;
      }
    });

    presentationCursorRef.current = state.log.length;
  }, [state.log, presentationHandlers, presentationEnabled, resolveSummonedMinionId, playEventSlam, getSlamDurationMs]);

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
    if (!ghostAttack) return;
    if (ghostAttackFrameRef.current !== null) {
      window.cancelAnimationFrame(ghostAttackFrameRef.current);
      ghostAttackFrameRef.current = null;
    }

    const animate = (time: number) => {
      const elapsed = time - ghostAttack.startTime;
      const t = Math.min(1, elapsed / ghostAttack.durationMs);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = ghostAttack.start.x + (ghostAttack.end.x - ghostAttack.start.x) * eased;
      const y = ghostAttack.start.y + (ghostAttack.end.y - ghostAttack.start.y) * eased;
      setGhostAttackPos({ x, y });
      if (t < 1) {
        ghostAttackFrameRef.current = window.requestAnimationFrame(animate);
      } else {
        setGhostAttack(null);
        setGhostAttackPos(null);
      }
    };

    ghostAttackFrameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (ghostAttackFrameRef.current !== null) {
        window.cancelAnimationFrame(ghostAttackFrameRef.current);
        ghostAttackFrameRef.current = null;
      }
    };
  }, [ghostAttack]);

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

  const handleAttackCommit = (point?: { x: number; y: number }) => {
    console.log("[AttackAnimationService] handleAttackCommit", {
      attackerId: targetingFrom?.id ?? null,
      targetingToId,
      targetingToHero: targetingToHero?.id ?? null,
      inputLocked,
      turn: state.turn,
    });
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
        : point
          ? getTargetAtPoint(point)
          : getTargetAtPoint(cursor);
    if (target) {
      playerGestureAttackRef.current = true;
      if (presentationEnabled && attackAnimatorRef.current && attackLayerRef.current) {
        const from = getMinionCenterById(targetingFrom.id);
        const to =
          target.type === "HERO"
            ? target.player === "enemy"
              ? enemyHeroCenter
              : playerHeroCenter
            : getMinionCenterById(target.id);
        console.log("[AttackAnimationService] slam (player)", { from, to, target });
        if (from && to) {
          lastSlamTargetRef.current = target;
          void attackAnimatorRef.current.playAttackSlam({
            layer: attackLayerRef.current,
            from,
            to,
            artUrl: getCardArt(targetingFrom.cardId) ?? "/assets/cards/sunlance-champion.png",
            sizePx: minionSize,
            slam: "LIGHT",
            attack: targetingFrom.attack,
            health: targetingFrom.health,
            onImpact: () => {
              const currentTarget = lastSlamTargetRef.current;
              if (currentTarget?.type === "MINION") {
                const pending = pendingDeathEffectsRef.current.get(currentTarget.id);
                if (pending) {
                  pending();
                  pendingDeathEffectsRef.current.delete(currentTarget.id);
                }
                const timeoutId = pendingDeathTimeoutsRef.current.get(currentTarget.id);
                if (timeoutId) {
                  window.clearTimeout(timeoutId);
                  pendingDeathTimeoutsRef.current.delete(currentTarget.id);
                }
              }
              lastSlamTargetRef.current = null;
            },
          });
        }
      }
      dispatchIntent({ type: "DECLARE_ATTACK", player: "player", attackerId: targetingFrom.id, target });
    } else {
      console.log("[AttackAnimationService] no target on commit");
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
    const handlePointerUp = (event: PointerEvent) => {
      const point = {
        x: (event.clientX - offsetX) / scale,
        y: (event.clientY - offsetY) / scale,
      };
      console.log("[AttackAnimationService] pointerup", {
        attackerId: targetingFrom.id,
        targetingToId,
        targetingToHero: targetingToHero?.id ?? null,
        point,
      });
      handleAttackCommit(point);
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

  const getSummonPresentationStyle = (minionId: string) => {
    const effect = summonEffects[minionId];
    if (!effect) return undefined;
    const base = {
      transition: "transform 480ms ease-out, opacity 480ms ease-out",
      transformOrigin: "50% 50%",
    };
    if (effect.phase === "start") {
      return { ...base, transform: "scale(0.9)", opacity: 0.2 };
    }
    return { ...base, transform: "scale(1)", opacity: 1 };
  };

  const getDeathPresentationStyle = (phase: "start" | "end") => ({
    transition: "transform 520ms ease-in, opacity 520ms ease-in, filter 520ms ease-in",
    transformOrigin: "50% 50%",
    transform: phase === "start" ? "scale(1)" : "scale(0.88)",
    opacity: phase === "start" ? 1 : 0,
    filter:
      phase === "start"
        ? "drop-shadow(0 0 10px rgba(160, 90, 255, 0.45))"
        : "drop-shadow(0 0 18px rgba(120, 60, 190, 0.2))",
  });

    return (
      <div className="board-stage">
        <MenuStamp slot={{ x: 24, y: 24 }} src="/assets/ui/menus/menuBackground.png" alt="Menu background" width={1} height={1} />
        <MenuStamp slot={{ x: 48, y: 24 }} src="/assets/ui/menus/map.png" alt="Map panel" width={1} height={1} />
        <MenuStamp slot={{ x: 72, y: 24 }} src="/assets/ui/menus/heroPanel.png" alt="Hero panel" width={1} height={1} />
        <div className="menu-frame-group">
          <img className="menu-frame" src="/assets/ui/menu-frame.png" alt="" draggable={false} />
          <div className="menu-frame__icons">
            <img className="menu-frame__icon" src="/assets/ui/exit.png" alt="Exit" draggable={false} />
            <img className="menu-frame__icon" src="/assets/ui/sound-on.png" alt="Sound on" draggable={false} />
            <img className="menu-frame__icon" src="/assets/ui/settings.png" alt="Settings" draggable={false} />
            <img className="menu-frame__icon" src="/assets/ui/help.png" alt="Help" draggable={false} />
          </div>
        </div>
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
        heroId="enemy"
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
        heroId="player"
        health={player.hero.health}
      />

      <ManaBar current={player.mana} max={player.maxMana} />

      <div
        className="deck-count deck-count--enemy"
        style={{ left: BoardSlots.EnemyDeckCount.x, top: BoardSlots.EnemyDeckCount.y }}
        aria-label={`Enemy deck: ${enemyDeckCount} cards remaining`}
      >
        <img
          className="deck-count__icon"
          src="/assets/ui/deck-count-icon.png"
          alt=""
          draggable={false}
        />
        <span className="deck-count__text">{enemyDeckCount}</span>
      </div>

      <div
        className="deck-count deck-count--player"
        style={{ left: BoardSlots.PlayerDeckCount.x, top: BoardSlots.PlayerDeckCount.y }}
        aria-label={`Player deck: ${playerDeckCount} cards remaining`}
      >
        <img
          className="deck-count__icon"
          src="/assets/ui/deck-count-icon.png"
          alt=""
          draggable={false}
        />
        <span className="deck-count__text">{playerDeckCount}</span>
      </div>

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
          isTaunt={minion.taunt}
          isExhausted={minion.summoningSick}
          isPlayable={state.turn === "player" && !inputLocked && minion.canAttack && !minion.summoningSick}
          isInactive={state.turn === "player" && (minion.summoningSick || !minion.canAttack)}
          presentationStyle={getSummonPresentationStyle(minion.id)}
          dataMinionId={minion.id}
          onTargetStart={(event) => {
            if (state.turn !== "player" || inputLocked) return;
            if (!minion.canAttack) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            setTargetingFrom(minion);
          }}
          onTargetEnter={() => {
            setMinionPreview({
              minionId: minion.id,
              position: getPreviewPosition(minion.slot),
            });
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
            if (minionPreview?.minionId === minion.id) {
              setMinionPreview(null);
            }
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
          isTaunt={minion.taunt}
          isExhausted={minion.summoningSick}
          presentationStyle={getSummonPresentationStyle(minion.id)}
          dataMinionId={minion.id}
          onTargetEnter={() => {
            setMinionPreview({
              minionId: minion.id,
              position: getPreviewPosition(minion.slot),
            });
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
            if (minionPreview?.minionId === minion.id) {
              setMinionPreview(null);
            }
            if (targetingToId === minion.id) {
              setTargetingToId(null);
            }
            if (spellTargetingToMinion?.id === minion.id && spellTargetingToMinion.owner === "enemy") {
              setSpellTargetingToMinion(null);
            }
          }}
        />
      ))}

      {minionPreview && previewMinion && previewCardDef && !targetingFrom && !spellTargetingFrom && (
        <CardPreview
          position={minionPreview.position}
          artSrc={getCardArt(previewMinion.cardId) ?? "/assets/cards/sunlance-champion.png"}
          name={previewCardDef.name}
          text={previewCardDef.text}
          cost={previewCardDef.cost}
          attack={previewMinion.attack}
          health={previewMinion.health}
          type={previewCardDef.type}
        />
      )}

      <div
        id="alto-attack-layer"
        ref={attackLayerRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />

      <div
        className="fx-overlay"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 8,
        }}
      >
        {deathSkullPositions.map((position) => (
          <div
            key={`death-warning-${position.id}`}
            className="death-warning"
            style={{
              left: position.x - 48,
              top: position.y - 48,
            }}
          >
            <img
              className="death-warning__icon"
              src="/assets/ui/minnion-death.png"
              alt=""
              draggable={false}
            />
          </div>
        ))}

        {ghostAttack && ghostAttackPos && (
          <BoardMinion
            slot={ghostAttackPos}
            artSrc={ghostAttack.art}
            alt={ghostAttack.alt}
            attack={ghostAttack.attack}
            health={ghostAttack.health}
            isPresentation
            presentationStyle={{
              transition: "transform 120ms ease-out, opacity 120ms ease-out",
              transformOrigin: "50% 50%",
              transform: "scale(1.06)",
              opacity: 0.95,
              filter: "drop-shadow(0 0 10px rgba(120, 170, 255, 0.65))",
            }}
          />
        )}

        {attackVisual && attackVisualPos && (
          <BoardMinion
            slot={attackVisualPos}
            artSrc={attackVisual.art}
            alt={attackVisual.alt}
            attack={attackVisual.attack}
            health={attackVisual.health}
            isAttackVisual
            isPresentation
          />
        )}

        {damagePulse && (
          <div
            style={{
              position: "absolute",
              left: damagePulse.x - 12,
              top: damagePulse.y - 12,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(255, 190, 120, 0.7)",
              boxShadow: "0 0 12px rgba(255, 190, 120, 0.8)",
              pointerEvents: "none",
            }}
          />
        )}

        {Object.values(damageNumbers).map((entry) => (
          <div
            key={`damage-${entry.id}`}
            style={{
              position: "absolute",
              left: entry.x - 6,
              top: entry.y - 12,
              transform:
                entry.phase === "pop"
                  ? `translateY(0px) scale(${entry.popScale})`
                  : entry.phase === "settle"
                    ? `translateY(0px) scale(${entry.settleScale})`
                    : `translateY(-14px) scale(${entry.settleScale})`,
              opacity: entry.phase === "drift" ? 0 : 1,
              transition:
                entry.phase === "pop"
                  ? "transform 400ms ease-out"
                  : entry.phase === "settle"
                    ? "transform 400ms ease-out, opacity 1300ms ease-out"
                    : "transform 900ms ease-out, opacity 1300ms ease-out",
              color: entry.isHealing ? "rgba(120, 220, 200, 0.95)" : "rgba(255, 160, 90, 0.95)",
              fontSize: "28px",
              fontWeight: 800,
              filter: `brightness(${entry.brightness})`,
              textShadow: entry.isHealing
                ? "0 0 10px rgba(120, 220, 200, 0.95)"
                : "0 0 10px rgba(255, 160, 90, 0.95)",
              pointerEvents: "none",
            }}
          >
            {entry.amount}
          </div>
        ))}

        {Object.values(hitFlashes).map((entry) => (
          <div
            key={`hit-${entry.id}`}
            style={{
              position: "absolute",
              left: entry.x - 36,
              top: entry.y - 36,
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "3px solid rgba(255, 220, 180, 0.75)",
              opacity: entry.phase === "start" ? 0.75 : 0,
              transform: entry.phase === "start" ? `scale(${entry.scale})` : `scale(${entry.scale * 1.08})`,
              transition: "transform 320ms ease-out, opacity 320ms ease-out",
              pointerEvents: "none",
            }}
          />
        ))}

        {Object.values(impactPunches).map((entry) => (
          <BoardMinion
            key={`impact-${entry.id}`}
            slot={entry.snapshot.slot}
            artSrc={entry.snapshot.artSrc}
            alt={entry.snapshot.alt}
            attack={entry.snapshot.attack}
            health={entry.snapshot.health}
            isGhost
            isPresentation
            presentationStyle={{
              transition: "transform 320ms ease-out, opacity 320ms ease-out",
              transformOrigin: "50% 50%",
              transform: entry.phase === "start" ? "scale(1)" : `scale(${entry.scale})`,
              opacity: entry.phase === "start" ? 1 : 0.85,
            }}
          />
        ))}

        {Object.values(deathEffects).map((effect) => (
          <BoardMinion
            key={`death-${effect.snapshot.id}`}
            slot={effect.snapshot.slot}
            artSrc={effect.snapshot.artSrc}
            alt={effect.snapshot.alt}
            attack={effect.snapshot.attack}
            health={effect.snapshot.health}
            isGhost
            isPresentation
            presentationStyle={getDeathPresentationStyle(effect.phase)}
          />
        ))}
      </div>

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
