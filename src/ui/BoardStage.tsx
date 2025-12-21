import { useEffect, useMemo, useRef, useState } from "react";
import { BoardSlots } from "./BoardSlots";
import AbilityFrame from "./AbilityFrame";
import BoardCursor from "./BoardCursor";
import BoardMinion from "./BoardMinion";
import CardBack from "./CardBack";
import CursorCoords from "./CursorCoords";
import EndTurnButton from "./EndTurnButton";
import GraveyardPortal from "./GraveyardPortal";
import HandCard from "./HandCard";
import HeroSlot from "./HeroSlot";
import ManaBar from "./ManaBar";
import MenuStamp from "./MenuStamp";
import { useGameContext } from "../GameRoot";

type HandCardData = {
  id: string;
  slot: { x: number; y: number };
  rotation: number;
  art: string;
  alt: string;
};

type MinionData = {
  id: string;
  art: string;
  alt: string;
};

type DragVisual = {
  id: string;
  art: string;
  alt: string;
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

type TurnState = "player" | "enemy";

const BoardStage = () => {
  const { cursor } = useGameContext();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [turn, setTurn] = useState<TurnState>("player");
  const [sharedMana, setSharedMana] = useState(1);
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

  const [handCards, setHandCards] = useState<HandCardData[]>([
    {
      id: "hand-1",
      slot: { x: BoardSlots.Hand.x, y: BoardSlots.Hand.y + 12 },
      rotation: -12,
      art: "/assets/cards/sunlance-champion.png",
      alt: "Sunlance Champion",
    },
    {
      id: "hand-2",
      slot: { x: BoardSlots.Hand.x + 120, y: BoardSlots.Hand.y + 6 },
      rotation: -6,
      art: "/assets/cards/sunlance-scout.png",
      alt: "Sunlance Scout",
    },
    {
      id: "hand-3",
      slot: { x: BoardSlots.Hand.x + 240, y: BoardSlots.Hand.y },
      rotation: 0,
      art: "/assets/cards/beacon-monk.png",
      alt: "Beacon Monk",
    },
    {
      id: "hand-4",
      slot: { x: BoardSlots.Hand.x + 360, y: BoardSlots.Hand.y + 6 },
      rotation: 6,
      art: "/assets/cards/crystal-acolyte.png",
      alt: "Crystal Acolyte",
    },
    {
      id: "hand-5",
      slot: { x: BoardSlots.Hand.x + 480, y: BoardSlots.Hand.y + 12 },
      rotation: 12,
      art: "/assets/cards/seraphic-warden.png",
      alt: "Seraphic Warden",
    },
  ]);
  const [playerDrawIndex, setPlayerDrawIndex] = useState(5);

  const [playerMinions, setPlayerMinions] = useState<MinionData[]>([]);
  const [enemyMinions, setEnemyMinions] = useState<MinionData[]>([]);
  const [enemyHand, setEnemyHand] = useState<MinionData[]>([
    { id: "enemy-1", art: "/assets/cards/sunlance-champion.png", alt: "Sunlance Champion" },
    { id: "enemy-2", art: "/assets/cards/sunlance-scout.png", alt: "Sunlance Scout" },
    { id: "enemy-3", art: "/assets/cards/beacon-monk.png", alt: "Beacon Monk" },
    { id: "enemy-4", art: "/assets/cards/crystal-acolyte.png", alt: "Crystal Acolyte" },
    { id: "enemy-5", art: "/assets/cards/seraphic-warden.png", alt: "Seraphic Warden" },
  ]);
  const [enemyDrawIndex, setEnemyDrawIndex] = useState(5);
  const [enemyDrag, setEnemyDrag] = useState<DragVisual | null>(null);
  const [enemyDragPos, setEnemyDragPos] = useState<{ x: number; y: number } | null>(null);
  const enemyDragFrameRef = useRef<number | null>(null);

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
  const drawOrder = useMemo(
    () => [
      { art: "/assets/cards/sunlance-champion.png", alt: "Sunlance Champion" },
      { art: "/assets/cards/sunlance-scout.png", alt: "Sunlance Scout" },
      { art: "/assets/cards/beacon-monk.png", alt: "Beacon Monk" },
      { art: "/assets/cards/crystal-acolyte.png", alt: "Crystal Acolyte" },
      { art: "/assets/cards/seraphic-warden.png", alt: "Seraphic Warden" },
      { art: "/assets/cards/sunlance-champion.png", alt: "Sunlance Champion" },
      { art: "/assets/cards/sunlance-scout.png", alt: "Sunlance Scout" },
      { art: "/assets/cards/beacon-monk.png", alt: "Beacon Monk" },
      { art: "/assets/cards/crystal-acolyte.png", alt: "Crystal Acolyte" },
      { art: "/assets/cards/seraphic-warden.png", alt: "Seraphic Warden" },
    ],
    []
  );
  const enemyCardBackSize = { width: 140, height: 210 };

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

  const layoutPlayerMinions = (minions: MinionData[]) => {
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

  const layoutEnemyMinions = (minions: MinionData[]) => {
    const slots = getLaneSlots(enemyLane, Math.max(1, minions.length));
    return minions.map((minion, index) => ({ ...minion, slot: slots[index] }));
  };

  const getEnemyHandSlot = (index: number) => ({
    x: BoardSlots.EnemyHand.x + index * 105,
    y: BoardSlots.EnemyHand.y,
  });

  useEffect(() => {
    if (!draggingId) return;
    const handlePointerUp = () => {
      const dragged = handCards.find((card) => card.id === draggingId);
      if (dragged) {
        if (isCursorInPlayerLane && playerMinions.length < 7 && insertionIndex !== null) {
          setPlayerMinions((prev) => {
            const next = [...prev];
            next.splice(insertionIndex, 0, {
              id: `minion-${Date.now()}-${dragged.id}`,
              art: dragged.art,
              alt: dragged.alt,
            });
            return next;
          });
          setHandCards((prev) => prev.filter((card) => card.id !== draggingId));
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
    playerMinions.length,
  ]);

  const handleDragStart = (id: string, slotX: number, slotY: number) => {
    setDraggingId(id);
    setDragOffset({ x: cursor.x - slotX, y: cursor.y - slotY });
  };

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

  useEffect(() => {
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
  }, [turn]);

  useEffect(() => {
    const prevTurn = prevTurnRef.current;
    if (prevTurn === "player" && turn === "enemy") {
      roundPendingRef.current = true;
    }
    if (prevTurn === "enemy" && turn === "player" && roundPendingRef.current) {
      setSharedMana((prev) => Math.min(10, prev + 1));
      roundPendingRef.current = false;
    }
    if (prevTurn === "enemy" && turn === "player") {
      setHandCards((prev) => {
        if (prev.length >= maxHandSize) return prev;
        const nextCard = drawOrder[playerDrawIndex % drawOrder.length];
        const nextId = `hand-${Date.now()}-${playerDrawIndex}`;
        setPlayerDrawIndex((index) => index + 1);
        return [
          ...prev,
          {
            id: nextId,
            slot: prev[0]?.slot ?? { x: BoardSlots.Hand.x, y: BoardSlots.Hand.y },
            rotation: 0,
            art: nextCard.art,
            alt: nextCard.alt,
          },
        ];
      });
    }
    if (prevTurn === "player" && turn === "enemy") {
      setEnemyHand((prev) => {
        if (prev.length >= maxHandSize) return prev;
        const nextCard = drawOrder[enemyDrawIndex % drawOrder.length];
        const nextId = `enemy-${Date.now()}-${enemyDrawIndex}`;
        setEnemyDrawIndex((index) => index + 1);
        return [...prev, { id: nextId, art: nextCard.art, alt: nextCard.alt }];
      });
    }
    prevTurnRef.current = turn;
  }, [turn, drawOrder, enemyDrawIndex, maxHandSize, playerDrawIndex]);


  useEffect(() => {
    if (turn !== "enemy") return;
    if (enemyHand.length === 0 || enemyMinions.length >= 7 || enemyDrag) return;
    const playTimeout = window.setTimeout(() => {
      const card = enemyHand[0];
      const start = getEnemyHandSlot(0);
      const targetSlots = getLaneSlots(enemyLane, enemyMinions.length + 1);
      const target = targetSlots[enemyMinions.length];
      const end = {
        x: target.x + (minionSize - enemyCardBackSize.width) / 2,
        y: target.y + (minionSize - enemyCardBackSize.height) / 2,
      };
      setEnemyHand((prev) => prev.slice(1));
      setEnemyDrag({
        id: `enemy-drag-${Date.now()}`,
        art: card.art,
        alt: card.alt,
        start,
        end,
        startTime: performance.now(),
        durationMs: 700,
      });
      setEnemyDragPos(start);
    }, 2500);
    return () => window.clearTimeout(playTimeout);
  }, [enemyDrag, enemyHand, enemyMinions.length, turn]);


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
        setEnemyMinions((prev) => [
          ...prev,
          { id: `enemy-minion-${Date.now()}`, art: enemyDrag.art, alt: enemyDrag.alt },
        ]);
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
    if (!targetingFrom) return;
    const handlePointerUp = () => {
      setTargetingFrom(null);
      setTargetingToId(null);
      setTargetingToHero(null);
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [targetingFrom]);

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

  const handleEndTurn = () => {
    if (turn !== "player") return;
    setTurn("enemy");
  };

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
        onTargetEnter={() => {
          if (targetingFrom) {
            setTargetingToHero({ id: "enemy-hero", x: enemyHeroCenter.x, y: enemyHeroCenter.y });
          }
        }}
        onTargetLeave={() => {
          if (targetingToHero?.id === "enemy-hero") {
            setTargetingToHero(null);
          }
        }}
      />
      <HeroSlot
        slot={{ x: BoardSlots.HeroBottom.x + 58, y: BoardSlots.HeroBottom.y - 45 }}
        portraitSrc="/assets/heroes/lyra.png"
        frameSrc="/assets/ui/frames/player-frame.png"
        alt="Player hero"
        onTargetStart={(event) => {
          setTargetingFrom({
            id: "player-hero",
            x: playerHeroCenter.x,
            y: playerHeroCenter.y,
          });
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onTargetEnter={() => {
          if (targetingFrom) {
            setTargetingToHero({ id: "player-hero", x: playerHeroCenter.x, y: playerHeroCenter.y });
          }
        }}
        onTargetLeave={() => {
          if (targetingToHero?.id === "player-hero") {
            setTargetingToHero(null);
          }
        }}
      />
      <ManaBar current={sharedMana} max={10} />
      <EndTurnButton slot={BoardSlots.EndTurn} isActive={turn === "player"} onEndTurn={handleEndTurn} />
      <AbilityFrame
        slot={BoardSlots.AbilityFrame}
        iconSrc="/assets/ui/hero powers/hp-lyra-vt.png"
        iconAlt="Lyra hero power"
      />
      <AbilityFrame
        slot={BoardSlots.EnemyAbilityFrame}
        iconSrc="/assets/ui/hero powers/hp-tharos-ec.png"
        iconAlt="Tharos hero power"
      />
      <div className="combat-lane combat-lane--enemy" />
      <div className="combat-lane combat-lane--player" />
      {layoutHand(handCards).map((card) => {
        const slot = getHandSlot(card.id, card.slot.x, card.slot.y);
        return (
          <HandCard
            key={card.id}
            slot={slot}
            artSrc={card.art}
            alt={card.alt}
            rotation={draggingId === card.id ? 0 : card.rotation}
            isDragging={draggingId === card.id}
            onDragStart={() => handleDragStart(card.id, card.slot.x, card.slot.y)}
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
      <GraveyardPortal center={BoardSlots.Graveyard} />
      {ghostSlot && draggingCard && (
        <BoardMinion slot={ghostSlot} artSrc={draggingCard.art} alt={draggingCard.alt} isGhost />
      )}
      {playerMinionLayout.map((minion) => (
        <BoardMinion
          key={minion.id}
          slot={minion.slot}
          artSrc={minion.art}
          alt={minion.alt}
          onTargetStart={() => {
            setTargetingFrom({
              id: minion.id,
              x: minion.slot.x + minionSize / 2,
              y: minion.slot.y + minionSize / 2,
            });
          }}
        />
      ))}
      {enemyMinionLayout.map((minion) => (
        <BoardMinion
          key={minion.id}
          slot={minion.slot}
          artSrc={minion.art}
          alt={minion.alt}
          onTargetEnter={() => {
            if (targetingFrom) {
              setTargetingToId(minion.id);
            }
          }}
          onTargetLeave={() => {
            if (targetingToId === minion.id) {
              setTargetingToId(null);
            }
          }}
        />
      ))}
      {targetingFrom && targetingEnd && (
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
            x1={targetingFrom.x}
            y1={targetingFrom.y}
            x2={targetingEnd.x}
            y2={targetingEnd.y}
            stroke="rgba(120, 180, 255, 0.9)"
            strokeWidth="6"
            strokeLinecap="round"
            markerEnd="url(#target-arrowhead)"
          />
        </svg>
      )}

      <CursorCoords turn={turn} timeLeftMs={turnTimeLeftMs} mana={sharedMana} manaMax={10} />
      <BoardCursor />
    </div>
  );
};

export default BoardStage;
