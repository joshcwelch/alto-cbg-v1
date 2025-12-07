import { motion } from "framer-motion";
import { useGameStore } from "../state/useGameStore";
import type { CardDef } from "../core/cardTypes";

const CARD_WIDTH = 120;
const CARD_HEIGHT = 170;
const CARD_SCALE = 0.9;
const HOVER_SCALE = CARD_SCALE * 1.08;
const TAP_SCALE = CARD_SCALE * 0.96;

interface CardProps {
  card: CardDef;
  xOffset: number;
}

export default function Card({ card, xOffset }: CardProps) {
  const playCard = useGameStore(s => s.playCard);
  const mana = useGameStore(s => s.playerMana);
  const canPlay = mana >= card.cost;

  return (
    <motion.div
      layout
      onClick={() => canPlay && playCard(card.id)}
      whileHover={{ y: -16, scale: HOVER_SCALE }}
      whileTap={{ scale: TAP_SCALE }}
      transition={{ type: "spring", stiffness: 320, damping: 26, mass: 0.9 }}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: canPlay ? "#ffffff" : "#d9dde6",
        borderRadius: 12,
        padding: 8,
        position: "absolute",
        left: "50%",
        bottom: 0,
        x: xOffset - CARD_WIDTH / 2,
        y: -8,
        scale: CARD_SCALE,
        boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
        cursor: canPlay ? "pointer" : "not-allowed",
        border: "2px solid #2a2f45"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: "#3ea6ff",
          color: "white", fontWeight: 800, display: "grid", placeItems: "center"
        }}>{card.cost}</div>
        <div style={{ fontWeight: 800 }}>{card.name}</div>
      </div>
      <div style={{ fontSize: 12, color: "#333", minHeight: 60 }}>{card.description ?? "\u00A0"}</div>
      <div style={{ position: "absolute", bottom: 8, left: 8, fontWeight: 800 }}>ATK {card.attack}</div>
      <div style={{ position: "absolute", bottom: 8, right: 8, fontWeight: 800 }}>HP {card.health}</div>
    </motion.div>
  );
}
