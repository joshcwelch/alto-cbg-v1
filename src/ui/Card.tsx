import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "../state/useGameStore";
import type { CardDef } from "../core/cardTypes";
import { LANE_HEIGHT_RATIO } from "./boardAnchors";

const CARD_ASPECT = 915 / 1390;
const CARD_PADDING_MIN = 10;
const CARD_PADDING_MAX = 18;

function computeCardSize(viewportHeight: number) {
  const laneHeight = viewportHeight * LANE_HEIGHT_RATIO;
  const target = laneHeight * 0.92;
  const cardHeight = Math.min(Math.max(target, 148), Math.max(laneHeight * 1.05, 228));
  const cardWidth = cardHeight * CARD_ASPECT;
  return { cardHeight, cardWidth };
}

export default function Card({ card }: { card: CardDef }) {
  const playCard = useGameStore(s => s.playCard);
  const mana = useGameStore(s => s.playerMana);
  const canPlay = mana >= card.cost;
  const [size, setSize] = useState(() => computeCardSize(typeof window !== "undefined" ? window.innerHeight : 900));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = () => setSize(computeCardSize(window.innerHeight));
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const padding = useMemo(
    () => Math.min(Math.max(size.cardHeight * 0.08, CARD_PADDING_MIN), CARD_PADDING_MAX),
    [size.cardHeight]
  );

  return (
    <motion.div
      layout
      whileHover={{
        scale: 1.03,
        y: -12,
        zIndex: 4,
        filter: "drop-shadow(0 14px 32px rgba(0,0,0,0.45))",
        transition: { type: "spring", stiffness: 320, damping: 28 }
      }}
      whileTap={{ scale: 1.1, y: -18, zIndex: 6 }}
      onClick={() => canPlay && playCard(card.id)}
      style={{
        width: `${size.cardWidth}px`,
        height: `${size.cardHeight}px`,
        background: canPlay
          ? "linear-gradient(145deg, #f5f7fb 0%, #e5ecf9 50%, #d7e3ff 100%)"
          : "linear-gradient(145deg, #c7cedc 0%, #bfc7d8 60%, #aeb7cb 100%)",
        borderRadius: 12,
        padding,
        position: "relative",
        boxShadow: "0 10px 26px rgba(0,0,0,0.4)",
        cursor: canPlay ? "pointer" : "not-allowed",
        border: "2px solid #2a2f45",
        display: "flex",
        flexDirection: "column",
        gap: 8
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, background: "#3ea6ff",
          color: "white", fontWeight: 800, display: "grid", placeItems: "center"
        }}>{card.cost}</div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{card.name}</div>
      </div>
      <div style={{ flex: 1, fontSize: 13, color: "#333" }}>{card.description ?? "\u00A0"}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
        <span>ATK {card.attack}</span>
        <span>HP {card.health}</span>
      </div>
    </motion.div>
  );
}
